export function buildProjectTimeline(clips = []) {
  let projectCursor = 0;

  return clips.map((clip, index) => {
    const sourceStart = Number(clip.start || 0);
    const sourceEnd = Math.max(
      sourceStart,
      Number(clip.end || sourceStart)
    );

    const duration = Math.max(
      0,
      sourceEnd - sourceStart
    );

    const item = {
      ...clip,
      index,
      sourceStart,
      sourceEnd,
      duration,
      projectStart: projectCursor,
      projectEnd: projectCursor + duration,
    };

    projectCursor += duration;

    return item;
  });
}

export function projectTimeToClip(
  clips = [],
  projectTime = 0
) {
  const timeline =
    buildProjectTimeline(clips);

  if (!timeline.length) {
    return null;
  }

  const totalDuration =
    timeline[
      timeline.length - 1
    ].projectEnd;

  const safeTime = Math.max(
    0,
    Math.min(
      Number(projectTime || 0),
      totalDuration
    )
  );

  const active =
    timeline.find(
      (clip) =>
        safeTime >= clip.projectStart &&
        safeTime < clip.projectEnd
    ) ||
    timeline[
      timeline.length - 1
    ];

  const localTime = Math.max(
    0,
    Math.min(
      active.duration,
      safeTime - active.projectStart
    )
  );

  return {
    clip: active,
    projectTime: safeTime,
    localTime,
    sourceTime:
      active.sourceStart +
      localTime,
    totalDuration,
  };
}

export function sourceTimeToProjectTime(
  clips = [],
  clipId,
  sourceTime
) {
  const timeline =
    buildProjectTimeline(clips);

  const clip =
    timeline.find(
      (item) => item.id === clipId
    );

  if (!clip) return 0;

  const local = Math.max(
    0,
    Math.min(
      clip.duration,
      Number(sourceTime || 0) -
        clip.sourceStart
    )
  );

  return clip.projectStart + local;
}
