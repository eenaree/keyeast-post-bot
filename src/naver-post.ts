import { type Posts, crawl } from './crawler';
import { sendMessage } from './telegram';

function checkTriggerExists(triggerName: string) {
  let hasTrigger = false;
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === triggerName) {
      Logger.log(`${triggerName} 트리거가 이미 존재합니다.`);
      hasTrigger = true;
      break;
    }
  }

  return hasTrigger;
}

async function triggerPostBot() {
  const postsFromCrawling = await crawl();
  const lastPostVolumeno = getLastPostVolumeno();

  if (!lastPostVolumeno) {
    Logger.log('* 네이버 포스트봇 구동을 위한 초기 설정 중입니다.');
    setLastPostVolumeno(`${[...postsFromCrawling.keys()][0]}`);
    const hasTrigger = checkTriggerExists('triggerPostBot');
    if (!hasTrigger) {
      Logger.log('triggerPostBot 트리거를 생성합니다.');
      ScriptApp.newTrigger('triggerPostBot').timeBased().everyMinutes(30).create();
    }
    return;
  }

  const newPosts = getNewPosts(postsFromCrawling, +lastPostVolumeno);

  if (newPosts.size > 0) {
    Logger.log(`최신 포스트: ${newPosts.size} 개`);
    notifyNewPosts(newPosts);
    Logger.log('최신 포스트 항목을 모두 게시했습니다.');
  } else {
    Logger.log('최신 포스트가 없습니다.');
  }
}

function notifyNewPosts(posts: Posts) {
  for (const [volumeno, { title, link }] of posts) {
    Logger.log(`'${title}' 항목 게시중...`);
    sendMessage({ message: link, preview_link: link });
    setLastPostVolumeno(`${volumeno}`);
  }
}

function getLastPostVolumeno() {
  return PropertiesService.getScriptProperties().getProperty('LAST_POST_VOLUMENO');
}

function setLastPostVolumeno(volumeno: string) {
  return PropertiesService.getScriptProperties().setProperty('LAST_POST_VOLUMENO', volumeno);
}

function getNewPosts(posts: Posts, lastVolumeno: number) {
  const newPosts: Posts = new Map();

  posts.forEach((value, volumeno) => {
    if (lastVolumeno < volumeno) {
      newPosts.set(volumeno, value);
    }
  });

  const keyAscNewPostsArray = [...newPosts].sort((a, b) => a[0] - b[0]);
  return new Map(keyAscNewPostsArray);
}
