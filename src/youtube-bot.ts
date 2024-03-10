import { CHAT_ID } from './api/index.ts';
import { getIssue } from './api/issue.ts';
import { sendMessage } from './api/telegram.ts';
import { ActivityResource, VideoResource } from './api/type.ts';
import { fetchActivityResource, fetchVideoResource } from './api/youtube.ts';

type ActivityData = {
  id: string;
  type: string;
  publishedAt: string;
};

app();

async function app() {
  const recentYoutubeActivity = await getRecentYoutubeActivity();
  if (recentYoutubeActivity) {
    const recentKayoungRelatedUploadActivity = await filterKayoungRelatedUploadActivity(
      recentYoutubeActivity
    );

    if (recentKayoungRelatedUploadActivity) {
      notifyKayoungUploads(recentKayoungRelatedUploadActivity);
    }
  }
}

async function notifyKayoungUploads(recentKayoungRelatedUploadActivities: ActivityResource[]) {
  for (const activity of recentKayoungRelatedUploadActivities) {
    const videoId = activity.contentDetails.upload?.videoId;
    if (videoId) {
      const youtubeLink = `youtu.be/${videoId}`;
      await sendMessage(CHAT_ID, youtubeLink);
    }
  }
}

async function filterKayoungRelatedUploadActivity(activity: ActivityResource[]) {
  const uploadActivity = filterUploadActivity(activity);
  const kayoungRelatedUploadActivity: ActivityResource[] = [];

  for (const activity of uploadActivity) {
    if (activity.contentDetails.upload) {
      const videoId = activity.contentDetails.upload.videoId;
      const video = await fetchVideoResource(videoId);
      if (video) {
        const { title, description, tags } = getVideoDetails(video[0]);
        const hasKayoungKeyword =
          containsKayoungKeyword(title) ||
          containsKayoungKeyword(description) ||
          tags.some((tag) => containsKayoungKeyword(tag));
        if (hasKayoungKeyword) {
          kayoungRelatedUploadActivity.unshift(activity);
        }
      }
    }
  }

  return kayoungRelatedUploadActivity;
}

function filterUploadActivity(activity: ActivityResource[]) {
  return activity.filter((activity) => activity.snippet.type === 'upload');
}

function getVideoDetails(video: VideoResource) {
  const { title, description, thumbnails, tags } = video.snippet;
  return {
    title,
    description,
    thumbnails,
    tags,
  };
}

function containsKayoungKeyword(str: string) {
  const keywords = ['문가영', '가영', 'munkayoung', 'mun ka young'];
  return keywords.some((keyword) => str.includes(keyword));
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
