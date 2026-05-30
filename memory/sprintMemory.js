import fs from "fs";

const MEMORY_FILE =
  "./memory/sprint-memory.json";

/**
 * Normalize thread timestamp
 */
function normalizeThreadTs(ts) {
  return String(ts).trim();
}

/**
 * Load memory file
 */
function loadMemory() {
  try {
    const data =
      fs.readFileSync(
        MEMORY_FILE,
        "utf-8"
      );

    return JSON.parse(data);

  } catch {
    return {};
  }
}

/**
 * Save memory file
 */
function persistMemory(memory) {
  fs.writeFileSync(
    MEMORY_FILE,
    JSON.stringify(memory, null, 2)
  );
}

/**
 * Save sprint memory
 */
export function saveSprintMemory(
  threadTs,
  memoryEntry
) {

  const normalizedThreadTs =
    normalizeThreadTs(threadTs);

  const memory = loadMemory();

  if (!memory[normalizedThreadTs]) {
    memory[normalizedThreadTs] = [];
  }

  memory[normalizedThreadTs].push(
    memoryEntry
  );

  // Keep latest 5 summaries
  if (
    memory[normalizedThreadTs].length > 5
  ) {
    memory[normalizedThreadTs].shift();
  }

  console.log(
    "SAVE THREAD:",
    normalizedThreadTs
  );

  persistMemory(memory);
}

/**
 * Get sprint memory
 */
export function getSprintMemory(
  threadTs
) {

  const normalizedThreadTs =
    normalizeThreadTs(threadTs);

  const memory = loadMemory();

  console.log(
    "GET THREAD:",
    normalizedThreadTs
  );

  console.log(
    "MEMORY FOUND:",
    memory[normalizedThreadTs]
  );

  return (
    memory[normalizedThreadTs] || []
  );
}