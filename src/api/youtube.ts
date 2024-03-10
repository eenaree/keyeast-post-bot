import { YOUTUBE_API_KEY } from './index.ts';
import { ActivityResource, VideoResource } from './type.ts';

export async function fetchActivityResource({
  channelId,
  publishedAfter,
  maxResults = 5,
}: {
  channelId: string;
  publishedAfter?: string;
  maxResults?: number;
}) {
  try {
    const params = {
      part: 'snippet,contentDetails',
      channelId,
      fields: 'items(id,snippet(publishedAt,title,description,thumbnails,type),contentDetails)',
      maxResults,
      publishedAfter,
      key: YOUTUBE_API_KEY,
    };

    if (!publishedAfter) {
      delete params.publishedAfter;
    }

    const queryString = Object.entries(params)
      .filter(([key, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    const response = await fetch(`https://www.googleapis.com/youtube/v3/activities?${queryString}`);
    const data = await response.json();
    if (isListResponseType<ActivityResource>(data)) {
      return data.items;
    }
    return null;
  } catch (error) {
    throw new Error("failed to fetch channel's activity");
  }
}

export async function fetchVideoResource(videoId: string) {
  try {
    const params = {
      part: 'snippet,contentDetails',
      fields:
        'items(id,snippet(publishedAt,title,description,thumbnails,tags),contentDetails(duration))',
      id: videoId,
      key: YOUTUBE_API_KEY,
    };

    const queryString = Object.entries(params)
      .filter(([key, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?${queryString}`);
    const data = await response.json();
    if (isListResponseType<VideoResource>(data)) {
      return data.items;
    }
    return null;
  } catch (error) {
    throw new Error('failed to fetch video info');
  }
}

function isListResponseType<T>(data: any): data is { items: T[] } {
  return 'items' in data;
}
