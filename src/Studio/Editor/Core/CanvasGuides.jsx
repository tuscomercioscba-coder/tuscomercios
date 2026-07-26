import { Line } from "react-konva";

export default function CanvasGuides({ guides, width, height }) {
  return (
    <>
      {guides.vertical.map((x) => (
        <Line
          key={`v-${x}`}
          points={[x, 0, x, height]}
          stroke="#38bdf8"
          strokeWidth={2}
          dash={[12, 8]}
          listening={false}
        />
      ))}
      {guides.horizontal.map((y) => (
        <Line
          key={`h-${y}`}
          points={[0, y, width, y]}
          stroke="#38bdf8"
          strokeWidth={2}
          dash={[12, 8]}
          listening={false}
        />
      ))}
    </>
  );
}
