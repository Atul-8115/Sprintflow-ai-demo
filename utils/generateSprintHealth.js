export function generateSprintHealth(
  completed,
  inProgress,
  blockers
) {
  let score =
    100 -
    blockers * 15 -
    inProgress * 3 +
    completed * 5;

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  let status = "🟢 Healthy";

  if (score < 80 && score >= 60) {
    status = "🟡 Needs Attention";
  }

  if (score < 60) {
    status = "🔴 At Risk";
  }

  return {
    score,
    status,
  };
}