const verificationModel = require('../models/verificationSchema');
const gridModel = require('../models/gridSchema');
const errorEmbed = require('../functions_discord/errorEmbed');
const remoteConfigModel = require('../models/remoteConfigSchema');

const sessionPath = '/v1/session';
const gridPath = `${sessionPath}/grids`;

const axios = require('axios');
const crypto = require('crypto');
const JSONBI = require('json-bigint')({
    storeAsString: true,
    useNativeBigInt: true
});
const querystring = require('querystring');


module.exports = {
    name: 'deletegrid',
    aliases: ['dg'],
    description: "Delete a specific grid",
    permissions: ["SEND_MESSAGES"],
    async execute(message, args, cmd, client, discord, mainGuild, guild) {
        let administrationPackage;
        let guildOwner = mainGuild.members.cache.get(guild.owner.user.id);
        if (!guildOwner) return; // If guild owner is no longer in Cosmofficial discord

        if (guildOwner.roles.cache.has('883535682553929779') || guildOwner.roles.cache.has('883535930630213653') || guildOwner.roles.cache.has('883534965650882570')) {
            administrationPackage = true;
        }
        if (administrationPackage !== true) return errorEmbed(message.channel, 'This feature is locked.\nc!patreon');

        let config = await remoteConfigModel.findOne({
            guildID: message.guild.id
        })
        const current_time = Date.now();
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
            if (log === true) {
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

        
        let grid;
        if (parseInt(args[0]) !== NaN) { // If entity ID is used
            grid = await gridModel.findOne({
                guildID: message.guild.id,
                entityID: args[0]
            })
        } else {
            let searchTerm = args[0];
            for (let i = 1; i < args.length; i++) {
                searchTerm = searchTerm + ' ' + `${args[i]}`;
            }

            if (searchTerm === '') return errorEmbed(message.channel, `**Invalid Argument *one***\nPlease enter a grid name.`);

            grid = await gridModel.findOne({
                guildID: message.guild.id,
                displayName: searchTerm
            })
        }


        if (grid === null) return errorEmbed(message.channel, `Grid does not exist, ${searchTerm} queued for deletion by the Hoover.\nIf it appears again in the database, it will be deleted.`);

        await send('DELETE', `${gridPath}/${grid.entityID}`);
        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle(`Grid Manager`)
            .setURL('https://mod.io/members/popinuwu')
            .setFooter('Cosmofficial by POPINxxCAPS')
            .setDescription(`Grid ${grid.displayName} Successfully Deleted.`)
        message.channel.send(embed);
    }
}