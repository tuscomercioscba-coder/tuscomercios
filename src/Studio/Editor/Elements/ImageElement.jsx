import { useEffect, useMemo, useRef, useState } from "react";
import Konva from "konva";
import { Group, Image as KonvaImage, Rect, Text } from "react-konva";

import { calculateImageLayout } from "../Utils/imageUtils";
import { buildKonvaFilters, getImageFilterProps } from "../Utils/filterUtils";

export default function ImageElement({ element, selected, editing, onSelect, onEditStart, onChange }) {
  const [image, setImage] = useState(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (!element.src) { setImage(null); return; }
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setImage(img);
    img.onerror = () => setImage(null);
    img.src = element.src;
  }, [element.src]);

  const frameWidth = Math.max(1, Number(element.width) || 1);
  const frameHeight = Math.max(1, Number(element.height) || 1);

  const layout = useMemo(() => calculateImageLayout({
    image,
    frameWidth,
    frameHeight,
    fit: element.fit,
    imageScale: element.imageScale,
    cropOffsetX: element.cropOffsetX,
    cropOffsetY: element.cropOffsetY,
  }), [image, frameWidth, frameHeight, element.fit, element.imageScale, element.cropOffsetX, element.cropOffsetY]);

  useEffect(() => {
    const node = imageRef.current;
    if (!node || !image) return;
    node.cache({ pixelRatio: 1 });
    node.getLayer()?.batchDraw();
    return () => { try { node.clearCache(); } catch {} };
  }, [image, layout?.x, layout?.y, layout?.width, layout?.height, element.brightness, element.contrast, element.saturation, element.blur, element.grayscale]);

  function select(event) { event.cancelBubble = true; onSelect(element.id); }

  const imageRotation = Number(element.imageRotation || 0);
  const flipX = element.flipX ? -1 : 1;
  const flipY = element.flipY ? -1 : 1;
  const imageCenterX = layout ? layout.x + layout.width / 2 : 0;
  const imageCenterY = layout ? layout.y + layout.height / 2 : 0;

  return (
    <Group
      id={element.id}
      name="canvas-element"
      x={element.x}
      y={element.y}
      width={frameWidth}
      height={frameHeight}
      rotation={element.rotation || 0}
      opacity={element.opacity ?? 1}
      draggable={!element.locked && !editing}
      visible={!element.hidden}
      clipX={0}
      clipY={0}
      clipWidth={frameWidth}
      clipHeight={frameHeight}
      shadowEnabled={element.shadowEnabled}
      shadowColor={element.shadowColor}
      shadowOpacity={element.shadowOpacity}
      shadowBlur={element.shadowBlur}
      shadowOffsetX={element.shadowOffsetX}
      shadowOffsetY={element.shadowOffsetY}
      onClick={select}
      onTap={select}
      onDblClick={() => onEditStart(element.id)}
      onDblTap={() => onEditStart(element.id)}
      onDragEnd={(event) => onChange({ x: event.target.x(), y: event.target.y() })}
      onTransformEnd={(event) => {
        const node = event.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1); node.scaleY(1);
        onChange({
          x: node.x(), y: node.y(),
          width: Math.max(40, frameWidth * scaleX),
          height: Math.max(40, frameHeight * scaleY),
          rotation: node.rotation(),
        });
      }}
    >
      <Rect
        width={frameWidth}
        height={frameHeight}
        fill={element.backgroundColor !== "transparent" ? element.backgroundColor : "rgba(255,255,255,0.001)"}
        cornerRadius={Number(element.cornerRadius) || 0}
        listening={false}
      />

      {image && layout ? (
        <KonvaImage
          ref={imageRef}
          image={image}
          x={imageCenterX}
          y={imageCenterY}
          offsetX={layout.width / 2}
          offsetY={layout.height / 2}
          width={layout.width}
          height={layout.height}
          rotation={imageRotation}
          scaleX={flipX}
          scaleY={flipY}
          filters={buildKonvaFilters(Konva, element)}
          {...getImageFilterProps(element)}
          cornerRadius={Number(element.cornerRadius) || 0}
          draggable={editing}
          listening
          onClick={select}
          onTap={select}
          onWheel={(event) => {
            if (!editing) return;
            event.evt.preventDefault();
            event.cancelBubble = true;
            const direction = event.evt.deltaY > 0 ? -0.05 : 0.05;
            onChange({ imageScale: Math.min(3, Math.max(0.5, Number(element.imageScale || 1) + direction)) });
          }}
          onDragEnd={(event) => {
            if (!editing) return;
            onChange({
              cropOffsetX: Number(element.cropOffsetX || 0) + event.target.x() - imageCenterX,
              cropOffsetY: Number(element.cropOffsetY || 0) + event.target.y() - imageCenterY,
            });
            event.target.position({ x: imageCenterX, y: imageCenterY });
          }}
        />
      ) : (
        <>
          <Rect
            width={frameWidth}
            height={frameHeight}
            fill="#e2e8f0"
            stroke="#94a3b8"
            strokeWidth={3}
            dash={[14, 10]}
            cornerRadius={Number(element.cornerRadius) || 0}
            listening
            onClick={select}
            onTap={select}
          />
          <Text
            text={element.type === "logo" ? "Subí un logo" : "Subí una imagen"}
            width={frameWidth}
            height={frameHeight}
            align="center"
            verticalAlign="middle"
            fill="#64748b"
            fontSize={Math.max(20, Math.min(38, frameWidth / 8))}
            fontStyle="bold"
            listening={false}
          />
        </>
      )}

      {editing && (
        <Rect
          width={frameWidth}
          height={frameHeight}
          stroke="#22c55e"
          strokeWidth={6}
          dash={[18, 10]}
          cornerRadius={Number(element.cornerRadius) || 0}
          listening={false}
        />
      )}

      {selected && !editing && (
        <Rect
          width={frameWidth}
          height={frameHeight}
          fill="rgba(255,255,255,0.001)"
          cornerRadius={Number(element.cornerRadius) || 0}
          listening
          onClick={select}
          onTap={select}
        />
      )}
    </Group>
  );
}
