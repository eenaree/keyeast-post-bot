import 'dotenv/config.js';
import { Post, crawl } from './crawler.ts';
import { getIssue, updateIssue } from './api/issue.ts';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

app();

async function app() {
  const postsFromCrawling = await crawl();
  const issue = await getIssue({ owner: 'eenaree', repo: 'keyeast-post-bot', issue_number: 1 });
  const newPosts: Post[] = [];

  if (issue && issue.data?.body) {
    const volumenoList = issue.data.body.split('\n');
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
      await updateIssue({
        owner: 'eenaree',
        repo: 'keyeast-post-bot',
        issue_number: 1,
        body: `${issue.data.body}\n${newPostsVolumeno}`,
      });
    }
  }
}
