import 'dotenv/config.js';
import { Octokit } from 'octokit';
import { Post, crawl } from './crawler.ts';

const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN,
});
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

app();

async function app() {
  const postsFromCrawling = await crawl();
  const { data } = await octokit.request('GET /repos/{owner}/{repo}/issues/{issue_number}', {
    owner: 'eenaree',
    repo: 'keyeast-post-bot',
    issue_number: 1,
    headers: {
      'X-Github-Api-Version': '2022-11-28',
    },
  });
  const newPosts: Post[] = [];

  if (data.body) {
    const volumenoList = data.body.split('\n');
    const lastVolumeno = volumenoList[volumenoList.length - 1];
    postsFromCrawling.forEach((post) => {
      if (+lastVolumeno < +post.volumeno) {
        newPosts.unshift(post);
      }
    });

    if (newPosts.length > 0) {
      for (const post of newPosts) {
        const text = encodeURIComponent(`${post.title}\n${post.link}`);
        await fetch(
          `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${text}`
        );
      }

      const newPostsVolumeno = newPosts.map((post) => post.volumeno).join('\n');
      await octokit.request('PATCH /repos/{owner}/{repo}/issues/{issue_number}', {
        owner: 'eenaree',
        repo: 'keyeast-post-bot',
        issue_number: 1,
        body: `${data.body}\n${newPostsVolumeno}`,
        headers: {
          'X-Github-Api-Version': '2022-11-28',
        },
      });
    }
  }
}
