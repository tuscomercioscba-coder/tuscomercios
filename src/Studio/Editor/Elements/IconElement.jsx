import { Group, Path, Text } from "react-konva";

export default function IconElement({ element, onSelect, onChange }) {
  const width = Math.max(30, Number(element.width || 160));
  const height = Math.max(30, Number(element.height || 160));

  function finishTransform(event) {
    const node = event.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);

    onChange({
      x: node.x(),
      y: node.y(),
      width: Math.max(30, width * scaleX),
      height: Math.max(30, height * scaleY),
      fontSize: Math.max(
        16,
        Number(element.fontSize || 130) * Math.max(scaleX, scaleY)
      ),
      rotation: node.rotation(),
    });
  }

  const commonProps = {
    id: element.id,
    name: "canvas-element",
    x: element.x,
    y: element.y,
    width,
    height,
    rotation: element.rotation || 0,
    opacity: element.opacity ?? 1,
    draggable: !element.locked,
    visible: !element.hidden,
    onClick: () => onSelect(element.id),
    onTap: () => onSelect(element.id),
    onDragEnd: (event) =>
      onChange({ x: event.target.x(), y: event.target.y() }),
    onTransformEnd: finishTransform,
  };

  if (element.path) {
    const padding = Math.max(2, width * 0.08);
    const drawWidth = Math.max(1, width - padding * 2);
    const drawHeight = Math.max(1, height - padding * 2);

    return (
      <Group {...commonProps}>
        <Path
          x={padding}
          y={padding}
          data={element.path}
          scaleX={drawWidth / 24}
          scaleY={drawHeight / 24}
          stroke={element.fill || "#ffffff"}
          strokeWidth={Number(element.strokeWidth || 1.8) * (24 / drawWidth)}
          lineCap="round"
          lineJoin="round"
          fillEnabled={false}
          shadowEnabled={element.shadowEnabled}
          shadowColor={element.shadowColor}
          shadowOpacity={element.shadowOpacity}
          shadowBlur={element.shadowBlur}
          shadowOffsetX={element.shadowOffsetX}
          shadowOffsetY={element.shadowOffsetY}
          listening={false}
        />
      </Group>
    );
  }

  return (
    <Text
      {...commonProps}
      text={element.symbol || "★"}
      fill={element.fill || "#ffffff"}
      fontSize={element.fontSize || 130}
      align="center"
      verticalAlign="middle"
      shadowEnabled={element.shadowEnabled}
      shadowColor={element.shadowColor}
      shadowOpacity={element.shadowOpacity}
      shadowBlur={element.shadowBlur}
      shadowOffsetX={element.shadowOffsetX}
      shadowOffsetY={element.shadowOffsetY}
    />
  );
}
