import config from 'config';
import { unlink } from 'fs/promises'

export const accessDenied = ({message}) => {
  let whiteList;
  try {
    whiteList = config.get('USER_WHITE_LIST');
  } catch (err) {
    return true;
  }
  if (!!whiteList && whiteList.length > 0) {
    return !(!!message && !!message.from.username && !!whiteList.includes(message.from.username));
  }
  return true;
}


export const removeFile = async (path) => {
  try {
    await unlink(path)
  } catch (e) {
    console.log('Error while removing file', e.message)
  }
}
