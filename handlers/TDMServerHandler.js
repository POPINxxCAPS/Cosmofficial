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
    .catch(e => {
      return;
    });
};
// End Bridge Init
// Start Methods Init
const appendMethods = (path, actions = []) => {
  return entity => {
    const {
      SteamID
    } = entity;

    if (actions.some(action => action === 'remove')) {
      entity.remove = () => send('DELETE', `${path}/${SteamID}`);
    }

    if (actions.some(action => action === 'stop')) {
      entity.stop = () => send('PATCH', `${path}/${SteamID}`);
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
const kickedPlayers = async (search, methods = true) => {
  try {
    const path = `${adminPath}/kickedPlayers`;
    const {
      KickedPlayers
    } = await send('GET', path);
    const collection = methods ? KickedPlayers.map(appendMethods(path, ['remove'])) : KickedPlayers;

    return filterBySearch(collection, search);
  } catch (err) {
    return []
  }
};
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

// Chat init
const chat = async (count, date, message) => {
  let path = `${sessionPath}/chat`;

  // convert the time into c# date tick time
  const ticksPerMillisecond = 10000;
  const ticksSinceYearOne = 637329207590000000;
  date = new Date(date).getTime() * ticksPerMillisecond + ticksSinceYearOne;

  if (message !== undefined) {
    console.log('ran')
    return send('POST', path, {
      body: {
        message: message
      }
    });
  }

  const {
    Messages
  } = await send('GET', path, {
    qs: {
      Date: date,
      MessageCount: count
    }
  });

  return Messages;
};

/*send('POST', `${sessionPath}/chat`, { 
  SteamID: '76561198125025796',  
    DisplayName: 'POPINxxCAPS',    
    Content: 'test',
    Timestamp: '637666020525831549'
});*/
const save = () => send('PATCH', sessionPath);


module.exports = async (client) => {
  const guild = client.guilds.cache.get("853247020567101440");
  const queueChannel = client.channels.cache.get("884107552726597723")
  const teamOneChannel = client.channels.cache.get("884107620972134430")
  const teamOneRole = guild.roles.cache.get("884108362881585233");
  const teamTwoChannel = client.channels.cache.get("884107658167205908")
  const teamTwoRole = guild.roles.cache.get("884108483438465025");



  //save();
  //console.log('TDM SERVER SAVED')
  setInterval(async () => {
    validGamertags = [];
    let matchDoc = await TDMMatchModel.find({});
    if (matchDoc[0] === undefined) {} else { // If there is no match doc, don't change validGTs. If there is a match doc, add GTs to validGTs
      let teamOne = matchDoc[0].teamOne;
      let teamTwo = matchDoc[0].teamTwo;
      await teamOne.forEach(player => {
        validGamertags.push(player.gamertag);
      });
      await teamTwo.forEach(player => {
        validGamertags.push(player.gamertag);
      });
    }

    let playerResult;
    await players().then((result) => {
      result.forEach(player => {
        let gamertag = player.DisplayName;
        if (validGamertags.includes(gamertag)) {} else {
          console.log(player);
          console.log('player kicked')
          kickPlayer(player.SteamID)
        }
      });
      playerResult = result;
    }).catch((err) => console.log(err))
    if (matchDoc[0] !== undefined) {
      if (matchDoc[0].matchStarted === true) {
        let changesMade = false;
        await playerResult.forEach(async player => {
          await matchDoc[0].teamOne.forEach(async doc => { // Verify all members are on right team, if not remove from match
            if (player.DisplayName === doc.gamertag) {
              if (player.FactionTag === 'Red') {} else {
                doc.remove();
                let memberTarget = guild.members.cache.get(doc.userID);
                await memberTarget.roles.remove(teamOneRole);
                memberTarget.voice.setChannel(queueChannel);
                changesMade = true;
              }
            }
          })
          await matchDoc[0].teamTwo.forEach(async doc => { // Verify all members are on right team, if not remove from match
            if (player.DisplayName === doc.gamertag) {
              if (player.FactionTag === 'Blu') {} else {
                console.log(player)
                doc.remove();
                let memberTarget = guild.members.cache.get(doc.userID);
                await memberTarget.roles.remove(teamTwoRole);
                memberTarget.voice.setChannel(queueChannel);
                changesMade = true;
              }
            }
          })
        })
        if (changesMade === true) {
          matchDoc[0].save()
        }
      }
    }



    setTimeout(async () => {
      await kickedPlayers().then((result) => {
        result.forEach(player => {
          console.log(`Removed a player from kicked list`)
          player.remove();
        })
      })
    }, 2000)
  }, 10000)
}