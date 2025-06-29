// #!/usr/bin/env node

// import { Command } from 'commander';
// import simpleGit, { SimpleGit } from 'simple-git';
// import chalk from 'chalk';

// const program = new Command();
// const git: SimpleGit = simpleGit();

// interface CommitCredentials {
//     hash: string;
//     authorName: string;
//     authorEmail: string;
//     authorDate: string;
//     committerName: string;
//     committerEmail: string;
//     committerDate: string;
// }

// async function getCommitCredentials(commitRef: string): Promise<CommitCredentials | null> {
//     try {
//         const result = await git.raw([
//             'show',
//             '--no-patch',
//             '--format=%H%n%an%n%ae%n%ad%n%cn%n%ce%n%cd',
//             commitRef,
//         ]);
//         const [
//             hash,
//             authorName,
//             authorEmail,
//             authorDate,
//             committerName,
//             committerEmail,
//             committerDate,
//         ] = result.trim().split('\n');
//         console.log(result)
//         return {
//             hash,
//             authorName,
//             authorEmail,
//             authorDate,
//             committerName,
//             committerEmail,
//             committerDate,
//         };
//     } catch (error: any) {
//         console.error(chalk.red('Error fetching commit credentials:'), error.message);
//         return null;
//     }
// }

// async function showCommitCredentials(commitRef: string) {
//     const credentials = await getCommitCredentials(commitRef);
//     if (!credentials) return;

//     console.log(chalk.green('Commit:'), credentials.hash);
//     console.log(chalk.blue('Author:'), `${credentials.authorName} <${credentials.authorEmail}>`);
//     console.log(chalk.blue('Author Date:'), credentials.authorDate);
//     console.log(chalk.magenta('Committer:'), `${credentials.committerName} <${credentials.committerEmail}>`);
//     console.log(chalk.magenta('Committer Date:'), credentials.committerDate);
// }

// program
//     .name('git-credentials-show')
//     .description('Show user credentials for a git commit (like git show)')
//     .argument('[commit]', 'Commit hash or reference (default: HEAD)')
//     .action(async (commit: string | undefined) => {
//         const commitRef = commit || 'HEAD';
//         await showCommitCredentials(commitRef);
//     });

// program.parseAsync(process.argv);


//#!/usr/bin/env node

// import { Command } from 'commander';
// import chalk from 'chalk';
// import ora from 'ora';
// // Inquirer is no longer needed!
// // import inquirer from 'inquirer';
// import { IConfig, loadConfig, saveConfig } from './config.js';
// import { getCurrentBranch, getRepoInfo, pushToRemote, getCommitMessages } from './git-utils.js';
// import { createPullRequest } from './azure-devops.js';
// import { sendTeamsNotification } from './teams-notifier.js';

// const program = new Command();

// program
//   .name('git-cli')
//   .description('A custom Git CLI for Azure DevOps automation')
//   .version('1.0.0');

// // --- SETUP COMMAND (REFACTORED) ---
// program
//   .command('setup')
//   .description('Configure the CLI tool. Will prompt for any missing options.')
//   .option('-p, --pat-token <token>', 'Your Azure DevOps Personal Access Token (PAT)')
//   .option('-b, --default-target-branch <branch>', 'Default target branch for PRs', 'main')
//   .option('-r, --reviewers <ids>', 'Comma-separated list of default reviewer IDs')
//   .option('-w, --teams-webhook-url <url>', 'Microsoft Teams webhook URL (optional)')
//   .action(async (options) => {
//     console.log(chalk.blue('🔧 Configuring your Git CLI tool...'));

//     // Commander has already prompted for any missing options by the time we get here.
//     // We just need to assemble the config object.

//     const config: IConfig = {
//       azure_devops: {
//         pat_token: options.patToken,
//         default_target_branch: options.defaultTargetBranch,
//       },
//       reviewers: options.reviewers ? options.reviewers.split(',').map((r: string) => r.trim()).filter(Boolean) : [],
//       teams_webhook_url: options.teamsWebhookUrl,
//     };

//     saveConfig(config);
//     console.log(chalk.green('\nSetup complete! You can now use the `push-pr` command.'));
//   });

// // --- PUSH-PR COMMAND (No changes needed here) ---
// program
//   .command('push-pr')
//   .description('Push current branch, create a PR, and notify Teams.')
//   .option('-t, --target <branch>', 'Specify a target branch, overriding the default.')
//   .action(async (options) => {
//     const spinner = ora('Initializing...').start();
//     try {
//       spinner.text = 'Loading configuration...';
//       const config = loadConfig();
//       spinner.succeed(chalk.green('Configuration loaded.'));

//       spinner.start('Getting Git information...');
//       const [sourceBranch, repoInfo] = await Promise.all([getCurrentBranch(), getRepoInfo()]);
//       if (!repoInfo) {
//         throw new Error("Could not parse Azure DevOps info from 'origin' remote URL.");
//       }
//       spinner.succeed(chalk.green(`On branch '${sourceBranch}' in repo '${repoInfo.repository}'.`));

//       spinner.start(`Pushing branch '${sourceBranch}' to remote...`);
//       await pushToRemote(sourceBranch);
//       spinner.succeed(chalk.green('Successfully pushed to remote.'));

