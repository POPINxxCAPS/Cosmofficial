const {demotePlayer, banPlayer, kickPlayer, promotePlayer} = require('./admin');
const {send} = require('./bridge');
const {filterBySearch} = require('./modifiers');
const sessionPath = '/v1/session';
 
const appendMethods = (path, actions = []) => {
  return entity => {
    const {EntityId, IsPowered} = entity;
 
    if (actions.some(action => action === 'power')) {
      entity.power = {
        on() {
          if (!IsPowered) {
            return poweredGrids.on(EntityId);
          }
        },
        off() {
          if (IsPowered) {
            return poweredGrids.off(EntityId);
          }
        }
      }
    }
 
    if (actions.some(action => action === 'remove')) {
      entity.remove = () => {
        return send('DELETE', `${path}/${EntityId}`);
      }
    }
 
    if (actions.some(action => action === 'stop')) {
      entity.stop = () => send('PATCH', `${path}/${EntityId}`);
    }
 
    return entity;
  };
};
 
const asteroids = async (search, methods = true) => {
  const path = `${sessionPath}/asteroids`;
  const {Asteroids} = await send('GET', path);
  const collection = methods ? Asteroids.map(appendMethods(path, ['remove'])) : Asteroids;
 
  return filterBySearch(collection, search);
};
 
const characters = async (search) => {
  const path = `${sessionPath}/characters`;
  const {Characters} = await send('GET', path);
  const collection = methods ? Characters.map(appendMethods(path, ['stop'])) : Characters;
 
  return filterBySearch(collection, search);
}
 
const chat = async function ({count, date, message} = {}) {
  message = message || typeof arguments[0] === 'string' && arguments[0];
  console.log(message, arguments);
 
  let path = `${sessionPath}/chat`;
 
  if (message) {
    return send('POST', path, {body: message});
  }
 
  if (typeof date === 'number') {
    // convert the time into c# date tick time
    const ticksPerMillisecond = 10000;
    const ticksSinceYearOne = 637329207590000000;
    date = new Date(date).getTime() * ticksPerMillisecond + ticksSinceYearOne;
  }
 
  const {Messages} = await send('GET', path, {qs: {Date: date, MessageCount: count}});
 
  return Messages;
};
chat()
 
const economyAnalysis = () => {
  const path = `${sessionPath}/economyAnalysis`;
 
  return send('GET', path);
};
 
const floatingObjects = async (search, methods = true) => {
  const path = `${sessionPath}/floatingObjects`;
  const {FloatingObjects} = await send('GET', path);
  const collection = methods ? FloatingObjects.map(appendMethods(path, ['remove', 'stop'])) : FloatingObjects;
 
  return filterBySearch(collection, search);
};
 
const grids = async (search, methods = true) => {
  const path = `${sessionPath}/grids`;
  const {Grids} = await send('GET', path);
  const collection = methods ? Grids.map(appendMethods(path, ['remove', 'stop', 'power'])) : Grids;
  return filterBySearch(collection, search);
};
 
const players = async (search, options, methods = true) => {
  const {Players} = await send('GET', `${sessionPath}/players`);
 
  const collection = methods ?
    Players.map(player => {
      player.ban = banPlayer;
      player.kick = kickPlayer;
      player.demote = demotePlayer;
      player.promote = promotePlayer;
 
      return player;
    }) :
    Players;
 
  return filterBySearch(collection, search, options);
};
 
const planets = async (search, methods = true) => {
  const path = `${sessionPath}/planets`;
  const {Planets} = await send('GET', path);
  const collection = methods ? Planets.map(appendMethods(path, ['remove'])) : Planets;
 
  return filterBySearch(collection, search);
};
 
const poweredGrids = (entityId) => ({
  on() {
    return send('POST', `${sessionPath}/poweredGrids/${entityId}`);
  },
  off() {
    return send('DELETE', `${sessionPath}/poweredGrids/${entityId}`);
  }
});
 
const save = () => send('PATCH', sessionPath);
 
module.exports = {
  asteroids,
  characters,
  chat,
  economyAnalysis,
  floatingObjects,
  grids,
  planets,
  players,
  save
};