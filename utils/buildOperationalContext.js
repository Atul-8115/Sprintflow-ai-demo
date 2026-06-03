import { getSprintMemory }
  from "../memory/sprintMemory.js";

import { buildEngineeringContext }
  from "./buildEngineeringContext.js";

function normalizeConcern(concern) {

  const text =
    concern.toLowerCase();

  if (
    text.includes("android") &&
    text.includes("hydration")
  ) {
    return "Android hydration regression";
  }

  if (
    text.includes("playwright") &&
    text.includes("verification")
  ) {
    return "Playwright verification";
  }

  if (
    text.includes("redis")
  ) {
    return "Redis deployment instability";
  }

  return concern;
}

export async function buildOperationalContext(
  threadTs
) {

  const sprintMemory =
    getSprintMemory(threadTs)
      .sort(
        (a, b) =>
          b.timestamp - a.timestamp
      );

  const recentMemory =
    sprintMemory.slice(0, 2);

  const historicalMemory =
    sprintMemory.slice(2);

  const activeConcerns =
    [
        ...new Set(
        recentMemory
            .flatMap(
            memory => memory.active || []
            )
            .map(normalizeConcern)
        )
    ];

  const resolvedConcerns =
    [
        ...new Set(
        recentMemory
            .flatMap(
            memory => memory.resolved || []
            )
            .map(normalizeConcern)
        )
    ];

  const emergingConcerns =
    [
        ...new Set(
        recentMemory
            .flatMap(
            memory => memory.emerging || []
            )
            .map(normalizeConcern)
        )
    ];

   const prioritizedActiveConcerns =
    activeConcerns
        .sort((a, b) => {

        const severity = concern => {

            const text =
            concern.toLowerCase();

            if (
            text.includes("regression")
            ) return 3;

            if (
            text.includes("instability")
            ) return 2;

            if (
            text.includes("verification")
            ) return 1;

            return 0;
        };

        return (
            severity(b) -
            severity(a)
        );
        });

  const githubContext =
    await buildEngineeringContext();

  return {
    githubContext,
    recentMemory,
    historicalMemory,
    activeConcerns: prioritizedActiveConcerns,
    resolvedConcerns,
    emergingConcerns,
  };
}