export function generateRisks(
  blockers,
  inProgress
) {
  const risks = [];

  if (blockers >= 3) {
    risks.push(
      "⚠️ Multiple blockers may delay sprint delivery"
    );
  }

  if (blockers >= 1) {
    risks.push(
      "⚠️ Existing blockers require active monitoring"
    );
  }

  if (inProgress >= 4) {
    risks.push(
      "🛠️ High parallel workload may impact quality"
    );
  }

  if (blockers === 0 && inProgress <= 3) {
    risks.push(
      "✅ No major sprint delivery risks detected"
    );
  }

  return risks;
}