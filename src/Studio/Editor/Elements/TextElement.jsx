import { Text } from "react-konva";

export default function TextElement({
  element,
  onSelect,
  onChange,
  onEditStart,
}) {
  function select(event) {
    event.cancelBubble = true;
    onSelect(element.id);
  }

  return (
    <Text
      id={element.id}
      name="canvas-element"
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      text={element.text}
      fontSize={element.fontSize}
      fontFamily={element.fontFamily}
      fontStyle={element.fontStyle}
      fill={element.fill}
      align={element.align}
      lineHeight={element.lineHeight}
      letterSpacing={element.letterSpacing}
      rotation={element.rotation}
      opacity={element.opacity}
      shadowEnabled={element.shadowEnabled}
      shadowColor={element.shadowColor}
      shadowOpacity={element.shadowOpacity}
      shadowBlur={element.shadowBlur}
      shadowOffsetX={element.shadowOffsetX}
      shadowOffsetY={element.shadowOffsetY}
      strokeEnabled={element.strokeEnabled}
      stroke={element.stroke}
      strokeWidth={
        element.strokeEnabled
          ? element.strokeWidth
          : 0
      }
      draggable={!element.locked}
      visible={!element.hidden}
      onClick={select}
      onTap={select}
      onDblClick={() =>
        onEditStart?.(element.id)
      }
      onDblTap={() =>
        onEditStart?.(element.id)
      }
      onDragEnd={(event) =>
        onChange({
          x: event.target.x(),
          y: event.target.y(),
        })
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
          width: Math.max(
            40,
            node.width() * scaleX
          ),
          height: Math.max(
            30,
            node.height() * scaleY
          ),
          rotation: node.rotation(),
        });
      }}
    />
  );
}