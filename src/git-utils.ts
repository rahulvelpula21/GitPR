// import { simpleGit, SimpleGit } from 'simple-git';

// // The import was changed on the line above.
// // The line below is now correct because `simpleGit` is the imported named function.
// const git: SimpleGit = simpleGit();

// export interface RepoInfo {
//   organization: string;
//   project: string;
//   repository: string;
// }

// /**
//  * Gets the current Git branch name.
//  * @returns {Promise<string>} The current branch name.
//  */
// export async function getCurrentBranch(): Promise<string> {
//   const branchSummary = await git.branch();
//   return branchSummary.current;
// }

// /**
//  * Parses the Azure DevOps repository info from the remote URL.
//  * @returns {Promise<RepoInfo | null>} An object with org, project, and repo, or null if not found.
//  */
// export async function getRepoInfo(): Promise<RepoInfo | null> {
//   const remotes = await git.getRemotes(true);
//   const origin = remotes.find(r => r.name === 'origin');

//   if (!origin) {
//     throw new Error("❌ Git remote 'origin' not found.");
//   }

//   const url = origin.refs.fetch;
//   // Regex for https://dev.azure.com/{org}/{project}/_git/{repo}
//   const match = url.match(/dev\.azure\.com\/([^/]+)\/([^/]+)\/_git\/([^/]+)/);

//   if (match && match.length === 4) {
//     return {
//       organization: match[1],
//       project: match[2],
//       repository: match[3].replace('.git', ''),
//     };
//   }
//   return null;
// }

// /**
//  * Pushes the specified branch to the 'origin' remote.
//  * @param {string} branch The branch to push.
//  */
// export async function pushToRemote(branch: string): Promise<void> {
//   await git.push('origin', branch, ['--set-upstream']);
// }

// /**
//  * Gets commit messages between two branches.
//  * @param {string} sourceBranch The source branch.
//  * @param {string} targetBranch The target branch.
//  * @returns {Promise<string>} A formatted string of commit messages.
//  */
// export async function getCommitMessages(sourceBranch: string, targetBranch: string): Promise<string> {
//     const log = await git.log({ from: `origin/${targetBranch}`, to: sourceBranch });
//     return log.all.map(commit => `- ${commit.message}`).join('\n');
// }


// src/git-utils.ts

import { simpleGit, SimpleGit } from 'simple-git';

const git: SimpleGit = simpleGit();

export interface RepoInfo {
  owner: string;
  repo: string;
}

/**
 * Gets the current Git branch name.
 * @returns {Promise<string>} The current branch name.
 */
export async function getCurrentBranch(): Promise<string> {
  const branchSummary = await git.branch();
  return branchSummary.current;
}

/**
 * Parses the GitHub repository info from the remote URL.
 * @returns {Promise<RepoInfo | null>} An object with owner and repo, or null if not found.
 */
export async function getRepoInfo(): Promise<RepoInfo | null> {
  const remotes = await git.getRemotes(true);
  const origin = remotes.find(r => r.name === 'origin');

  if (!origin) {
    throw new Error("❌ Git remote 'origin' not found.");
  }

  const url = origin.refs.fetch;
  // Regex for https://github.com/owner/repo.git OR git@github.com:owner/repo.git
  const match = /(?:https:\/\/|git@)github\.com[/:]([^/]+)\/([^/]+?)(?:\.git|$)/.exec(url);

  if (match && match.length === 3) {
    return {
      owner: match[1],
      repo: match[2],
    };
  }
  return null;
}

/**
 * Pushes the specified branch to the 'origin' remote.
 * @param {string} branch The branch to push.
 */
export async function pushToRemote(branch: string): Promise<void> {
  await git.push('origin', branch, ['--set-upstream']);
}

/**
 * Gets commit messages between two branches.
 * @param {string} sourceBranch The source branch.
 * @param {string} targetBranch The target branch.
 * @returns {Promise<string>} A formatted string of commit messages.
 */
export async function getCommitMessages(sourceBranch: string, targetBranch: string): Promise<string> {
    const log = await git.log({ from: `origin/${targetBranch}`, to: sourceBranch });
    return log.all.map(commit => `- ${commit.message}`).join('\n');
}