import { BOT_TOKEN } from './index.ts';

export async function sendMessage(chatId: string, msg: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${chatId}&text=${msg}`);
}
