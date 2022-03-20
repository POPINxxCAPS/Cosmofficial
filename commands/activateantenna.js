const lockedEmbed = require('../functions/discord/lockedEmbed');
const errorEmbed = require('../functions/discord/errorEmbed');
const antennaNames = ['ice', 'iron', 'silicon', 'nickel', 'cobalt', 'gold', 'magnesium', 'platinum', 'uranium', 'zonechip', 'powerkit']
const sessionPath = '/v1/session';
const gridModel = require('../models/gridSchema');
const chatModel = require('../models/chatSchema');
const spawnerModel = require('../models/spawnerSchema');
const gridPowerOff = require('../functions/execution/gridPowerOff');
const gridPowerOn = require('../functions/execution/gridPowerOn');


// Price modifiers, scaling with iron ore. Developed using values from harvesting / refining rates
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
// Price modifiers end


module.exports = {
    name: 'activateantenna',
    aliases: ['activate'],
    description: "Activate a spawner antenna on the server for a price.\nRequired additional admin setup to be used.\nInformation can be found in the Cosmofficial discord.",
    permissions: ["SEND_MESSAGES"],
    category: 'Conversion',
    categoryAliases: ['convert', 'conversion'],
    patronReq: true,
    async execute(req) {
        const message = req.message;
        const args = req.args;
        const discord = req.discord;
        const guild = req.guild;
        let playerEco = req.playerEco;
        const ecoSettings = req.ecoSettings;
        const currencyName = ecoSettings.currencyName;
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

        // Ugly, needs rework, but not right now
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
        if (spawnerDoc === null) {
            spawnerDoc = await spawnerModel.create({
                guildID: message.guild.id,
                gridName: gridName,
                expirationTime: '0'
            })
        }
        if (parseInt(spawnerDoc.expirationTime) > current_time) return errorEmbed(message.channel, 'Spawner is already activated!')
        spawnerDoc.expirationTime = current_time + (seconds * 1000);

        if (cancel === true) return errorEmbed(message.channel, 'Please wait 5m after the server restart before activating.')

        let config = await makeConfigVar(guild.id) // Check if config already created, if true, return message to channel
        if (config === null) return message.channel.send('This discord does not have a server registered.\nUse c!setup to add your remote configuration.');


        if (playerEco.currency < price) {
            if (playerEco.vault > price) {
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
        await gridPowerOn(guildID, entityID)
        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle(`Antenna Activation`)
            .setURL('https://cosmofficial.herokuapp.com/')
            .setFooter('Cosmofficial by POPINxxCAPS')
            .setDescription(`Successfully activated ${gridName} for ${seconds} seconds!`)
        message.channel.send(embed);


        setTimeout(async () => {
            await gridPowerOff(guildID, entityID)
            console.log(`${gridName} Deactivated`)
        }, 60000)
    }
}