//       spinner.start('Creating Pull Request in Azure DevOps...');
//       const targetBranch = options.target || config.azure_devops.default_target_branch;
//       const commitMessages = await getCommitMessages(sourceBranch, targetBranch);
//       const prTitle = `PR: ${sourceBranch} → ${targetBranch}`;
//       const prDescription = `Automated PR from CLI.\n\n**Commits:**\n${commitMessages}`;

//       const prInfo = await createPullRequest(
//         repoInfo,
//         sourceBranch,
//         targetBranch,
//         prTitle,
//         prDescription,
//         config.reviewers,
//         config.azure_devops.pat_token
//       );
//       spinner.succeed(chalk.green(`Pull Request #${prInfo.pullRequestId} created!`));
//       console.log(chalk.cyan(`  > View PR: ${prInfo._links.web.href}`));

//       if (config.teams_webhook_url) {
//         spinner.start('Sending notification to Microsoft Teams...');
//         await sendTeamsNotification(config.teams_webhook_url, prInfo, repoInfo.repository);
//         spinner.succeed(chalk.green('Teams notification sent.'));
//       }

//       console.log(chalk.bold.magenta('\n🎉 All done!'));
//     } catch (error: any) {
//       spinner.fail(chalk.red(error.message));
//       process.exit(1);
//     }
//   });

// program.parse(process.argv);



// #!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { IConfig, loadConfig, saveConfig } from './config.js';
import { getCurrentBranch, getRepoInfo, pushToRemote, getCommitMessages } from './git-utils.js';
// Import from our new github.ts file
import { createPullRequest } from './github.js';
import { sendTeamsNotification } from './teams-notifier.js';

const program = new Command();

program
  .name('git-cli')
  .description('A custom Git CLI for GitHub PR automation')
  .version('2.0.0'); // Bump version for the new functionality

// --- SETUP COMMAND (REWRITTEN FOR GITHUB) ---
program
  .command('setup')
  .description('Configure the CLI tool for GitHub. Will prompt for any missing options.')
  .option('-p, --pat-token <token>', 'Your GitHub Personal Access Token (PAT)')
  .option('-o, --owner <owner>', 'Your GitHub username or organization (optional, can be parsed from remote)')
  .option('-b, --default-target-branch <branch>', 'Default target branch for PRs', 'main')
  .option('-r, --reviewers <usernames>', 'Comma-separated list of GitHub usernames for review')
  .option('-w, --teams-webhook-url <url>', 'Microsoft Teams webhook URL (optional)')
  .action(async (options) => {
    console.log(chalk.blue('🔧 Configuring your Git CLI tool for GitHub...'));

    const config: IConfig = {
      github: {
        pat_token: options.patToken,
        owner: options.owner,
        default_target_branch: options.defaultTargetBranch,
      },
      reviewers: options.reviewers ? options.reviewers.split(',').map((r: string) => r.trim()).filter(Boolean) : [],
      teams_webhook_url: options.teamsWebhookUrl,
    };

    saveConfig(config);
    console.log(chalk.green('\nSetup complete! You can now use the `push-pr` command with GitHub.'));
  });

// --- PUSH-PR COMMAND (UPDATED FOR GITHUB) ---
program
  .command('push-pr')
  .description('Push current branch, create a GitHub PR, and notify Teams.')
  .option('-t, --target <branch>', 'Specify a target branch, overriding the default.')
  .action(async (options) => {
    const spinner = ora('Initializing...').start();
    try {
      spinner.text = 'Loading configuration...';
      const config = loadConfig();
      spinner.succeed(chalk.green('Configuration loaded.'));

      spinner.start('Getting GitHub repository information...');
      const [sourceBranch, repoInfo] = await Promise.all([getCurrentBranch(), getRepoInfo()]);
      if (!repoInfo) {
        throw new Error("Could not parse GitHub info from 'origin' remote URL. Make sure it's a valid GitHub remote.");
      }
      const owner = config.github.owner || repoInfo.owner;
      spinner.succeed(chalk.green(`On branch '${sourceBranch}' in repo '${owner}/${repoInfo.repo}'.`));

      spinner.start(`Pushing branch '${sourceBranch}' to remote...`);
      await pushToRemote(sourceBranch);
      spinner.succeed(chalk.green('Successfully pushed to remote.'));

      spinner.start('Creating Pull Request on GitHub...');
      const targetBranch = options.target || config.github.default_target_branch;
      const commitMessages = await getCommitMessages(sourceBranch, targetBranch);
      const prTitle = `${sourceBranch}`; // A cleaner title for GitHub
      const prDescription = `Automated PR from CLI.\n\n**Commits:**\n${commitMessages}`;

      const prInfo = await createPullRequest(
        owner,
        repoInfo.repo,
        prTitle,
        sourceBranch,
        targetBranch,
        prDescription,
        config.github.pat_token
      );
      spinner.succeed(chalk.green(`Pull Request #${prInfo.number} created!`));
      console.log(chalk.cyan(`  > View PR: ${prInfo.html_url}`));

      if (config.teams_webhook_url) {
        spinner.start('Sending notification to Microsoft Teams...');
        await sendTeamsNotification(config.teams_webhook_url, prInfo, `${owner}/${repoInfo.repo}`);
        spinner.succeed(chalk.green('Teams notification sent.'));
      }

      console.log(chalk.bold.magenta('\n🎉 All done!'));
    } catch (error: any) {
      spinner.fail(chalk.red(error.message));
      process.exit(1);
    }
  });

program.parse(process.argv);