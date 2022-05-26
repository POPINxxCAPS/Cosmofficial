const errorEmbed = require('../functions/discord/errorEmbed');
const gridModel = require('../models/gridSchema');
const chatModel = require('../models/chatSchema');
const spawnerModel = require('../models/spawnerSchema');
const gridPowerOff = require('../functions/execution/gridPowerOff');
const gridPowerOn = require('../functions/execution/gridPowerOn');
const seconds = 120;

const antennaNames = [{
    name: 'Common Loot Box',
    aliases: ['common'],
    seconds: 120,
    price: 300000
}, {
    name: 'Ramshackle Loot Box',
    aliases: ['ramshackle'],
    seconds: 120,
    price: 600000
}, {
    name: 'Apprentice Loot Box',
    aliases: ['apprentice'],
    seconds: 120,
    price: 900000
}, {
    name: 'Journeyman Loot Box',
    aliases: ['journeyman'],
    seconds: 120,
    price: 1200000
}, {
    name: 'Mastercraft Loot Box',
    aliases: ['mastercraft'],
    seconds: 120,
    price: 1500000
}, {
    name: 'Ascendant Loot Box',
    aliases: ['ascendant'],
    seconds: 120,
    price: 1800000
}, ]

module.exports = {
    name: 'lootbox',
    aliases: [],
    description: "Activate a loot box spawner! Use c!lootbox for a list of spawner names/aliases.",
    permissions: ["SEND_MESSAGES"],
    category: 'Cosmic',
    categoryAliases: ['cosmic'],
    patronReq: true,
    async execute(req) {
        const message = req.message;
        const args = req.args;
        const discord = req.discord;
        const config = req.config;
        const guildID = message.guild.id;
        if (config.ip === "Not Set" || config.port === "Not Set" || config.secret === "Not Set") return message.channel.send('This discord does not have a server registered.\nUse c!setup to add your remote configuration.');
        let playerEco = req.playerEco;
        const ecoSettings = req.ecoSettings;
        const currencyName = ecoSettings.currencyName;
        if (message.guild.id !== '799685703910686720') return errorEmbed(message.channel, 'This command only works on the Cosmic PvPvAI server!')
        let antenna;
        for (const antennaItem of antennaNames) {
            if(antennaItem.aliases.includes(args[0]) === true) antenna = antennaItem; 
        }
        if(antenna === undefined) {
            let validString = "";
            for(const antennaItem of antennaNames) {
                for(const alias of antennaItem.aliases) {
                    validString += `${alias}\n`;
                }
            }
            return errorEmbed(message.channel, `Invalid Loot Box Tier. Format: c!lootbox {tier}\nValid Tiers:\n${validString}`)
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
        if (cancel === true) return errorEmbed(message.channel, 'Please wait 5m after the server restart before activating.')

        // Grid name and price setting
        const gridName = antenna.name;
        const price = antenna.price;
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
        if (grid === null) return errorEmbed(message.channel, `This antenna doesn't exist in-game yet!\nThis feature is in progress/beta :)`)


        playerEco.currency = parseInt(playerEco.currency) - price;
        playerEco.save();
        spawnerDoc.save();
        await gridPowerOn(guildID, grid.entityID)
        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle(`Loot Box Manager`)
            .setURL('https://cosmofficial.herokuapp.com/')
            .setFooter('Cosmofficial by POPINxxCAPS')
            .setDescription(`Successfully activated ${gridName} for ${seconds} seconds!`)
        message.channel.send(embed);


        setTimeout(async () => {
            await gridPowerOff(guildID, grid.entityID)
            console.log(`${gridName} Deactivated`)
        }, (seconds * 1000))
    }
}