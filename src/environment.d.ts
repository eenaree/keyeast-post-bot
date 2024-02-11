declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OCTOKIT_TOKEN: string;
      TELEGRAM_BOT_TOKEN: string;
      TELEGRAM_CHAT_ID: string;
    }
  }
}

export {};
