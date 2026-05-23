export function generateAnalytics(
  completed,
  inProgress,
  blockers
) {
  let velocity = "Low";
  let forecast = "Needs Attention";
  let risk = "Medium";

  if (completed >= 3 && blockers <= 1) {
    velocity = "High";
    forecast = "On Track";
    risk = "Low";
  }

  if (blockers >= 3) {
    velocity = "Medium";
    forecast = "Delayed";
    risk = "High";
  }

  return {
    velocity,
    forecast,
    risk,
    contributors: Math.max(3, completed + inProgress),
    prs: completed * 2 + inProgress,
  };
}