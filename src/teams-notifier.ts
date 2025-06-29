// import axios from 'axios';

// /**
//  * Sends a notification card to a Microsoft Teams webhook.
//  * @param {string} webhookUrl - The incoming webhook URL for the Teams channel.
//  * @param {any} prInfo - The pull request information returned from Azure DevOps.
//  * @param {string} repositoryName - The name of the repository.
//  */
// export async function sendTeamsNotification(webhookUrl: string, prInfo: any, repositoryName: string): Promise<void> {
//     const messageCard = {
//         '@type': 'MessageCard',
//         '@context': 'http://schema.org/extensions',
//         'themeColor': '0076D7',
//         'summary': `New Pull Request: ${prInfo.title}`,
//         'sections': [{
//             'activityTitle': '🔄 New Pull Request Created',
//             'activitySubtitle': `by ${prInfo.createdBy.displayName}`,
//             'facts': [
//                 { 'name': 'Repository', 'value': repositoryName },
//                 { 'name': 'Source Branch', 'value': prInfo.sourceRefName.replace('refs/heads/', '') },
//                 { 'name': 'Target Branch', 'value': prInfo.targetRefName.replace('refs/heads/', '') },
//                 { 'name': 'PR ID', 'value': prInfo.pullRequestId.toString() },
//             ],
//             'markdown': true
//         }],
//         'potentialAction': [{
//             '@type': 'OpenUri',
//             'name': 'View Pull Request',
//             'targets': [{ 'os': 'default', 'uri': prInfo._links.web.href }]
//         }]
//     };

//     try {
//         await axios.post(webhookUrl, messageCard, {
//             headers: { 'Content-Type': 'application/json' }
//         });
//     } catch (error: any) {
//         console.warn(`⚠️ Failed to send Teams notification: ${error.message}`);
//     }
// }


// src/teams-notifier.ts

import axios from 'axios';

/**
 * Sends a notification card to a Microsoft Teams webhook.
 * @param {string} webhookUrl - The incoming webhook URL for the Teams channel.
 * @param {any} prInfo - The pull request information returned from GitHub.
 * @param {string} repositoryName - The name of the repository (e.g., owner/repo).
 */
export async function sendTeamsNotification(webhookUrl: string, prInfo: any, repositoryName: string): Promise<void> {
  const messageCard = {
    '@type': 'MessageCard',
    '@context': 'http://schema.org/extensions',
    'themeColor': '0076D7',
    'summary': `New Pull Request: ${prInfo.title}`,
    'sections': [{
      'activityTitle': '🔄 New Pull Request Created',
      'activitySubtitle': `by ${prInfo.user.login}`,
      'facts': [
        { 'name': 'Repository', 'value': repositoryName },
        { 'name': 'Source Branch', 'value': prInfo.head.ref },
        { 'name': 'Target Branch', 'value': prInfo.base.ref },
        { 'name': 'PR ID', 'value': `#${prInfo.number}` },
      ],
      'markdown': true
    }],
    'potentialAction': [{
      '@type': 'OpenUri',
      'name': 'View Pull Request on GitHub',
      'targets': [{ 'os': 'default', 'uri': prInfo.html_url }]
    }]
  };

  try {
    await axios.post(webhookUrl, messageCard, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.warn(`⚠️ Failed to send Teams notification: ${error.message}`);
  }
}