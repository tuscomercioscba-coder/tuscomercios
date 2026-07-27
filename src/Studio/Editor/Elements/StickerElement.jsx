import { Group, Rect, Text } from "react-konva";

export default function StickerElement({ element, onSelect, onChange }) {
  const width = Math.max(60, Number(element.width || 280));
  const height = Math.max(30, Number(element.height || 100));

  return (
    <Group
      id={element.id}
      name="canvas-element"
      x={element.x}
      y={element.y}
      width={width}
      height={height}
      rotation={element.rotation || 0}
      opacity={element.opacity ?? 1}
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
          width: Math.max(60, width * scaleX),
          height: Math.max(30, height * scaleY),
          rotation: node.rotation(),
        });
      }}
    >
      <Rect
        width={width}
        height={height}
        fill={element.fill || "#2563eb"}
        cornerRadius={Number(element.cornerRadius ?? 999)}
        stroke={element.stroke || "rgba(255,255,255,.2)"}
        strokeWidth={Number(element.strokeWidth || 0)}
        shadowEnabled={element.shadowEnabled !== false}
        shadowColor={element.shadowColor || "#0f172a"}
        shadowOpacity={element.shadowOpacity ?? 0.2}
        shadowBlur={element.shadowBlur ?? 16}
        shadowOffsetY={element.shadowOffsetY ?? 7}
      />
      <Text
        width={width}
        height={height}
        padding={Math.max(8, height * 0.12)}
        text={element.text || "NUEVO"}
        fill={element.color || "#ffffff"}
        fontSize={element.fontSize || 42}
        fontFamily={element.fontFamily || "Arial"}
        fontStyle="bold"
        letterSpacing={element.letterSpacing ?? 1}
        align="center"
        verticalAlign="middle"
        listening={false}
      />
    </Group>
  );
}
