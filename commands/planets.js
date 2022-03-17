const makeConfigVar = require('../functions_misc/makeConfigVar');
const sessionPath = '/v1/session';
const {
  filterBySearch
} = require('../lib/modifiers');
module.exports = {
  name: 'planets',
  aliases: ['planets'],
  description: "List planets and their locations", // OLD COMMANDS DONT JUDGE THE CODE LOL
  permissions: ["ADMINISTRATOR"],
  category: "Administration",
  async execute(req) {
    const message = req.message;
    const discord = req.discord;
    const guild = req.guild;
    let config = await makeConfigVar(guild.id) // Check if config already created, if true, return message to channel
    if (config === null) return message.channel.send('This discord does not have a server registered.\nUse c!setup to add your remote configuration.');



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
    // Append Methods init
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
    // End append methods init
    // Start planets init
    const planets = async (search, methods = true) => {
      const path = `${sessionPath}/planets`;
      const {
        Planets
      } = await send('GET', path);
      const collection = methods ? Planets.map(appendMethods(path, ['remove'])) : Planets;

      return filterBySearch(collection, search);
    };
    // End Planets init
    let planetsInfo = [];
    //await planets().then((result) => {planetsInfo = result}).catch((err) => {console.log(err)});

    for (i = 0; i < planetsInfo.length; i++) {
      const embed = new discord.MessageEmbed()
        .setColor('#E02A6B')
        .setTitle('Planet Info')
        .setURL('https://cosmofficial.herokuapp.com/')
        .setDescription(`Showing planet ${i + 1}`)
        .addFields({
          name: 'Planet Name',
          value: `${planetsInfo[i].DisplayName}`
        }, {
          name: 'X',
          value: `${Math.round(planetsInfo[i].Position.X)}`
        }, {
          name: 'Y',
          value: `${Math.round(planetsInfo[i].Position.Y)}`
        }, {
          name: 'Z',
          value: `${Math.round(planetsInfo[i].Position.Z)}`
        }, )
        .setFooter('Cosmofficial by POPINxxCAPS');

      message.channel.send(embed)

    }
  }
}