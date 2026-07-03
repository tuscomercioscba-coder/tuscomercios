export function getReelTimeline(plan = "free") {
  const normalizedPlan = String(plan || "free").toLowerCase();

  if (normalizedPlan === "premium") {
    return {
      duration: 20,
      steps: {
        homeEnd: 0.18,
        resultsEnd: 0.30,
        businessEnd: 0.86,
      },
      scrollAmount: 1900,
    };
  }

  if (normalizedPlan === "standard") {
    return {
      duration: 15,
      steps: {
        homeEnd: 0.20,
        resultsEnd: 0.34,
        businessEnd: 0.86,
      },
      scrollAmount: 1500,
    };
  }

  return {
    duration: 10,
    steps: {
      homeEnd: 0.24,
      resultsEnd: 0.40,
      businessEnd: 0.86,
    },
    scrollAmount: 1050,
  };
}

export function easeInOut(t) {
  return t < 0.5
    ? 2 * t * t
    : 1 - Math.pow(-2 * t + 2, 2) / 2;
}