export function formatSummary(text) {
  return text
    .replace(
      /\*\*Sprint Summary.*?\*\*/gi,
      '🚀 *Sprint Summary*'
    )
    .replace(
      /\*\*Completed work:?\*\*/gi,
      '\n\n✅ *Completed Work*\n'
    )
    .replace(
      /\*\*In progress:?\*\*/gi,
      '\n\n🟡 *In Progress*\n'
    )
    .replace(
      /\*\*Blockers:?\*\*/gi,
      '\n\n⚠️ *Blockers*\n'
    )
    .replace(
      /\*\*Next steps:?\*\*/gi,
      '\n\n📌 *Next Steps*\n'
    )
    .replace(/\*\s+/g, '• ')
    .trim();
}