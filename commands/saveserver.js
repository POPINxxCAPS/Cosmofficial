const makeConfigVar = require('../functions_misc/makeConfigVar');
const sessionPath = '/v1/session';
module.exports = {
    name: 'saveserver',
    aliases: ['serversave'],
    description: "Execute a server save",
    permissions: ["ADMINISTRATOR"],
    category: "Administration",
    async execute(req) {
      const message = req.message;
      const guild = req.guild;
        let config = await makeConfigVar(guild.id) // Check if config already created, if true, return message to channel
        if(config === null) return message.channel.send('This discord does not have a server registered.\nUse c!setup to add your remote configuration.');
        
        /*let sender = mainGuild.members.cache.get(message.author.id);
        if(!sender) return message.channel.send('You must be in the Cosmofficial discord to use this command.');
        if(!(sender.roles.cache.has('854211115915149342'))) return message.channel.send('You must be a patron to use this command.');*/


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

        const save = () => send('PATCH', sessionPath);
        save().then().catch((err) => console.log(err));
        message.channel.send('Server save has been sent. Please allow up to 2 minutes for the save to complete.')
    }
}