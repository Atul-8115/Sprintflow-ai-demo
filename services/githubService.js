import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const github = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
  },
});

const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;

/**
 * Fetch Pull Requests
 */
export async function getPullRequests() {
  const response = await github.get(
    `/repos/${owner}/${repo}/pulls`
  );

  return response.data;
}

/**
 * Fetch Issues
 */
export async function getIssues() {
  const response = await github.get(
    `/repos/${owner}/${repo}/issues`
  );

  return response.data;
}

/**
 * Fetch Commits
 */
export async function getCommits() {
  const response = await github.get(
    `/repos/${owner}/${repo}/commits`
  );

  return response.data;
}