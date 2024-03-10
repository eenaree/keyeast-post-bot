import 'dotenv/config.js';
import { Octokit } from 'octokit';

export const octokit = new Octokit({
  auth: process.env.OCTOKIT_TOKEN,
});

export const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
export const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
export const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
