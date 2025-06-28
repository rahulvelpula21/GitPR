// src/github.ts

import { Octokit } from 'octokit';

/**
 * Creates a Pull Request in GitHub.
 * @param owner The repository owner (user or organization).
 * @param repo The repository name.
 * @param title The title of the pull request.
 * @param head The name of the source branch.
 * @param base The name of the target branch.
 * @param body The description of the pull request.
 * @param token The GitHub Personal Access Token.
 * @returns The response data from the GitHub API.
 */
export async function createPullRequest(
  owner: string,
  repo: string,
  title: string,
  head: string,
  base: string,
  body: string,
  token: string
): Promise<any> {
  const octokit = new Octokit({ auth: token });

  try {
    const response = await octokit.rest.pulls.create({
      owner,
      repo,
      title,
      head,
      base,
      body,
    });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(`❌ Failed to create GitHub Pull Request: ${errorMessage}`);
  }
}