import { useEffect, useRef } from "react";
import { Transformer } from "react-konva";

export default function CanvasTransformer({
  stageRef,
  selectedId,
  selectedElement,
  editingImageId,
}) {
  const transformerRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    const transformer = transformerRef.current;

    if (
      !stage ||
      !transformer ||
      !selectedId ||
      !selectedElement ||
      selectedElement.locked ||
      selectedElement.hidden ||
      editingImageId === selectedId
    ) {
      transformer?.nodes([]);
      transformer?.getLayer()?.batchDraw();
      return;
    }

    const node = stage.findOne(`#${selectedId}`);
    if (node) {
      transformer.nodes([node]);
      transformer.getLayer()?.batchDraw();
    }
  }, [stageRef, selectedId, selectedElement, editingImageId]);

  return (
    <Transformer
      ref={transformerRef}
      rotateEnabled
      flipEnabled={false}
      anchorSize={16}
      borderStroke="#2563eb"
      borderStrokeWidth={2}
      anchorStroke="#2563eb"
      anchorStrokeWidth={2}
      anchorFill="#ffffff"
      keepRatio={selectedElement?.type !== "text"}
      boundBoxFunc={(oldBox, newBox) => {
        if (Math.abs(newBox.width) < 30 || Math.abs(newBox.height) < 30) {
          return oldBox;
        }
        return newBox;
      }}
    />
  );
}
