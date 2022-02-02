const TDMMatchModel = require('../models/TDMMatchSchema');
const TDMMessageHandler = require('../handlers/TDMMessageHandler');
const {
  filterBySearch
} = require('../lib/modifiers');
const adminPath = '/v1/admin';
const sessionPath = '/v1/session';





// Start Bridge Init
const axios = require('axios');
const crypto = require('crypto');
const JSONBI = require('json-bigint')({
  storeAsString: true,
  useNativeBigInt: true
});
const querystring = require('querystring');
const {
  match
} = require('assert');

const baseUrl = 'http://135.125.172.187';
const port = 28027;
const prefix = "/vrageremote";
const secret = 'TDMPopin';

const getNonce = () => crypto.randomBytes(20).toString('base64');
const getUtcDate = () => new Date().toUTCString();

const opts = (method, api, {
  body,
  qs
} = {}) => {
  const url = `${baseUrl}:${port}${prefix}${api}`;
  const nonce = getNonce();
  const date = getUtcDate();
  const query = qs ? `?${querystring.stringify(qs)}` : '';

  const key = Buffer.from(secret, 'base64');
  const message = `${prefix}${api}${query}\r\n${nonce}\r\n${date}\r\n`;
  const hash = crypto.createHmac('sha1', key).update(Buffer.from(message)).digest('base64');

  return {
    url: url + query,
    headers: {
      Authorization: `${nonce}:${hash}`,
      Date: date
    },
    transformRequest(data) {
      return JSONBI.stringify(data);
    },
    transformResponse(data) {
      return JSONBI.parse(data);
    },
    json: true,
    body,
    method
  };
};

const send = (method, path, {
  body,
  qs,
  log = false
} = {}) => {
  if (log) {
    console.log(`${method}: ${opts(method, path).url}`)
  }

  return axios(opts(method, path, {
      body,
      qs
    }))
    .then((result) => {
      if (log) {
        console.log(result);
      }

      const {
        data: {
          data
        }
      } = result;
      return data || {};
    })
    .catch(e => console.error(`${e.statusCode}: ${e.statusMessage}`));
};
// End Bridge Init
// Start Powered Grids Init
const poweredGrids = (entityId) => ({
  on() {
    return send('POST', `${sessionPath}/poweredGrids/${entityId}`);
  },
  off() {
    return send('DELETE', `${sessionPath}/poweredGrids/${entityId}`);
  }
});

