import { Rect } from "react-konva";

export default function ShapeElement({ element, onSelect, onChange }) {
  return (
    <Rect
      id={element.id}
      name="canvas-element"
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      fill={element.fill}
      cornerRadius={element.cornerRadius}
      stroke={element.strokeEnabled ? element.stroke : undefined}
      strokeWidth={element.strokeEnabled ? element.strokeWidth : 0}
      rotation={element.rotation}
      opacity={element.opacity}
      shadowEnabled={element.shadowEnabled}
      shadowColor={element.shadowColor}
      shadowOpacity={element.shadowOpacity}
      shadowBlur={element.shadowBlur}
      shadowOffsetX={element.shadowOffsetX}
      shadowOffsetY={element.shadowOffsetY}
      draggable={!element.locked}
      visible={!element.hidden}
      onClick={() => onSelect(element.id)}
      onTap={() => onSelect(element.id)}
      onDragEnd={(event) =>
        onChange({ x: event.target.x(), y: event.target.y() })
      }
      onTransformEnd={(event) => {
        const node = event.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);

        onChange({
          x: node.x(),
          y: node.y(),
          width: Math.max(30, node.width() * scaleX),
          height: Math.max(30, node.height() * scaleY),
          rotation: node.rotation(),
        });
      }}
    />
  );
}
