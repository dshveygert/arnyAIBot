import {createWriteStream} from 'fs';
import {dirname, resolve} from 'path';
import {fileURLToPath} from 'url';
import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import installer from '@ffmpeg-installer/ffmpeg';

const __dirname = dirname(fileURLToPath(import.meta.url));

class OggConverter {
  constructor () {
    ffmpeg.setFfmpegPath(installer.path);
  }

  toMP3(input, output) {
    // TODO Implement file removing function
    try {
      const outputPath = resolve(dirname(input), `${output}.mp3`);
      return new Promise((resolve, reject) => {
        ffmpeg(input)
          .inputOption('-t 30')
          .output(outputPath)
          .on('end', () => {
            resolve(outputPath);
          })
          .on('error', (err) => {
            reject(err.message)
          })
          .run();
      });
    } catch(e) {
      console.log('Create mp3 Error', e.message);
    }
  }
  async create(url, fileName) {
    try {
      const oggPAth = resolve(__dirname, '../voices', `${fileName}.ogg`);
      const response = await axios({
        method: 'get',
        url,
        responseType: 'stream'
      });
      return new Promise((resolve) => {
        const stream = createWriteStream(oggPAth);
        response.data.pipe(stream);
        stream.on('finish', () => resolve(oggPAth));
      });
    } catch(e) {
      console.log('Create ogg Error', e.message);
    }
  }
}
export const ogg = new OggConverter();
