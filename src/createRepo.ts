// import simpleGit from 'simple-git';
// import chalk from 'chalk';
// import path from 'path';
// import fs from 'fs';

// const GITHUB_TOKEN = ''; // Set your token as an env variable
// // const GITHUB_USER = 'rahulvelpula21'; // <-- CHANGE THIS
// const REPO_NAME = 'GitPR'; // <-- CHANGE THIS
// const REPO_DESCRIPTION = 'Created via Node.js script';
// const LOCAL_PATH = process.cwd(); // Or specify your folder

// async function createGitHubRepo(repoName: string, description: string): Promise<string | null> {
//     const response = await fetch('https://api.github.com/user/repos', {
//         method: 'POST',
//         headers: {
//             'Authorization': `token ${GITHUB_TOKEN}`,
//             'Accept': 'application/vnd.github.v3+json',
//         },
//         body: JSON.stringify({
//             name: repoName,
//             description,
//             private: false,
//         }),
//     });

//     if (!response.ok) {
//         console.error(chalk.red('Failed to create GitHub repo:'), await response.text());
//         return null;
//     }

//     const data = await response.json() as any;
//     return data.clone_url as string;
// }

// async function main() {
//     if (!GITHUB_TOKEN) {
//         console.error(chalk.red('Please set your GITHUB_TOKEN as an environment variable.'));
//         process.exit(1);
//     }

//     // 1. Create remote repo
//     const remoteUrl = await createGitHubRepo(REPO_NAME, REPO_DESCRIPTION);
//     if (!remoteUrl) return;

//     // 2. Initialize local repo if needed
//     const git = simpleGit(LOCAL_PATH);
//     if (!fs.existsSync(path.join(LOCAL_PATH, '.git'))) {
//         await git.init();
//         await git.add('.');
//         await git.commit('Initial commit');
//     }

//     // 3. Add remote and push
//     try {
//         await git.addRemote('origin', remoteUrl);
//     } catch {
//         // Ignore if remote already exists
//     }
//     try {
//         await git.push('origin', 'main', ['--set-upstream']);
//     } catch {
//         // If 'main' doesn't exist, try 'master'
//         await git.push('origin', 'master', ['--set-upstream']);
//     }

//     console.log(chalk.green('Repository created and code pushed to:'), remoteUrl);
// }

// main().catch(err => {
//     console.error(chalk.red('Error:'), err);
// });