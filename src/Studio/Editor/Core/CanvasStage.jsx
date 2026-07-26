import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Layer, Rect, Stage } from "react-konva";

import CanvasGuides from "./CanvasGuides";
import CanvasTransformer from "./CanvasTransformer";
import ImageElement from "../Elements/ImageElement";
import IconElement from "../Elements/IconElement";
import LineElement from "../Elements/LineElement";
import LogoElement from "../Elements/LogoElement";
import ShapeElement from "../Elements/ShapeElement";
import StickerElement from "../Elements/StickerElement";
import SafeMarginGuides from "./SafeMarginGuides";
import TextElement from "../Elements/TextElement";
import { ELEMENT_TYPES } from "../Utils/constants";
import { getSnapResult } from "../Utils/snapUtils";

function getBackgroundProps(background, width, height) {
  if (background?.type === "linear") {
    const colors =
      background.colors || ["#0f172a", "#312e81"];

    const stops =
      background.stops ||
      colors.map(
        (_, index) =>
          index / Math.max(1, colors.length - 1)
      );

    const colorStops = [];

    colors.forEach((color, index) => {
      colorStops.push(
        stops[index] ??
          index / Math.max(1, colors.length - 1)
      );

      colorStops.push(color);
    });

    return {
      fillLinearGradientStartPoint: {
        x: 0,
        y: 0,
      },
      fillLinearGradientEndPoint: {
        x: width,
        y: height,
      },
      fillLinearGradientColorStops: colorStops,
    };
  }

  return {
    fill: background?.color || "#0f172a",
  };
}

