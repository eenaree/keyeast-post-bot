type ThumbnailSize = 'default' | 'medium' | 'high' | 'standard' | 'maxres';

export type ActivityResource = {
  id: string;
  snippet: {
    publishedAt: string;
    title: string;
    description: string;
    thumbnails: {
      [size in ThumbnailSize]: {
        url: string;
        width: number;
        height: number;
      };
    };
    type: string;
  };
  contentDetails: {
    upload?: {
      videoId: string;
    };
    playlistItem?: {
      resourceId: {
        kind: string;
        videoId?: string;
      };
      playlistId: string;
    };
  };
};

export type VideoResource = {
  id: string;
  snippet: {
    publishedAt: string;
    title: string;
    description: string;
    thumbnails: {
      [size in ThumbnailSize]: {
        url: string;
        width: number;
        height: number;
      };
    };
    tags: string[];
  };
  contentDetails: {
    duration: string;
  };
};
