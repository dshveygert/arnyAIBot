import {Configuration, OpenAIApi} from 'openai';
import {createReadStream} from 'fs';
import config from 'config';

class OpenAI {
  roles = {
    ASSISTANT: 'assistant',
    USER: 'user',
    SYSTEM: 'system'
  };
  constructor(apiKey) {
    const configuration = new Configuration({
      apiKey: apiKey
    });
    this.openai = new OpenAIApi(configuration);
  }

  async chat(messages) {
    try {
      const response = await this.openai.createChatCompletion({
        model: config.get('OPENAPI_VERSION'),
        messages
      });
      return response.data.choices[0].message;
    } catch(e) {
      console.log('Chat Error', e.message);
    }
  }

  async transcription(filePath) {
    try {
      const response = await this.openai.createTranscription(createReadStream(filePath), config.get('OPENAPI_TRANSCRIPTION_VERSION'));
      return response.data.text;
    } catch(e) {
      console.log('Transcription Error', e.message);
    }
  }
}

export const openAI = new OpenAI(config.get('OPENAPI_KEY'));
