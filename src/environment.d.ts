declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GITHUB_ACCESS_TOKEN: string;
      TELEGRAM_BOT_TOKEN: string;
      TELEGRAM_CHAT_ID: string;
    }
  }
}

export {};
