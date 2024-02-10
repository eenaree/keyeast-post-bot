import 'dotenv/config.js';
import { Octokit } from 'octokit';
import { Post, crawl } from './crawler.ts';

const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN,
});

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
  }
}
