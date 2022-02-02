const {send} = require('./bridge');
const serverPath = '/v1/server';
 
const info = () => send('GET', serverPath);
 
const ping = () => send('GET', `${serverPath}/ping`);
 
const stop = () => send('DELETE', serverPath);
 
module.exports = {
  info,
  ping,
  stop
};