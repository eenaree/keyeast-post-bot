import 'dotenv/config.js';
import { Post, crawl } from './crawler.ts';
import { getIssue, updateIssue } from './api/issue.ts';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

app();

async function app() {
  const postsFromCrawling = await crawl();
  const issue = await getIssue({ owner: 'eenaree', repo: 'keyeast-post-bot', issue_number: 1 });

  if (issue && issue.data?.body) {
    const lastVolumeno = getLastVolumeno(issue.data.body);
    const newPosts = getNewPosts(postsFromCrawling, lastVolumeno);

    if (newPosts.length > 0) {
      await sendNotification(newPosts);

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

function getLastVolumeno(data: string) {
  const volumenoList = data.split('\n');
  return +volumenoList[volumenoList.length - 1];
}

function getNewPosts(posts: Post[], lastVolumeno: number) {
  const newPosts: Post[] = [];
  posts.forEach((post) => {
    if (lastVolumeno < post.volumeno) {
      newPosts.unshift(post);
    }
  });

  return newPosts;
}

async function sendNotification(posts: Post[]) {
  try {
    for (const post of posts) {
      const text = encodeURIComponent(`${post.title}\n${post.link}`);
      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${text}`
      );
    }
  } catch (error) {
    throw new Error('failed to send notification');
  }
}
