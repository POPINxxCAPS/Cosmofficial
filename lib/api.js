const {send} = require('./bridge');
 
const api = async () => {
  const path = '/api';
 
  return await send('GET', path);
};
module.exports = {
  api
};