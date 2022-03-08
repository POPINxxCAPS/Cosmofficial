const playerEcoModel = require("../models/playerEcoSchema");
const lotteryTicketModel = require('../models/lotteryTicketSchema');
const lotteryPotModel = require('../models/lotteryPotSchema');
const economySettingsModel = require('../models/economySettingSchema');

const lockedEmbed = require('../functions_discord/lockedEmbed')

module.exports = {
    name: "buylotteryticket",
    aliases: ["buyticket", "blt"],
    permissions: ["SEND_MESSAGES"],
    description: "Buys a lottery ticket",
    async execute(req) {
        const message = req.message;
        const args = req.args;
        const discord = req.discord;
        const mainGuild = req.mainGuild;
        const playerEco = req.playerEco;

        let guildOwner = mainGuild.members.cache.get(message.guild.owner.user.id);
        if (!guildOwner) return message.channel.send('The owner of this discord must be in the Cosmofficial discord to enable usage of this command.');

        let economyPackage;
        if (guildOwner.roles.cache.has('854236270129971200') || guildOwner.roles.cache.has('883535930630213653') || guildOwner.roles.cache.has('883534965650882570')) {
            economyPackage = true;
        }
        if (economyPackage !== true) return lockedEmbed(message.channel, discord);

        let ecoSettings = await economySettingsModel.findOne({
            guildID: message.guild.id,
        })
        if (ecoSettings === null) {
            return errorEmbed(message.channel, 'An admin must first setup economy with c!ces')
        }
        let ticketPrice = 10000;
        ecoSettings.settings.forEach(setting => {
            if (setting.name === 'LotteryTicketPrice') {
                ticketPrice = Math.round(Number(setting.value));
            }
        })
        if (ticketPrice === NaN) return message.channel.send('Invalid ticket price. Ask an admin to check the lottery ticket price setting.');

        let buyAmount = `${Math.round(args[0])}`;
        if (buyAmount === 'NaN') {
            message.reply(`Invalid Argument One. Please enter the amount of tickets you would like to purchase after the command.\nPrice: ${ticketPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} / ticket`)
            return
        }
        let totalPrice = ticketPrice * parseInt(buyAmount);
        if (playerEco.currency < totalPrice) { // If player does not have enough tokens
            if (playerEco.vault < totalPrice) {
                message.reply(`You do not have enough tokens to purchase ${buyAmount} tickets. \nTotal Price: ${totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`)
                return
            } else {
                message.reply(`Please withdraw your tokens from your vault to purchase ${buyAmount} tickets. \nTotal Price: ${totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`)
                return
            }
        }
        let potDoc = await lotteryPotModel.findOne({
            guildID: message.guild.id
        });
        potDoc.potAmount = parseFloat(potDoc.potAmount) + Math.round(totalPrice * 0.8);
        potDoc.save();
        playerEco.currency = parseInt(playerEco.currency) - totalPrice;
        playerEco.save();
        let iterations = parseInt(buyAmount)
        for (let i = 0; i < iterations; i++) {
            let ran1 = Math.floor(Math.random() * 9);
            let ran2 = Math.floor(Math.random() * 9);
            let ran3 = Math.floor(Math.random() * 9);
            let create = await lotteryTicketModel.create({
                guildID: message.guild.id,
                userID: message.author.id,
                num1: ran1,
                num2: ran2,
                num3: ran3
            });
            await create.save();
        }
        message.reply(`Successfully purchased ${buyAmount} tickets. Use c!tickets to view your current tickets and lucky numbers!`)
        return


    }
};