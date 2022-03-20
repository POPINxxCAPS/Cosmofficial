const lockedEmbed = require('../functions/discord/lockedEmbed');
const errorEmbed = require('../functions/discord/errorEmbed');
const gridModel = require('../models/gridSchema');
const remoteConfigModel = require('../models/remoteConfigSchema')
const chatModel = require('../models/chatSchema');
const spawnerModel = require('../models/spawnerSchema');
const characterModel = require('../models/characterSchema');
const verificationModel = require('../models/verificationSchema');
const gridPowerOn = require('../functions/execution/gridPowerOn')
const gridPowerOff = require('../functions/execution/gridPowerOff')

module.exports = {
    name: 'convert',
    aliases: [],
    description: "Add a player to the whitelist",
    permissions: ["SEND_MESSAGES"],
    category: "Economy",
    async execute(req) {
        const message = req.message;
        const args = req.args;
        const discord = req.discord;
        const mainGuild = req.mainGuild;
        const guild = req.guild;
        let playerEco = req.playerEco;
        const ecoSettings = req.ecoSettings;
        const currencyName = ecoSettings.currencyName;

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

        let gridName = 'Space Credit Converter';
        // Get all converter grids
        let gridDocs = await gridModel.find({
            guildID: message.guild.id,
            displayName: gridName,
            ownerDisplayName: 'Space Pirates'
        })
        if (gridDocs.length === 0) return errorEmbed(message.channel, 'Grid was not found in database.\nPlease try again in 5 minutes.\nOr have an admin ensure set-up is complete.')

        // Find the one nearest to the player's character
        let verDoc = await verificationModel.findOne({
            userID: message.author.id
        })
        if (verDoc === null) return errorEmbed(message.channel, 'You must be verified to convert currency!');
        let characterDoc = await characterModel.findOne({
            guildID: message.guild.id,
            name: verDoc.username
        })
        if (characterDoc === null) return errorEmbed(message.channel, 'You must be spawned in the server to convert currency!')

        let distanceData = [];
        for (let i = 0; i < gridDocs.length; i++) {
            let grid = gridDocs[i];
            var dx = grid.positionX - characterDoc.x;
            var dy = grid.positionY - characterDoc.y;
            var dz = grid.positionZ - characterDoc.z;

            let distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            distanceData.push({
                entityID: grid.entityID,
                distance: distance,
                x: grid.positionX,
                y: grid.positionY,
                z: grid.positionZ
            })
        }
        let sorted = distanceData.sort((a, b) => ((a.distance) > (b.distance)) ? 1 : -1);
        let targetGridID = sorted[0].entityID
        if (sorted[0].distance > 3000) {
            const embed = new discord.MessageEmbed()
                .setColor('#E02A6B')
                .setTitle(`Antenna Activation`)
                .setURL('https://cosmofficial.herokuapp.com/')
                .setFooter('Cosmofficial by POPINxxCAPS')
                .setDescription(`You are currently ${Math.round(sorted[0].distance).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} meters away from a converter.
                **Closest Converter Location**
                X: ${Math.round(sorted[0].x)}
                Y: ${Math.round(sorted[0].y)}
                Z: ${Math.round(sorted[0].z)}`)
            return message.channel.send(embed);
        }

        // Ensure arg 1 is a whole number
        let amount;
        if (args[0] === 'all') {
            if (playerEco.currency === '') {
                amount = 0;
            } else {
                amount = parseInt(playerEco.currency)
            }
        } else {
            amount = parseInt(args[0]);
        }

        if (amount % 1 != 0 || amount < 0) return errorEmbed(message.channel, 'Conversion amount must be a whole number!\nOr you can use c!convert all')
        // Expiration Timer Setting
        let seconds = Math.round(parseInt(amount) / 10000);
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
        if (parseInt(spawnerDoc.expirationTime) > current_time) return errorEmbed(message.channel, 'A Credit Converter is already activated!\nPlease wait.')
        spawnerDoc.expirationTime = current_time + (seconds * 1000);


        let config = await makeConfigVar(guild.id) // Check if config already created, if true, return message to channel
        if (config === null) return message.channel.send('This discord does not have a server registered.\nUse c!setup to add your remote configuration.');

        // Grid name and price setting
        let price = seconds * 10000;
        if (price < 100000) return errorEmbed(message.channel, `Minimum Conversion Amount: 100,000 ${currencyName}`)
        //
        if (playerEco.currency < price) {
            if (playerEco.vault > price) {
                return errorEmbed(message.channel, `Cannot activate **${gridName}**\nYou must withraw your ${currencyName} from the Vault.\nPrice: ${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`);
            } else {
                return errorEmbed(message.channel, `Cannot activate **${gridName}**\nYou do not have enough ${currencyName}.\nPrice: ${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`);
            }
        }


        playerEco.currency = parseInt(playerEco.currency) - price;
        playerEco.save();
        spawnerDoc.save();
        await gridPowerOn(message.guild.id, targetGridID)
        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle(`Antenna Activation`)
            .setURL('https://cosmofficial.herokuapp.com/')
            .setFooter('Cosmofficial by POPINxxCAPS')
            .setDescription(`Successfully activated ${gridName} for ${seconds} seconds!`)
        message.channel.send(embed);


        setTimeout(async () => {
            gridPowerOff(message.guild.id, targetGridID)
        }, seconds * 1000)
    }
}