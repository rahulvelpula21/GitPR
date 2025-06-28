// import { Octokit } from "octokit";
// import simpleGit, { SimpleGit } from "simple-git";
// import chalk from "chalk";
// import path from "path";
// import fs from "fs";

// // // Configuration interface
// // interface RepoConfig {
// //   name: string;
// //   description: string;
// //   private: boolean;
// // }

// // Environment variables
// const GITHUB_TOKEN: string = "";
// const REPO_NAME: string = "GitPR"; // <-- CHANGE THIS
// const REPO_DESCRIPTION: string = "Created via Node.js TypeScript script with Octokit";
// const LOCAL_PATH: string = process.cwd(); // Or specify your folder path

// /**
//  * Creates a GitHub repository using Octokit
//  * @param octokit - Authenticated Octokit instance
//  * @param repoName - Repository name
//  * @param description - Repository description
//  * @returns Clone URL or null if failed
//  */
// async function createGitHubRepo(
//   octokit: Octokit, 
//   repoName: string, 
//   description: string
// ): Promise<string | null> {
//   try {
//     console.log(chalk.blue(`Creating GitHub repository: ${repoName}...`));

//     const response = await octokit.request("POST /user/repos", {
//       name: repoName,
//       description,
//       private: false,
//       auto_init: false, // Don't auto-initialize with README
//       headers: {
//         'X-GitHub-Api-Version': '2022-11-28'
//       }
//     });

//     console.log(chalk.green(`✓ Repository created successfully!`));
//     return response.data.clone_url;

//   } catch (error: any) {
//     if (error.status === 422) {
//       console.error(chalk.red(`✗ Repository '${repoName}' already exists or name is invalid`));
//     } else if (error.status === 401) {
//       console.error(chalk.red("✗ Authentication failed. Check your GitHub token."));
//     } else if (error.status === 403) {
//       console.error(chalk.red("✗ Forbidden. Check your token permissions."));
//     } else {
//       console.error(chalk.red(`✗ Failed to create repository: ${error.message}`));
//     }
//     return null;
//   }
// }

// /**
//  * Initializes local git repository if needed
//  * @param git - SimpleGit instance
//  * @param localPath - Local repository path
//  */
// async function initializeLocalRepo(git: SimpleGit, localPath: string): Promise<void> {
//   try {
//     const gitDir: string = path.join(localPath, ".git");

//     if (!fs.existsSync(gitDir)) {
//       console.log(chalk.blue("Initializing local git repository..."));
//       await git.init();

//       // Create a README if it doesn't exist
//       const readmePath: string = path.join(localPath, "README.md");
//       if (!fs.existsSync(readmePath)) {
//         const readmeContent: string = `# ${REPO_NAME}\n\n${REPO_DESCRIPTION}\n\nCreated with TypeScript and Octokit.js\n`;
//         fs.writeFileSync(readmePath, readmeContent);
//       }

//       await git.add(".");
//       await git.commit("Initial commit");
//       console.log(chalk.green("✓ Local repository initialized"));
//     } else {
//       console.log(chalk.yellow("Local git repository already exists"));
//     }
//   } catch (error: any) {
//     throw new Error(`Failed to initialize local repository: ${error.message}`);
//   }
// }

// /**
//  * Adds remote origin and pushes code
//  * @param git - SimpleGit instance
//  * @param remoteUrl - GitHub repository clone URL
//  */
// async function pushToRemote(git: SimpleGit, remoteUrl: string): Promise<void> {
//   try {
//     console.log(chalk.blue("Setting up remote origin..."));

//     // Check if remote already exists
//     const remotes = await git.getRemotes(true);
//     const originExists: boolean = remotes.some(remote => remote.name === "origin");

//     if (!originExists) {
//       await git.addRemote("origin", remoteUrl);
//       console.log(chalk.green("✓ Remote origin added"));
//     } else {
//       console.log(chalk.yellow("Remote origin already exists"));
//       // Update remote URL if different
//       await git.remote(["set-url", "origin", remoteUrl]);
//     }

//     // Get current branch name
//     const status = await git.status();
//     const currentBranch: string = status.current || "main";

