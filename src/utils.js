import config from 'config';

export const accessDenied = ({message}) => {
  const whiteList = config.get('USER_WHITE_LIST');
  if (!!whiteList && whiteList.length > 0) {
    return !(!!message && !!message.from.username && !!whiteList.includes(message.from.username));
  }
  return true;
}
