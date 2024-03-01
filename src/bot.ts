import 'dotenv/config.js';
import { Posts, crawl } from './crawler.ts';
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

    if (newPosts.size > 0) {
      await sendNotification(newPosts);

      const newPostsVolumeno = [...newPosts].map(([volumeno, value]) => volumeno).join('\n');
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

function getNewPosts(posts: Posts, lastVolumeno: number) {
  const keyAscPostsArray = [...posts].sort();
  const keyAscPostsMap = new Map(keyAscPostsArray);
  const newPosts: Posts = new Map();
  keyAscPostsMap.forEach((value, volumeno) => {
    if (lastVolumeno < volumeno) {
      newPosts.set(volumeno, value);
    }
  });

  return newPosts;
}

async function sendNotification(posts: Posts) {
  try {
    for (const [volumeno, { title, link }] of posts) {
      const text = encodeURIComponent(`${title}\n${link}`);
      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${text}`
      );
    }
  } catch (error) {
    throw new Error('failed to send notification');
  }
}
