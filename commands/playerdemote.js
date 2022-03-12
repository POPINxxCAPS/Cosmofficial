const makeConfigVar = require('../functions_misc/makeConfigVar');
const sessionPath = '/v1/session';
const {
  filterBySearch
} = require('../lib/modifiers');
module.exports = {
  name: 'playerdemote',
  aliases: ['demoteplayer'],
  description: "Promote a player in-game",
  permissions: ["ADMINISTRATOR"],
  async execute(req) {
    const message = req.message;
    const args = req.args;
    const mainGuild = req.mainGuild;
    const guild = req.guild;
    let config = await makeConfigVar(guild.id) // Check if config already created, if true, return message to channel
    if (config === null) return message.channel.send('This discord does not have a server registered.\nUse c!setup to add your remote configuration.');

    let patronCheck = mainGuild.members.cache.get(message.guild.owner.user.id);
    if (!patronCheck) return message.channel.send('The owner of this discord must be in the Cosmofficial discord to enable usage of this command.');
    if (!(patronCheck.roles.cache.has('854211115915149342'))) return message.channel.send('The owner of this discord must be a patron of Cosmofficial to enable usage of this command.');

    if (!args[0]) return message.channel.send("You must specify the target player's username")
    let searchedGT = '';
    for (z = 0; z < args.length; z++) {
      searchedGT += args[z];
    }
    // Initiate Remote Bridge
    const axios = require('axios');
    const crypto = require('crypto');
    const JSONBI = require('json-bigint')({
      storeAsString: true,
      useNativeBigInt: true
    });
    const querystring = require('querystring');

    const baseUrl = config.baseURL;
    const port = config.port;
    const prefix = config.prefix;
    const secret = config.secret;

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
    // End remote bridge initialization
    // Start admin init
    const adminPath = '/v1/admin';

    const appendMethods = (path, actions = []) => {
      return entity => {
        const {
          EntityId
        } = entity;

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
      const {
        BannedPlayers
      } = await send('GET', path);
      const collection = methods ? BannedPlayers.map(appendMethods(path, ['remove'])) : BannedPlayers;

      return filterBySearch(collection, search);
    };

    const demotePlayer = (steamId) => send('DELETE', `${adminPath}/promotedPlayers/${steamId}`);

    const kickPlayer = (steamId) => send('POST', `${adminPath}/kickPlayers/${steamId}`);

    const kickedPlayers = async (search, methods = true) => {
      const path = `${adminPath}/kickedPlayers`;
      const {
        KickedPlayers
      } = await send('GET', path);
      const collection = methods ? KickedPlayers.map(appendMethods(path, ['remove'])) : KickedPlayers;

      return filterBySearch(collection, search);
    };

    const promotePlayer = (steamId) => send('POST', `${adminPath}/promotedPlayers/${steamId}`);
    // End admin init
    // Start players init
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
    // End players init

    let playerData; // Get player data
    // Find target username and perform method/function
    await players().then(async (result) => {
      playerData = result
      // Find target username and perform method/function
      for (i = 0; i < playerData.length; i++) {
        if (playerData[i].DisplayName === searchedGT) {
          await demotePlayer(playerData[i].SteamID)
          return message.channel.send(`${playerData[i].DisplayName} Demoted in-server.`)
        }
      }
    }).catch((err) => console.log(err));
  }
}