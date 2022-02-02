const {filterBySearch} = require('./modifiers');
const adminPath = '/v1/admin';
 
const appendMethods = (path, actions = []) => {
  return entity => {
    const {EntityId} = entity;
 
    if (actions.some(action => action === 'remove')) {
      entity.remove = () => send('DELETE', `${path}/${EntityId}`);
    }
 
    if (actions.some(action => action === 'stop')) {
      entity.stop = () => send('PATCH', `${path}/${EntityId}`);
    }
 
    return entity;
  };
};
 
const banPlayer = (steamId) => send('POST', `${adminPath}/bannedPlayers/${steamId}`);
 
const bannedPlayers = async (search, methods = true) => {
  const path = `${adminPath}/bannedPlayers`;
  const {BannedPlayers} = await send('GET', path);
  const collection = methods ? BannedPlayers.map(appendMethods(path, ['remove'])) : BannedPlayers;
 
  return filterBySearch(collection, search);
};
 
const demotePlayer = (steamId) => send('DELETE', `${adminPath}/promotedPlayers/${steamId}`);
 
const kickPlayer = (steamId) => send('POST', `${adminPath}/kickPlayers/${steamId}`);
 
const kickedPlayers = async (search, methods = true) => {
  const path = `${adminPath}/kickedPlayers`;
  const {KickedPlayers} = await send('GET', path);
  const collection = methods ? KickedPlayers.map(appendMethods(path, ['remove'])) : KickedPlayers;
 
  return filterBySearch(collection, search);
};
 
const promotePlayer = (steamId) => send('POST', `${adminPath}/promotedPlayers/${steamId}`);
 
module.exports = {
  demotePlayer,
  bannedPlayers,
  banPlayer,
  kickedPlayers,
  kickPlayer,
  promotePlayer
};