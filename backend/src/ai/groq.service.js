import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { createGroqChat } from './groq.config.js';

export async function invokeGroq(systemText, userText, options = {}) {
  const model = createGroqChat(options);
  return model.invoke([
    new SystemMessage(systemText),
    new HumanMessage(userText),
  ]);
}