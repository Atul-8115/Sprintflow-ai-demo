export function prioritizeContext(
  userQuestion,
  context
) {

  const question =
    userQuestion.toLowerCase();

  // Release readiness
  if (
    question.includes("release") ||
    question.includes("blocking")
  ) {
    return {
      activeConcerns:
        context.activeConcerns,

      emergingConcerns:
        context.emergingConcerns,

      resolvedConcerns: [],

      recentMemory:
        context.recentMemory,

      githubContext:
        context.githubContext,

      includeHistorical: false
    };
  }

  // Engineering risks
  if (
    question.includes("risk")
  ) {
    return {
      activeConcerns:
        context.activeConcerns,

      emergingConcerns:
        context.emergingConcerns,

      resolvedConcerns: [],

      recentMemory:
        context.recentMemory,

      githubContext:
        context.githubContext,
    };
  }

  // Momentum
  if (
    question.includes("momentum")
  ) {
    return {
      activeConcerns: [],

      emergingConcerns: [],

      resolvedConcerns:
        context.resolvedConcerns,

      recentMemory:
        context.recentMemory,

      githubContext:
        context.githubContext,

      includeHistorical: true
    };
  }

  // Engineering focus
  if (
    question.includes("focus")
  ) {
    return {
      activeConcerns:
        context.activeConcerns,

      emergingConcerns:
        context.emergingConcerns,

      resolvedConcerns: [],

      recentMemory:
        context.recentMemory,

      githubContext:
        context.githubContext,
    };
  }

  return context;
}