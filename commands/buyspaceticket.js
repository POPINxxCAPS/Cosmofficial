const spaceTicketModel = require('../models/spaceTicketSchema');
const verificationModel = require('../models/verificationSchema');
const playerModel = require('../models/playerSchema');
const errorEmbed = require('../functions_discord/errorEmbed');
const economySettingsModel = require('../models/economySettingSchema');
const ms = require('ms')


const ticketTime = 86400 * 1000;


const price = 750000
module.exports = {
    name: 'buyspaceticket',
    aliases: ['bst'],
    description: "Buy a space ticket",
    permissions: ["SEND_MESSAGES"],
    async execute(req) {
        const message = req.message;
        const discord = req.discord;
        const guild = req.guild;
        const playerEco = req.playerEco;
        if (guild.id !== '799685703910686720') return;
        let verDoc = await verificationModel.findOne({
            userID: message.author.id
        })
        if (verDoc === null) return errorEmbed(message.channel, 'You must be verified to purchase this!')



        let ecoSettings = await economySettingsModel.findOne({
            guildID: message.guild.id,
        })
        if (ecoSettings === null) {
            return errorEmbed(message.channel, 'An admin must first setup economy with c!ces')
        }
        let currencyName;
        ecoSettings.settings.forEach(setting => {
            if (setting.name === 'CurrencyName') {
                currencyName = setting.value;
            }
        })

        let totalPlayerBal = parseInt(playerEco.currency) + parseInt(playerEco.vault);
        if (parseInt(playerEco.currency) < price) {
            if (totalPlayerBal < price) {
                return errorEmbed(message.channel, `You do not enough ${currencyName} to purchase this!`)
            } else {
                return errorEmbed(message.channel, `You must withdraw ${price - parseInt(playerEco.currency)} ${currencyName} to purchase this!`)
            }
        }


        // Check for faction tag
        let playerDoc = await playerModel.findOne({
            guildID: message.guild.id,
            displayName: verDoc.username
        })


        if (playerDoc === null) return errorEmbed(message.channel, `An unknown error occurred. Please try again`)
        if (playerDoc.factionTag === '') return errorEmbed(message.channel, `You must create a faction first!`)

        // Check for an existing space ticket
        const current_time = Date.now()
        let ticket = await spaceTicketModel.findOne({
            factionTag: playerDoc.factionTag
        })
        if (ticket === null) {
            ticket = await spaceTicketModel.create({
                factionTag: playerDoc.factionTag,
                expirationTime: current_time + ticketTime
            })
            playerEco.currency = parseInt(playerEco.currency) - price;
            playerEco.save();
            const embed = new discord.MessageEmbed()
                .setColor('#E02A6B')
                .setTitle('Space Ticket Manager')
                .setURL('https://cosmofficial.herokuapp.com/')
                .setDescription(`You have purchased a Space Ticket for ${playerDoc.factionName}.\nIt will expire in: ${ms(parseInt(ticket.expirationTime) - current_time)}`)
                .setFooter('Cosmofficial by POPINxxCAPS');
            try {
                return message.channel.send(embed);
            } catch (err) {}
        } else {
            ticket.expirationTime = parseInt(ticket.expirationTime) + ticketTime
            ticket.save();
            playerEco.currency = parseInt(playerEco.currency) - price;
            playerEco.save();
            const embed = new discord.MessageEmbed()
                .setColor('#E02A6B')
                .setTitle('Space Ticket Manager')
                .setURL('https://cosmofficial.herokuapp.com/')
                .setDescription(`You have extended the Space Ticket timer for ${playerDoc.factionName} by 24hrs.\nIt will now expire in: ${ms(parseInt(ticket.expirationTime) - current_time)}`)
                .setFooter('Cosmofficial by POPINxxCAPS');
            try {
                return message.channel.send(embed);
            } catch (err) {}
        }
    }
}