import { getIssue } from './api/issue.ts';
import { ActivityResource } from './api/type.ts';
import { fetchActivityResource } from './api/youtube.ts';

type ActivityData = {
  id: string;
  type: string;
  publishedAt: string;
};

app();

async function app() {
  const recentYoutubeActivity = await getRecentYoutubeActivity();
  console.log(recentYoutubeActivity);
}

async function getRecentYoutubeActivity() {
  const issue = await getYoutubeIssue();
  if (issue && issue.data.body) {
    const lastSavedActivityData = getLastSavedActivityData(issue.data.body);
    if (lastSavedActivityData) {
      const recentActivity = await getRecentActivity(lastSavedActivityData);
      return recentActivity;
    }
  }
}

async function getYoutubeIssue() {
  const issue = await getIssue({ owner: 'eenaree', repo: 'keyeast-post-bot', issue_number: 5 });
  return issue;
}

function getLastSavedActivityData(issue: string) {
  const data = JSON.parse(issue);
  return isActivityData(data) ? data : null;
}

async function getRecentActivity(lastSavedActivity: ActivityData) {
  const recentActivity = await fetchActivityResource({
    channelId: 'UCwTTIPB3rZiMavts8ZPTjvA',
    publishedAfter: formatPublishedAt(lastSavedActivity.publishedAt),
  });
  if (recentActivity) {
    return excludeLastSavedActivity(recentActivity, lastSavedActivity);
  } else {
    return null;
  }
}

function formatPublishedAt(publishedAt: string) {
  return publishedAt.replace('+00:00', 'Z');
}

function isActivityData(data: any): data is ActivityData {
  return 'id' in data && 'type' in data && 'publishedAt' in data;
}

function excludeLastSavedActivity(activities: ActivityResource[], lastActivity: ActivityData) {
  return activities.filter((activity) => {
    return (
      activity.id !== lastActivity.id && activity.snippet.publishedAt !== lastActivity.publishedAt
    );
  });
}
