export function generateInsight(summaryText) {
  const completed =
    (summaryText.match(/\*\*Completed work\*\*/i) ? 1 : 0) +
    (summaryText.match(/•/g) || []).length;

  const blockers = (
    summaryText.match(/\*\*Blockers\*\*/i)
      ? summaryText
          .split('**Blockers**')[1]
          ?.split('**Next steps**')[0]
          ?.match(/•/g)?.length || 0
      : 0
  );

  const inProgress = (
    summaryText.match(/\*\*In progress\*\*/i)
      ? summaryText
          .split('**In progress**')[1]
          ?.split('**Blockers**')[0]
          ?.match(/•/g)?.length || 0
      : 0
  );

  // Dynamic insight logic
  if (blockers >= 3) {
    return '⚠️ Multiple blockers detected. Sprint delivery risk is elevated.';
  }

  if (completed > inProgress) {
    return '✅ Sprint execution is progressing well with strong completion momentum.';
  }

  if (inProgress >= 4) {
    return '🛠️ Team workload is high. Monitor sprint capacity carefully.';
  }

  return '📈 Sprint progress appears stable with manageable execution risk.';
}