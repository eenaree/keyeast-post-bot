const TELEGRAM_BOT_TOKEN = '[TELEGRAM_BOT_TOKEN]';
const TELEGRAM_CHAT_ID = '[TELEGRAM_CHAT_ID]';

export function sendMessage({ message, preview_link }: { message: string; preview_link: string }) {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const params: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
      payload: {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        link_preview_options: JSON.stringify({ url: preview_link, prefer_large_media: true }),
      },
    };
    UrlFetchApp.fetch(url, params);
  } catch (error) {
    Logger.log(error);
    throw new Error('텔레그램 메세지를 전송하는데 실패했습니다.');
  }
}