const CanvasStage = forwardRef(function CanvasStage(
  {
    project,
    zoom = 1,
    selectedId,
    editingImageId,
    onSelect,
    onEditImage,
    onElementChange,
    showSafeMargins = false,
    safeMargin = 80,
  },
  ref
) {
  const stageRef = useRef(null);
  const textareaRef = useRef(null);

  const [guides, setGuides] = useState({
    vertical: [],
    horizontal: [],
  });

  const [editingTextId, setEditingTextId] =
    useState("");

  const [textDraft, setTextDraft] =
    useState("");

  useImperativeHandle(ref, () => ({
    getStage: () => stageRef.current,

    clearSelection: () => {
      finishTextEditing();
      onSelect("");
    },
  }));

  const selectedElement = useMemo(
    () =>
      project.elements.find(
        (item) => item.id === selectedId
      ) || null,
    [project.elements, selectedId]
  );

  const editingTextElement = useMemo(
    () =>
      project.elements.find(
        (item) => item.id === editingTextId
      ) || null,
    [project.elements, editingTextId]
  );

  useEffect(() => {
    if (!editingTextId) return;

    window.setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    }, 20);
  }, [editingTextId]);

  useEffect(() => {
    function onKeyDown(event) {
      if (
        editingTextId ||
        !selectedElement ||
        selectedElement.locked ||
        selectedElement.hidden
      ) {
        return;
      }

      const tag =
        document.activeElement?.tagName;

      if (
        ["INPUT", "TEXTAREA", "SELECT"].includes(tag)
      ) {
        return;
      }

      const step =
        event.shiftKey ? 10 : 1;

      let x =
        Number(selectedElement.x || 0);

      let y =
        Number(selectedElement.y || 0);

      if (event.key === "ArrowLeft") {
        x -= step;
      } else if (event.key === "ArrowRight") {
        x += step;
      } else if (event.key === "ArrowUp") {
        y -= step;
      } else if (event.key === "ArrowDown") {
        y += step;
      } else {
        return;
      }

      event.preventDefault();

      onElementChange(
        selectedElement.id,
        {
          x,
          y,
        }
      );
    }

    window.addEventListener(
      "keydown",
      onKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        onKeyDown
      );
    };
  }, [
    selectedElement,
    editingTextId,
    onElementChange,
  ]);

  function startTextEditing(elementId) {
    const element =
      project.elements.find(
        (item) =>
          item.id === elementId
      );

    if (
      !element ||
      element.type !== ELEMENT_TYPES.TEXT ||
      element.locked
    ) {
      return;
    }

    onSelect(element.id);
    onEditImage("");

    setTextDraft(
      String(element.text || "")
    );

    setEditingTextId(
      element.id
    );
  }

  function finishTextEditing() {
    if (!editingTextId) return;

    onElementChange(
      editingTextId,
      {
        text:
          textDraft.trim() ||
          "Nuevo texto",
      }
    );

    setEditingTextId("");
    setTextDraft("");
  }

  function cancelTextEditing() {
    setEditingTextId("");
    setTextDraft("");
  }

  function handleDragMove(event) {
    const node = event.target;

    if (
      !node.hasName("canvas-element")
    ) {
      return;
    }

    if (
      editingImageId === node.id()
    ) {
      return;
    }

    const element =
      project.elements.find(
        (item) =>
          item.id === node.id()
      );

    if (!element) return;

    const snap =
      getSnapResult({
        element,
        x: node.x(),
        y: node.y(),
        stageWidth: project.width,
        stageHeight: project.height,
      });

    node.position({
      x: snap.x,
      y: snap.y,
    });

    setGuides({
      vertical: snap.vertical,
      horizontal: snap.horizontal,
    });
  }

  return (
    <div
      className="relative"
      style={{
        width: project.width * zoom,
        height: project.height * zoom,
      }}
    >
      <Stage
        ref={stageRef}
        width={project.width * zoom}
        height={project.height * zoom}
        scaleX={zoom}
        scaleY={zoom}
        onMouseDown={(event) => {
          if (
            event.target ===
            event.target.getStage()
          ) {
            finishTextEditing();
            onSelect("");
            onEditImage("");
          }
        }}
        onTouchStart={(event) => {
          if (
            event.target ===
            event.target.getStage()
          ) {
            finishTextEditing();
            onSelect("");
            onEditImage("");
          }
        }}
        onDragMove={handleDragMove}
        onDragEnd={() =>
          setGuides({
            vertical: [],
            horizontal: [],
          })
        }
      >
        <Layer>
          <Rect
            x={0}
            y={0}
            width={project.width}
            height={project.height}
            {...getBackgroundProps(
              project.background,
              project.width,
              project.height
            )}
            listening={false}
          />

          {project.elements.map(
            (element) => {
              if (
                element.type ===
                ELEMENT_TYPES.TEXT
              ) {
                const isEditing =
                  editingTextId ===
                  element.id;

                return (
                  <TextElement
                    key={element.id}
                    element={{
                      ...element,
                      opacity: isEditing
                        ? 0
                        : element.opacity,
                    }}
                    onSelect={onSelect}
                    onEditStart={
                      startTextEditing
                    }
                    onChange={(changes) =>
                      onElementChange(
                        element.id,
                        changes
                      )
                    }
                  />
                );
              }

              if (
                element.type ===
                ELEMENT_TYPES.ICON
              ) {
                return (
                  <IconElement
                    key={element.id}
                    element={element}
                    onSelect={onSelect}
                    onChange={(changes) =>
                      onElementChange(
                        element.id,
                        changes
                      )
                    }
                  />
                );
              }

              if (
                element.type ===
                ELEMENT_TYPES.STICKER
              ) {
                return (
                  <StickerElement
                    key={element.id}
                    element={element}
                    onSelect={onSelect}
                    onChange={(changes) =>
                      onElementChange(
                        element.id,
                        changes
                      )
                    }
                  />
                );
              }

              if (
                element.type ===
                ELEMENT_TYPES.LINE
              ) {
                return (
                  <LineElement
                    key={element.id}
                    element={element}
                    onSelect={onSelect}
                    onChange={(changes) =>
                      onElementChange(
                        element.id,
                        changes
                      )
                    }
                  />
                );
              }

              if (
                element.type ===
                ELEMENT_TYPES.SHAPE
              ) {
                return (
                  <ShapeElement
                    key={element.id}
                    element={element}
                    onSelect={onSelect}
                    onChange={(changes) =>
                      onElementChange(
                        element.id,
                        changes
                      )
                    }
                  />
                );
              }

              const common = {
                element,
                selected:
                  selectedId ===
                  element.id,
                editing:
                  editingImageId ===
                  element.id,
                onSelect,
                onEditStart:
                  onEditImage,
                onChange: (changes) =>
                  onElementChange(
                    element.id,
                    changes
                  ),
              };

              if (
                element.type ===
                ELEMENT_TYPES.LOGO
              ) {
                return (
                  <LogoElement
                    key={element.id}
                    {...common}
                  />
                );
              }

              return (
                <ImageElement
                  key={element.id}
                  {...common}
                />
              );
            }
          )}

          <SafeMarginGuides
            margin={safeMargin}
            width={project.width}
            height={project.height}
            visible={showSafeMargins}
          />

          <CanvasGuides
            guides={guides}
            width={project.width}
            height={project.height}
          />

          <CanvasTransformer
            stageRef={stageRef}
            selectedId={
              editingTextId
                ? ""
                : selectedId
            }
            selectedElement={
              editingTextId
                ? null
                : selectedElement
            }
            editingImageId={
              editingImageId
            }
          />
        </Layer>
      </Stage>

      {editingTextElement && (
        <textarea
          ref={textareaRef}
          value={textDraft}
          onChange={(event) =>
            setTextDraft(
              event.target.value
            )
          }
          onBlur={finishTextEditing}
          onKeyDown={(event) => {
            if (
              event.key === "Escape"
            ) {
              event.preventDefault();
              cancelTextEditing();
            }

            if (
              event.key === "Enter" &&
              (event.ctrlKey ||
                event.metaKey)
            ) {
              event.preventDefault();
              finishTextEditing();
            }
          }}
          style={{
            position: "absolute",
            left:
              editingTextElement.x *
              zoom,
            top:
              editingTextElement.y *
              zoom,
            width:
              editingTextElement.width *
              zoom,
            minHeight:
              editingTextElement.height *
              zoom,
            fontSize:
              editingTextElement.fontSize *
              zoom,
            fontFamily:
              editingTextElement.fontFamily,
            fontWeight:
              String(
                editingTextElement.fontStyle ||
                  ""
              ).includes("bold")
                ? "700"
                : "400",
            fontStyle:
              String(
                editingTextElement.fontStyle ||
                  ""
              ).includes("italic")
                ? "italic"
                : "normal",
            lineHeight:
              editingTextElement.lineHeight ||
              1.05,
            letterSpacing:
              `${
                Number(
                  editingTextElement.letterSpacing ||
                    0
                ) * zoom
              }px`,
            color:
              editingTextElement.fill ||
              "#ffffff",
            textAlign:
              editingTextElement.align ||
              "left",
            opacity:
              editingTextElement.opacity ??
              1,
            transform: `rotate(${
              editingTextElement.rotation ||
              0
            }deg)`,
            transformOrigin:
              "top left",
            background:
              "rgba(15,23,42,0.18)",
            border:
              "2px solid #2563eb",
            borderRadius: "8px",
            padding: "4px",
            margin: 0,
            resize: "none",
            overflow: "hidden",
            outline: "none",
            zIndex: 30,
          }}
        />
      )}
    </div>
  );
});

export default CanvasStage;