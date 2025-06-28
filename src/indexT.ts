// #!/usr/bin/env node

// import { Command } from 'commander';
// import chalk from 'chalk';
// import ora from 'ora';
// import inquirer from 'inquirer';
// import { IConfig, loadConfig, saveConfig } from './config';
// import { getCurrentBranch, getRepoInfo, pushToRemote, getCommitMessages } from './git-utils';
// import { createPullRequest } from './azure-devops';
// import { sendTeamsNotification } from './teams-notifier';

// const program = new Command();

// program
//     .name('git-cli')
//     .description('A custom Git CLI for Azure DevOps automation')
//     .version('1.0.0');

// // --- SETUP COMMAND ---
// program
//     .command('setup')
//     .description('Configure the CLI tool with your credentials and preferences.')
//     .action(async () => {
//         console.log(chalk.blue('🔧 Welcome to the Git CLI setup!'));
//         const answers = await inquirer.prompt([
//             {
//                 type: 'password',
//                 name: 'pat_token',
//                 message: 'Enter your Azure DevOps Personal Access Token (PAT):',
//                 mask: '*',
//             },
//             {
//                 type: 'input',
//                 name: 'default_target_branch',
//                 message: 'Enter the default target branch for PRs (e.g., main, develop):',
//                 default: 'main',
//             },
//             {
//                 type: 'input',
//                 name: 'reviewers',
//                 message: 'Enter default reviewer IDs (comma-separated):',
//             },
//             {
//                 type: 'input',
//                 name: 'teams_webhook_url',
//                 message: 'Enter the Microsoft Teams webhook URL (optional):',
//             },
//         ]);

//         const config: IConfig = {
//             azure_devops: {
//                 pat_token: answers.pat_token,
//                 default_target_branch: answers.default_target_branch,
//             },
//             reviewers: answers.reviewers.split(',').map((r: string) => r.trim()).filter(Boolean),
//             teams_webhook_url: answers.teams_webhook_url,
//         };

//         saveConfig(config);
//     });

// // --- PUSH-PR COMMAND ---
// program
//     .command('push-pr')
//     .description('Push current branch, create a PR, and notify Teams.')
//     .option('-t, --target <branch>', 'Specify a target branch, overriding the default.')
//     .action(async (options) => {
//         const spinner = ora('Initializing...').start();
//         try {
//             // 1. Load Config
//             spinner.text = 'Loading configuration...';
//             const config = loadConfig();
//             spinner.succeed(chalk.green('Configuration loaded.'));

//             // 2. Get Git Info
//             spinner.start('Getting Git information...');
//             const [sourceBranch, repoInfo] = await Promise.all([getCurrentBranch(), getRepoInfo()]);
//             if (!repoInfo) {
//                 throw new Error("Could not parse Azure DevOps info from 'origin' remote URL.");
//             }
//             spinner.succeed(chalk.green(`On branch '${sourceBranch}' in repo '${repoInfo.repository}'.`));

//             // 3. Push to Remote
//             spinner.start(`Pushing branch '${sourceBranch}' to remote...`);
//             await pushToRemote(sourceBranch);
//             spinner.succeed(chalk.green('Successfully pushed to remote.'));

//             // 4. Create Pull Request
//             spinner.start('Creating Pull Request in Azure DevOps...');
//             const targetBranch = options.target || config.azure_devops.default_target_branch;
//             const commitMessages = await getCommitMessages(sourceBranch, targetBranch);
//             const prTitle = `PR: ${sourceBranch} → ${targetBranch}`;
//             const prDescription = `Automated PR from CLI.\n\n**Commits:**\n${commitMessages}`;

//             const prInfo = await createPullRequest(
//                 repoInfo,
//                 sourceBranch,
//                 targetBranch,
//                 prTitle,
//                 prDescription,
//                 config.reviewers,
//                 config.azure_devops.pat_token
//             );
//             spinner.succeed(chalk.green(`Pull Request #${prInfo.pullRequestId} created!`));
//             console.log(chalk.cyan(`  > View PR: ${prInfo._links.web.href}`));

//             // 5. Send Teams Notification
//             if (config.teams_webhook_url) {
//                 spinner.start('Sending notification to Microsoft Teams...');
//                 await sendTeamsNotification(config.teams_webhook_url, prInfo, repoInfo.repository);
//                 spinner.succeed(chalk.green('Teams notification sent.'));
//             }

//             console.log(chalk.bold.magenta('\n🎉 All done!'));
//         } catch (error: any) {
//             spinner.fail(chalk.red(error.message));
//             process.exit(1);
//         }
//     });

// program.parse(process.argv);