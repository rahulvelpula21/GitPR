import axios from 'axios';
import { RepoInfo } from './git-utils.js';

/**
 * Creates a Pull Request in Azure DevOps.
 * @param {RepoInfo} repoInfo - Information about the repository.
 * @param {string} sourceBranch - The source branch for the PR.
 * @param {string} targetBranch - The target branch for the PR.
 * @param {string} title - The title of the PR.
 * @param {string} description - The description for the PR.
 * @param {string[]} reviewerIds - An array of reviewer IDs.
 * @param {string} patToken - The Personal Access Token for authentication.
 * @returns {Promise<any>} The response data from the Azure DevOps API.
 */
export async function createPullRequest(
    repoInfo: RepoInfo,
    sourceBranch: string,
    targetBranch: string,
    title: string,
    description: string,
    reviewerIds: string[],
    patToken: string
): Promise<any> {
    const { organization, project, repository } = repoInfo;
    const url = `https://dev.azure.com/${organization}/${project}/_apis/git/repositories/${repository}/pullrequests?api-version=7.0`;

    const payload = {
        sourceRefName: `refs/heads/${sourceBranch}`,
        targetRefName: `refs/heads/${targetBranch}`,
        title,
        description,
        reviewers: reviewerIds.map(id => ({ id })),
    };

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`:${patToken}`).toString('base64')}`,
    };

    try {
        const response = await axios.post(url, payload, { headers });
        return response.data;
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(`❌ Failed to create Pull Request: ${errorMessage}`);
    }
}