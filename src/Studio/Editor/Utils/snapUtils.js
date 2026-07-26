const SNAP_DISTANCE = 10;

export function getSnapResult({ element, x, y, stageWidth, stageHeight }) {
  const width = Number(element.width || 0);
  const height = Number(element.height || 0);

  const verticalTargets = [0, stageWidth / 2, stageWidth];
  const horizontalTargets = [0, stageHeight / 2, stageHeight];

  const xPoints = [
    { value: x, offset: 0 },
    { value: x + width / 2, offset: width / 2 },
    { value: x + width, offset: width },
  ];

  const yPoints = [
    { value: y, offset: 0 },
    { value: y + height / 2, offset: height / 2 },
    { value: y + height, offset: height },
  ];

  let nextX = x;
  let nextY = y;
  const vertical = [];
  const horizontal = [];

  for (const target of verticalTargets) {
    for (const point of xPoints) {
      if (Math.abs(point.value - target) <= SNAP_DISTANCE) {
        nextX = target - point.offset;
        vertical.push(target);
        break;
      }
    }
  }

  for (const target of horizontalTargets) {
    for (const point of yPoints) {
      if (Math.abs(point.value - target) <= SNAP_DISTANCE) {
        nextY = target - point.offset;
        horizontal.push(target);
        break;
      }
    }
  }

  return {
    x: nextX,
    y: nextY,
    vertical: [...new Set(vertical)],
    horizontal: [...new Set(horizontal)],
  };
}
