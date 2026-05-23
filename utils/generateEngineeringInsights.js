export function generateEngineeringInsights({
  prs,
  issues,
  commits,
  blockers,
}) {
  const insights = [];

  if (prs >= 4) {
    insights.push(
      "⚠️ Review workload is increasing due to elevated pull request activity."
    );
  }

  if (issues >= 5) {
    insights.push(
      "⚠️ Issue backlog growth could impact sprint delivery timelines."
    );
  }

  if (commits >= 10) {
    insights.push(
      "🚀 Strong engineering momentum detected across the repository."
    );
  }

  if (blockers >= 2) {
    insights.push(
      "⚠️ Multiple blockers require active coordination across teams."
    );
  }

  if (insights.length === 0) {
    insights.push(
      "✅ Sprint execution appears stable with balanced engineering activity."
    );
  }

  return insights;
}