//     console.log(chalk.blue(`Pushing to remote (${currentBranch} branch)...`));

//     try {
//       await git.push("origin", currentBranch, ["--set-upstream"]);
//       console.log(chalk.green(`✓ Code pushed to ${currentBranch} branch`));
//     } catch (pushError: any) {
//       // If push fails, try with force (for initial push)
//       if (pushError.message.includes("failed to push") || pushError.message.includes("rejected")) {
//         console.log(chalk.yellow("Initial push failed, trying force push..."));
//         await git.push("origin", currentBranch, ["--set-upstream", "--force"]);
//         console.log(chalk.green(`✓ Code force-pushed to ${currentBranch} branch`));
//       } else {
//         throw pushError;
//       }
//     }

//   } catch (error: any) {
//     throw new Error(`Failed to push to remote: ${error.message}`);
//   }
// }

// /**
//  * Validates the GitHub token and gets user info
//  * @param octokit - Authenticated Octokit instance
//  * @returns User information
//  */
// async function validateAuthentication(octokit: Octokit): Promise<any> {
//   try {
//     console.log(chalk.blue("Verifying GitHub authentication..."));
//     const { data: user } = await octokit.request("GET /user", {
//       headers: {
//         'X-GitHub-Api-Version': '2022-11-28'
//       }
//     });
//     console.log(chalk.green(`✓ Authenticated as: ${user.login} (${user.name || 'No name set'})`));
//     return user;
//   } catch (error: any) {
//     if (error.status === 401) {
//       throw new Error("Invalid GitHub token. Please check your GITHUB_TOKEN environment variable.");
//     }
//     throw new Error(`Authentication failed: ${error.message}`);
//   }
// }

// /**
//  * Main function to orchestrate the repository creation process
//  */
// async function main(): Promise<void> {
//   try {
//     // Validate GitHub token
//     if (!GITHUB_TOKEN) {
//       console.error(chalk.red("✗ GITHUB_TOKEN environment variable is required"));
//       console.log(chalk.yellow("Set it with: export GITHUB_TOKEN=your_token_here"));
//       console.log(chalk.yellow("Or create a .env file with: GITHUB_TOKEN=your_token_here"));
//       process.exit(1);
//     }

//     // Initialize Octokit with authentication
//     const octokit: Octokit = new Octokit({ 
//       auth: GITHUB_TOKEN,
//       userAgent: "GitPR-Creator-TS/1.0.0"
//     });

//     // Verify authentication
//     await validateAuthentication(octokit);

//     // Step 1: Create remote repository
//     const remoteUrl: string | null = await createGitHubRepo(octokit, REPO_NAME, REPO_DESCRIPTION);
//     if (!remoteUrl) {
//       console.error(chalk.red("✗ Failed to create GitHub repository"));
//       process.exit(1);
//     }

//     // Step 2: Initialize local repository
//     const git: SimpleGit = simpleGit(LOCAL_PATH);
//     await initializeLocalRepo(git, LOCAL_PATH);

//     // Step 3: Push to remote
//     await pushToRemote(git, remoteUrl);

//     // Success message
//     console.log(chalk.green.bold("\n🎉 Success!"));
//     console.log(chalk.green(`Repository created and code pushed to:`));
//     console.log(chalk.cyan(remoteUrl.replace('.git', '')));
//     console.log(chalk.blue(`\nLocal path: ${LOCAL_PATH}`));

//   } catch (error: any) {
//     console.error(chalk.red.bold("\n💥 Error occurred:"));
//     console.error(chalk.red(error.message));

//     if (error.message.includes("Authentication")) {
//       console.log(chalk.yellow("\nTroubleshooting:"));
//       console.log(chalk.yellow("1. Make sure your GitHub token is valid"));
//       console.log(chalk.yellow("2. Check token permissions (repo scope required)"));
//       console.log(chalk.yellow("3. Verify the token hasn't expired"));
//     }

//     process.exit(1);
//   }
// }

// // Execute the main function
// main().catch((error: Error) => {
//   console.error(chalk.red.bold("\n💥 Unexpected error:"));
//   console.error(chalk.red(error.message));
//   console.error(chalk.gray(error.stack));
//   process.exit(1);
// });