const lockedEmbed = require('../functions_discord/lockedEmbed');
const errorEmbed = require('../functions_discord/errorEmbed');
const antennaNames = ['ice', 'iron', 'silicon', 'nickel', 'cobalt', 'gold', 'magnesium', 'platinum', 'uranium', 'zonechip', 'powerkit']
const sessionPath = '/v1/session';
const gridModel = require('../models/gridSchema');
const remoteConfigModel = require('../models/remoteConfigSchema')
const chatModel = require('../models/chatSchema');
const economyModel = require('../models/economySettingSchema');
const spawnerModel = require('../models/spawnerSchema');
let ironOre = 0.25;
let ice = ironOre;
let siliconOre = 1.71 * ironOre;
let nickelOre = 1.71 * ironOre;
let cobaltOre = 1.71 * ironOre
let silverOre = ironOre * 2.52
let goldOre = ironOre * 2.52
let uraniumOre = ironOre * 17.14
let magnesiumOre = ironOre * 1.71
let platinumOre = ironOre * 5.33
let ironIngot = ironOre * 1.42;
let siliconIngot = 1.42 * siliconOre;
let nickelIngot = nickelOre * 2.5
let cobaltIngot = cobaltOre * 3.33
let silverIngot = silverOre * 10
let goldIngot = goldOre * 100
let uraniumIngot = uraniumOre * 100
let magnesiumIngot = magnesiumOre * 142
let platinumIngot = platinumOre * 200
let zoneChip = 44444
let powerkit = 25000
let oreModifier = 25000;
let timeModifier = 30;
module.exports = {
    name: 'activateantenna',
    aliases: ['activate'],
    description: "Add a player to the whitelist",
    permissions: ["SEND_MESSAGES"],
    async execute(message, args, cmd, client, discord, mainGuild, guild, playerEco) {
        //return message.channel.send('Awaiting recode. :(')
        if (message.guild.id !== '799685703910686720') return errorEmbed(message.channel, 'This command only works on the Cosmic PvPvAI server!')
        if (antennaNames.includes(args[0]) === false) {
            let validString = '';
            antennaNames.forEach(name => {
                validString += `${name}\n`
            })
            return errorEmbed(message.channel, `Invalid Antenna. Valid:\n${validString}`)
        }

        // Confirm that there isn't a restart in the next 15 minutes
        let cancel = false;
        let chatDoc = await chatModel.findOne({
            guildID: message.guild.id
        })
        if (chatDoc === null) return errorEmbed(message.channel, 'An unknown error occurred.\nPlease try again in 5 minutes.')
        const current_time = Date.now();
        for (let i = 0; i < chatDoc.chatHistory.length; i++) {
            let chat = chatDoc.chatHistory[i];
            if (chat.content.includes('WARNING! Server will restart in 10 minutes') && (current_time - chat.msTimestamp) < 900000) {
                cancel = true;
            }
        }

        // Grid name and price setting
        let gridName;
        let seconds = 60;
        let price = 0;
        if (args[0] === 'zonechip') {
            gridName = 'Zone Chip Spawner'
            price = zoneChip * timeModifier
        }
        if (args[0] === 'ice') {
            gridName = 'Ice Spawner'
            price = ice * oreModifier * timeModifier
        }
        if (args[0] === 'iron') {
            gridName = 'Iron Spawner'
            price = ironOre * oreModifier * timeModifier
        }
        if (args[0] === 'silicon') {
            gridName = 'Silicon Spawner'
            price = siliconOre * oreModifier * timeModifier
        }
        if (args[0] === 'nickel') {
            gridName = 'Nickel Spawner'
            price = nickelOre * oreModifier * timeModifier
        }
        if (args[0] === 'silver') {
            gridName = 'Silver Spawner'
            price = silverOre * oreModifier * timeModifier
        }
        if (args[0] === 'magnesium') {
            gridName = 'Magnesium Spawner'
            price = magnesiumOre * oreModifier * timeModifier
        }
        if (args[0] === 'gold') {
            gridName = 'Gold Spawner'
            price = goldOre * oreModifier * timeModifier
        }
        if (args[0] === 'platinum') {
            gridName = 'Platinum Spawner'
            price = platinumOre * oreModifier * timeModifier
        }
        if (args[0] === 'uranium') {
            gridName = 'Uranium Spawner'
            price = uraniumOre * oreModifier * timeModifier
        }
        if (args[0] === 'cobalt') {
            gridName = 'Cobalt Spawner'
            price = cobaltOre * oreModifier * timeModifier
        }
        if (args[0] === 'powerkit') {
            gridName = 'Powerkit Spawner'
            price = powerkit * timeModifier
        }
        //
        let spawnerDoc = await spawnerModel.findOne({
            guildID: message.guild.id,
            gridName: gridName
        })
        if(spawnerDoc === null) {
            spawnerDoc = await spawnerModel.create({
                guildID: message.guild.id,
                gridName: gridName,
                expirationTime: '0'
            })
        }
        console.log(parseInt(spawnerDoc.expirationTime))
        if(parseInt(spawnerDoc.expirationTime) > current_time) return errorEmbed(message.channel, 'Spawner is already activated!')
        spawnerDoc.expirationTime = current_time + (seconds * 1000);

        if (cancel === true) return errorEmbed(message.channel, 'Please wait 5m after the server restart before activating.')

        let config = await remoteConfigModel.findOne({
            guildID: guild.id
        }) // Check if config already created, if true, return message to channel
        if (config === null) return message.channel.send('This discord does not have a server registered.\nUse c!setup to add your remote configuration.');

        let ecoSettings = await economyModel.findOne({
            guildID: message.guild.id,
        })
        if (ecoSettings === null) {
            return errorEmbed(message.channel, 'An admin must first setup economy with c!ces')
        }
        let currencyName;
        await ecoSettings.settings.forEach(setting => {
            if (setting.name === 'CurrencyName') {
                currencyName = setting.value;
            }
        })

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

        if(playerEco.currency < price) {
            if(playerEco.vault > price) {
                return errorEmbed(message.channel, `Cannot activate **${gridName}**\nYou must withraw your ${currencyName} from the Vault.\nPrice: ${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`);
            } else {
                return errorEmbed(message.channel, `Cannot activate **${gridName}**\nYou do not have enough ${currencyName}.\nPrice: ${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`);
            }
        }

        let grid = await gridModel.findOne({
            guildID: message.guild.id,
            displayName: gridName,
            ownerDisplayName: 'Space Pirates'
        })
        if (grid === null) return errorEmbed(message.channel, 'An unknown error occurred.\nPlease try again in 5 minutes.')


        playerEco.currency = parseInt(playerEco.currency) - price;
        playerEco.save();
        spawnerDoc.save();
        await send('POST', `${sessionPath}/poweredGrids/${grid.entityID}`)
        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle(`Antenna Activation`)
            .setURL('https://mod.io/members/popinuwu')
            .setFooter('Cosmofficial by POPINxxCAPS')
            .setDescription(`Successfully activated ${gridName} for 60 seconds!`)
        message.channel.send(embed);

        
        setTimeout(async () => {
            await send('DELETE', `${sessionPath}/poweredGrids/${grid.entityID}`)
            console.log(`${gridName} Deactivated`)
        }, 60000)
    }
}