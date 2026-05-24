import {
  getPullRequests,
  getIssues,
  getCommits,
} from "../services/githubService.js";

export async function buildEngineeringContext() {
  // Fetch GitHub data
  const prs = await getPullRequests();
  const issues = await getIssues();
  const commits = await getCommits();

  // Format PRs
  const prTitles = prs
    .slice(0, 5)
    .map((pr) => `• ${pr.title}`)
    .join("\n");

  // Format Issues
  const issueTitles = issues
    .slice(0, 5)
    .map((issue) => `• ${issue.title}`)
    .join("\n");

  // Format Commits
  const commitMessages = commits
    .slice(0, 5)
    .map(
      (commit) =>
        `• ${commit.commit.message}`
    )
    .join("\n");

  return `
Engineering Context

Open Pull Requests:
${prTitles}

Open Issues:
${issueTitles}

Recent Commits:
${commitMessages}
`;
}