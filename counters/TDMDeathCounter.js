const TDMCharacterModel = require('../models/TDMCharacterSchema');
const TDMMessageHandler = require('../handlers/TDMMessageHandler');
const TDMMatchModel = require('../models/TDMMatchSchema');
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
};
// End Players Init
// Start Characters Init
const characters = async (search, methods = true) => {
  const path = `${sessionPath}/characters`;
  const {
    Characters
  } = await send('GET', path);
  const collection = methods ? Characters.map(appendMethods(path, ['stop', 'remove'])) : Characters;

  return filterBySearch(collection, search);
}
// End Characters Init

// Delete all character files function
async function deleteCharacters() {
  let charDocs = await TDMCharacterModel.find({});
  if (!charDocs[0]) return;
  await charDocs.forEach(doc => {
    doc.remove();
  });
}

module.exports = async (client) => {
  var matchDoc = await TDMMatchModel.find({});
  let TDMCharacters = await TDMCharacterModel.find({});
  setInterval(async () => {
    let matchVerification = await TDMMatchModel.find({});
    if (!matchDoc[0] || !matchVerification[0] || !matchVerification[0] === undefined || matchVerification[0].matchStarted === false) {
      await deleteCharacters();
      //console.log('No Match Detected. Death Counter Canceled.')
      matchDoc = matchVerification
      return;
    }
    TDMCharacters = await TDMCharacterModel.find({});
    if (!TDMCharacters[0]) { // If there is no character files, create based on current match.
      if (!matchDoc[0].teamOne) return;
      await matchDoc[0].teamOne.forEach(async (player) => {
        let characterDoc = await TDMCharacterModel.create({
          userID: player.userID,
          gamertag: player.gamertag,
          team: 'Red',
          alive: false,
          leftSpawn: false
        })
        characterDoc.save().catch(err => {});
      })
      await matchDoc[0].teamTwo.forEach(async (player) => {
        let characterDoc = await TDMCharacterModel.create({
          userID: player.userID,
          gamertag: player.gamertag,
          team: 'Blue',
          alive: false,
          leftSpawn: false
        })
        characterDoc.save().catch(err => {});
      })
      TDMCharacters = await TDMCharacterModel.find({});
    }
    // After creating character files

    console.log('start')
    if (matchDoc[0].matchStartTime !== matchVerification[0].matchStartTime) {
      console.log('Death Counter Reset. New Match Detected.');
      await deleteCharacters();
      matchDoc = matchVerification;
      return;
    }

    let serverCharacters = [];
    await characters().then((result) => {
      serverCharacters = result;
    }).catch((err) => {
      console.log(err)
    });

    TDMCharacters = await TDMCharacterModel.find({})


    characterGTs = [];
    for (let i = 0; i < serverCharacters.length; i++) {


      // Check if player is in lobby. If they are, do not check if they are alive/dead
      var dx = serverCharacters[i].Position.X - 0;
      var dy = serverCharacters[i].Position.Y - 0;
      var dz = serverCharacters[i].Position.Z - 0;

      let distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (distance > 250) {
        characterGTs.push(serverCharacters[i].DisplayName);
      }
    };

    await TDMCharacters.forEach(character => { // For every character doc, check if there is an alive player. If not, compare the current "alive status"
      if (characterGTs.includes(character.gamertag)) { // If character gt is found, player is alive. If not found, player is dead.
        if (character.alive === true) {} else {
          character.alive = true;
          character.save();
          console.log(`${character.gamertag} Spawned`)
        }
      } else {
        if (character.alive === false) {} else {
          character.alive = false;
          character.save();
          if (character.team === 'Red') {
            matchDoc[0].teamTwoScore += 1;
          } else {
            matchDoc[0].teamOneScore += 1;
          }
          console.log(`${character.gamertag} Died`)
        }
      }
    });
    if (matchDoc[0] !== undefined) {
      matchDoc[0].save().catch(err => {});
    }
    console.log('end')
  }, 2000);


  setInterval(async () => {
    // Create strings to send to the embed
    let teamOneString = '';
    let teamTwoString = '';
    if (!matchDoc[0] || matchDoc[0] === undefined || matchDoc === null) {
      TDMMessageHandler.playerStatus(client, '', '');
      return;
    };
    await TDMCharacters.forEach(char => {
      if (char.team === 'Red') {
        if (char.alive === true) {
          teamOneString += `${char.gamertag}: In Battle\n`
        } else {
          teamOneString += `${char.gamertag}: Spawning / Dead\n`
        }
      }
      if (char.team === 'Blue') {
        if (char.alive === true) {
          teamTwoString += `${char.gamertag}: In Battle\n`
        } else {
          teamTwoString += `${char.gamertag}: Spawning / Dead\n`
        }
      }
    });
    TDMMessageHandler.playerStatus(client, teamOneString, teamTwoString);
  }, 5000)
}