// End Powered Grids
// Start Methods Init
const appendMethods = (path, actions = []) => {
  return entity => {
    const {
      EntityId,
      IsPowered
    } = entity;

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
// End Methods Init
// Start Admin Init
const kickPlayer = (steamId) => send('POST', `${adminPath}/kickedPlayers/${steamId}`);
const banPlayer = (steamId) => send('POST', `${adminPath}/bannedPlayers/${steamId}`);
const demotePlayer = (steamId) => send('DELETE', `${adminPath}/promotedPlayers/${steamId}`);
const promotePlayer = (steamId) => send('POST', `${adminPath}/promotedPlayers/${steamId}`);
// End Admin Init
// Start Players Init
const players = async (search, options, methods = true) => {
  try {
    const {
      Players
    } = await send('GET', `${sessionPath}/players`);

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
  } catch (err) {
    return [];
  }
};
// End Players Init
// Start Grids Init
const grids = async (search, methods = true) => {
  try {
    const path = `${sessionPath}/grids`;
    const {
      Grids
    } = await send('GET', path);
    const collection = methods ? Grids.map(appendMethods(path, ['remove', 'stop', 'power'])) : Grids;
    return filterBySearch(collection, search);
  } catch (err) {
    return [];
  }
};
// End Grids Init

module.exports = async (client) => {
  const guild = client.guilds.cache.get("853247020567101440");
  const queueChannel = client.channels.cache.get("884107552726597723")
  const teamOneChannel = client.channels.cache.get("884107620972134430")
  const teamOneRole = guild.roles.cache.get("884108362881585233");
  const teamTwoChannel = client.channels.cache.get("884107658167205908")
  const teamTwoRole = guild.roles.cache.get("884108483438465025");
  const lobbyGridName = 'Lobby';


  let matchRunning = false;
  setInterval(async () => {
    const current_time = Date.now();
    let queuedMembers = queueChannel.members

    // First, check if there is a match doc created. If not, return.
    let matchDoc = await TDMMatchModel.find({});
    if (matchDoc[0] === undefined && matchRunning === true) {
      TDMMessageHandler.updateMatch(client);
      matchRunning = false;
      return;
    }
    if (matchDoc[0] !== undefined) {
      TDMMessageHandler.updateMatch(client);
      matchRunning = true;
    }
    if(matchDoc[0] === undefined) return;



    // If there is a match created, first attempt to move any players participating in the match from the queue vc to their team vc
    let teamOne = matchDoc[0].teamOne;
    let teamTwo = matchDoc[0].teamTwo;

    await teamOne.forEach(player => { // For each player on each team, check if they are in the queue vc. If they are, move them to their team vc
      queuedMembers.forEach(async member => { // For each member in the queue, check if the ID of the player matches. If it does, move them to their team vc
        if (member.user.id === player.userID) {
          let memberTarget = guild.members.cache.get(member.user.id);
          await memberTarget.roles.add(teamOneRole);
          memberTarget.voice.setChannel(teamOneChannel);
        }
      });
    });
    await teamTwo.forEach(player => { // For each player on each team, check if they are in the queue vc. If they are, move them to their team vc
      queuedMembers.forEach(async member => { // For each member in the queue, check if the ID of the player matches. If it does, move them to their team vc
        if (member.user.id === player.userID) {
          let memberTarget = guild.members.cache.get(member.user.id);
          await memberTarget.roles.add(teamTwoRole);
          memberTarget.voice.setChannel(teamTwoChannel);
        }
      });
    });


    // If preperation time is not yet up
    if (matchDoc[0].matchStarted === false || matchDoc[0].matchStarted === undefined) {
      // Check if the match is ready to start
      let errorString = '';
      let playerArray = [];
      await players().then(async (result) => {
        playerArray = result
      });

      // Check if all players are in the server, if not, log to the error string.
      let playerGTs = [];
      playerArray.forEach(player => {
        playerGTs.push(player.DisplayName);
      });
      await teamOne.forEach(player => {
        if (playerGTs.includes(player.gamertag)) {} else {
          errorString += `Red Team: <@${player.userID}> has not logged in.\n`;
        }
        playerArray.forEach(servPlayer => {
          if (servPlayer.DisplayName !== player.gamertag) {} else {
            if (servPlayer.FactionTag !== 'Red') {
              errorString += `Red Team: <@${player.userID}> has not joined Red Faction\n`;
            }
          }
        });
      })
      await teamTwo.forEach(player => {
        if (playerGTs.includes(player.gamertag)) {} else {
          errorString += `Blue Team: <@${player.userID}> has not logged in.\n`;
        }
        playerArray.forEach(servPlayer => {
          if (servPlayer.DisplayName !== player.gamertag) {} else {
            if (servPlayer.FactionTag !== 'Blu') {
              errorString += `Blue Team: <@${player.userID}> has not joined Blue Faction\n`;
            }
          }
        });
      })

      if (errorString === '' && matchDoc[0].matchStarted === false) { // If no errors, start match
        matchDoc[0].matchStarted = true;
        matchDoc[0].save();
        grids().then(async (result) => {
          await result.forEach(grid => {
            if (grid.DisplayName === lobbyGridName) {
              poweredGrids(grid.EntityId).off();
            }
            if (grid.DisplayName === 'Lobby Room Clear') {
              poweredGrids(grid.EntityId).on();
            }
            if (grid.DisplayName === "Large Grid 4866") {
              poweredGrids(grid.EntityId).on();
            }
            if (grid.DisplayName === 'BetaMapTurret') {
              poweredGrids(grid.EntityId).off()
            }
          })
        });
        return;
      }
      if (matchDoc[0].matchStartTime < current_time && matchDoc[0].matchStarted === false) { // If match prep timer is up and match hasn't started         
        if (errorString === '') { // If no errors, start match
          matchDoc[0].matchStarted = true;
          matchDoc[0].save();
          grids().then(async (result) => {
            await result.forEach(grid => {
              if (grid.DisplayName === lobbyGridName) {
                poweredGrids(grid.EntityId).off();
              }
              if (grid.DisplayName === 'Lobby Room Clear') {
                poweredGrids(grid.EntityId).on();
              }
              if (grid.DisplayName === "Large Grid 4866") {
                poweredGrids(grid.EntityId).on();
              }
              if (grid.DisplayName === 'BetaMapTurret') {
                poweredGrids(grid.EntityId).off()
              }
            })
          });
          return;
        } else { // If there are errors and the match is ready to start, cancel the match and move all players back to queue\
          await teamOneChannel.members.forEach(member => { // For each member in team vc, move them back to the queue
            member.voice.setChannel(queueChannel);
          });
          await teamTwoChannel.members.forEach(member => { // For each member in team vc, move them back to the queue
            member.voice.setChannel(queueChannel);
          });
          matchDoc[0].teamOne.forEach(async player => {
            console.log(player.userID)
            let member = await guild.members.cache.get(player.userID);
            console.log(member)
            if (member === undefined || member === null || !member) return;
            await member.roles.remove(teamOneRole);
          })
          matchDoc[0].teamTwo.forEach(async player => {
            let member = await guild.members.cache.get(player.userID);
            if (member === undefined || member === null || !member) return;
            await member.roles.remove(teamTwoRole);
          })

          matchDoc[0].remove();
          return;
        }

      }

      TDMMessageHandler.updateErrors(client, errorString);
      let gridMapNames = ['Large Grid 4866']
      grids().then(async (result) => {
        result.forEach(grid => {
          if (grid.DisplayName === lobbyGridName) {
            poweredGrids(grid.EntityId).on();
          }
          if (grid.DisplayName === 'Lobby Room Clear') {
            poweredGrids(grid.EntityId).off();
          }
          if (gridMapNames.includes(grid.DisplayName)) {
            poweredGrids(grid.EntityId).off();
          }
        })
      });
      return;
    }




    // If match is over
    if (matchDoc[0].matchEndTime < current_time || matchDoc[0].teamOneScore >= matchDoc[0].scoreLimit || matchDoc[0].teamTwoScore >= matchDoc[0].scoreLimit) {
      await teamOneChannel.members.forEach(member => { // For each member in team vc, move them back to the queue
        member.voice.setChannel(queueChannel);
      });
      await teamTwoChannel.members.forEach(member => { // For each member in team vc, move them back to the queue
        member.voice.setChannel(queueChannel);
      });
      matchDoc[0].teamOne.forEach(async player => {
        let member = await guild.members.cache.get(player.userID);
        if (member === undefined || member === null || !member) return;
        member.roles.remove(teamOneRole);
      })
      matchDoc[0].teamTwo.forEach(async player => {
        let member = await guild.members.cache.get(player.userID);
        if (member === undefined || member === null || !member) return;
        member.roles.remove(teamTwoRole);
      })
      let gridMapNames = ['Large Grid 4866']
      await grids().then(async (result) => {
        result.forEach(grid => {
          if (grid.DisplayName === lobbyGridName) {
            poweredGrids(grid.EntityId).on();
          }
          if (grid.DisplayName === 'Lobby Room Clear') {
            poweredGrids(grid.EntityId).off();
          }
          if (grid.DisplayName === gridMapNames[0]) {
            poweredGrids(grid.EntityId).off();
          }
          if (grid.DisplayName === 'BetaMapTurret') {
            poweredGrids(grid.EntityId).on()
          }
        })
      });
      // Award the winning team



      // Delete the match doc and send an embed with the final score, and team that won.
      matchDoc[0].remove();

      return;
    }

  }, 15000);
}