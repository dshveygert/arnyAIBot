import { Telegraf, session} from "telegraf";
import { code } from 'telegraf/format';
import config from 'config';
import { ogg } from './ogg.js';
import { openAI } from './openAI.js';
import { accessDenied, removeFile } from './utils.js';

const INITIAL_SESSION = {
  messages: []
}

const bot = new Telegraf(config.get('TELEGRAM_BOT_TOKEN'));

bot.use(session());

bot.command('new', async (ctx) => {
  ctx.session = INITIAL_SESSION;
  const hey = config.get('USER_MAGIC_LIST')[ctx.message.from.username];
  await ctx.reply(hey ? hey : 'I am waiting your voice or text  message');
});
bot.command('start', async (ctx) => {
  ctx.session = INITIAL_SESSION;
  const hey = config.get('USER_MAGIC_LIST')[ctx.message.from.username];
  await ctx.reply(hey ? hey : 'I am waiting your voice or text  message');
});

bot.on('voice', async (ctx) => {
  if (!ctx.session) {
    ctx.session = INITIAL_SESSION
  }
  if (accessDenied(ctx)) {
    await ctx.reply(code('Sorry, but access to this application is still not available.'));
    return;
  }
  try {
    await ctx.reply(code('...wait'));
    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
    const userID = String(ctx.message.from.id);
    const oggPath = await ogg.create(link.href, userID);
    const mp3Path = await ogg.toMP3(oggPath, userID);
    const textMessage = await openAI.transcription(mp3Path);
    await ctx.reply(code(`"${textMessage}"`));
    await ctx.reply(code('...the answer is being prepared'));
    //const messages = [{role: openAI.role.USER, content: textMessage}];
    ctx.session.messages.push({role: openAI.roles.USER, content: textMessage}); //Add message from User
    const response = await openAI.chat(ctx.session.messages);
    ctx.session.messages.push({role: openAI.roles.ASSISTANT, content: response.content});//Add message from OpenAI
    await ctx.reply(response.content);
    await removeFile(oggPath);
  } catch(e) {
    console.log('Error', e.message );
  }
  //await ctx.reply(JSON.stringify(ctx.message, null, 2));
});

bot.on('text', async (ctx) => {
  if (!ctx.session) {
    ctx.session = INITIAL_SESSION
  }
  if (accessDenied(ctx)) {
    await ctx.reply(code('Sorry, but access to this application is still not available.'));
    return;
  }
  try {
    //console.log('ctx.message ===',ctx.message );
    await ctx.reply(code('...the answer is being prepared'));
    //const textMessage = await openAI.transcription(ctx.message.text);
    const textMessage = ctx.message.text;
    //console.log('textMessage ===',textMessage );
    ctx.session.messages.push({role: openAI.roles.USER, content: textMessage}); //Add message from User
    const response = await openAI.chat(ctx.session.messages);
    //console.log('response ===',response );
    ctx.session.messages.push({role: openAI.roles.ASSISTANT, content: response.content});//Add message from OpenAI
    await ctx.reply(response.content);
  } catch(e) {
    console.log('Error with text messages', e.message );
  }
  //await ctx.reply(JSON.stringify(ctx.message, null, 2));
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
