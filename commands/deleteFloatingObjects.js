const makeConfigVar = require('../functions_misc/makeConfigVar');
const {demotePlayer, banPlayer, kickPlayer, promotePlayer} = require('../lib/admin');
const sessionPath = '/v1/session';
const {filterBySearch} = require('../lib/modifiers');

 
module.exports = {
    name: 'deletefloatingobjects',
    aliases: ['dfo'],
    description: "List all floating objects",
    permissions: ["ADMINISTRATOR"],
    async execute(req) {
        const message = req.message;
        const guild = req.guild;
        let config = await makeConfigVar(guild.id) // Check if config already created, if true, return message to channel
        if(config === null) return message.channel.send('This discord does not have a server registered.\nUse c!setup to add your remote configuration.');



        // Initiate Remote Bridge
        const axios = require('axios');
        const crypto = require('crypto');
        const JSONBI = require('json-bigint')({storeAsString: true, useNativeBigInt: true});
        const querystring = require('querystring');
        
        const baseUrl = config.baseURL;
        const port = config.port;
        const prefix = config.prefix;
        const secret = config.secret;
         
        const getNonce = () => crypto.randomBytes(20).toString('base64');
        const getUtcDate = () => new Date().toUTCString();
         
        const opts = (method, api, {body, qs} = {}) => {
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
         
        const send = (method, path, {body, qs, log = false} = {}) => {
          if (log) {
            console.log(`${method}: ${opts(method, path).url}`)
          }
         
          return axios(opts(method, path, {body, qs}))
            .then((result) => {
              if (log) {
                console.log(result);
              }
         
              const {data: {data}} = result;
              return data || {};
            })
            .catch(e => console.error(`${e.statusCode}: ${e.statusMessage}`));
        };
        // End remote bridge initialization
        // Methods init
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
        // End methods init
        // Start Floating Object Init
        const floatingObjects = async (search, method = true) => {
            const path = `${sessionPath}/floatingObjects`;
            const {FloatingObjects} = await send('GET', path);
            const collection = method ? FloatingObjects.map(appendMethods(path, ['remove', 'stop'])) : FloatingObjects;
           
            return filterBySearch(collection, search);
          };
        // End Floating Object Init
        let count = 0;
        await floatingObjects().then((result) => {
            for(i = 0; i < result.length; i++) {
                if(result[i].DisplayName !== 'Backpack') {
                    result[i].remove();
                    count += 1;
                }
            }
        }).catch((err) => {
            console.log(err);
            message.channel.send('Connection to server failed. Please try again.')
        })
        message.channel.send(`${count} Floating Objects Deleted`)   
    }
}