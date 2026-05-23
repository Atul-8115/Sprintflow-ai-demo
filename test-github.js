import {
  getPullRequests,
  getIssues,
  getCommits,
} from "./services/githubService.js";

async function test() {
  try {
    const prs = await getPullRequests();
    const issues = await getIssues();
    const commits = await getCommits();

    console.log("========== GITHUB DATA ==========");
    console.log("Pull Requests:", prs.length);
    console.log("Issues:", issues.length);
    console.log("Commits:", commits.length);

    console.log("\nLatest PR:");
    console.log(prs[0]?.title);

    console.log("\nLatest Issue:");
    console.log(issues[0]?.title);

    console.log("\nLatest Commit:");
    console.log(commits[0]?.commit?.message);

  } catch (error) {
    console.error("GitHub API Error:", error.message);
  }
}

test();