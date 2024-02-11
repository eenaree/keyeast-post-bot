import 'dotenv/config.js';
import { Octokit } from 'octokit';

export const octokit = new Octokit({
  auth: process.env.OCTOKIT_TOKEN,
});
