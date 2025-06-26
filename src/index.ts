#!/usr/bin/env node

import { Command } from 'commander';
import simpleGit, { SimpleGit } from 'simple-git';
import chalk from 'chalk';

const program = new Command();
const git: SimpleGit = simpleGit();

interface CommitCredentials {
    hash: string;
    authorName: string;
    authorEmail: string;
    authorDate: string;
    committerName: string;
    committerEmail: string;
    committerDate: string;
}

async function getCommitCredentials(commitRef: string): Promise<CommitCredentials | null> {
    try {
        const result = await git.raw([
            'show',
            '--no-patch',
            '--format=%H%n%an%n%ae%n%ad%n%cn%n%ce%n%cd',
            commitRef,
        ]);
        const [
            hash,
            authorName,
            authorEmail,
            authorDate,
            committerName,
            committerEmail,
            committerDate,
        ] = result.trim().split('\n');
        console.log(result)
        return {
            hash,
            authorName,
            authorEmail,
            authorDate,
            committerName,
            committerEmail,
            committerDate,
        };
    } catch (error: any) {
        console.error(chalk.red('Error fetching commit credentials:'), error.message);
        return null;
    }
}

async function showCommitCredentials(commitRef: string) {
    const credentials = await getCommitCredentials(commitRef);
    if (!credentials) return;

    console.log(chalk.green('Commit:'), credentials.hash);
    console.log(chalk.blue('Author:'), `${credentials.authorName} <${credentials.authorEmail}>`);
    console.log(chalk.blue('Author Date:'), credentials.authorDate);
    console.log(chalk.magenta('Committer:'), `${credentials.committerName} <${credentials.committerEmail}>`);
    console.log(chalk.magenta('Committer Date:'), credentials.committerDate);
}

program
    .name('git-credentials-show')
    .description('Show user credentials for a git commit (like git show)')
    .argument('[commit]', 'Commit hash or reference (default: HEAD)')
    .action(async (commit: string | undefined) => {
        const commitRef = commit || 'HEAD';
        await showCommitCredentials(commitRef);
    });

program.parseAsync(process.argv);