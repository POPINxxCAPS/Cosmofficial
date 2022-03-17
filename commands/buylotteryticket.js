const lotteryTicketModel = require('../models/lotteryTicketSchema');
const lotteryPotModel = require('../models/lotteryPotSchema');

module.exports = {
    name: "buylotteryticket",
    aliases: ["buyticket", "blt"],
    permissions: ["SEND_MESSAGES"],
    description: "Buys a lottery ticket",
    category: "Economy",
    async execute(req) {
        const message = req.message;
        const args = req.args;
        const discord = req.discord;
        const mainGuild = req.mainGuild;
        let playerEco = req.playerEco;
        const lotterySettings = req.lotterySettings;

        let ticketPrice = lotterySettings.ticketPrice;
        ticketPrice = Math.round(Number(ticketPrice));
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
        let createTickets = [];
        for (let i = 0; i < iterations; i++) {
            const ran1 = Math.floor(Math.random() * 9);
            const ran2 = Math.floor(Math.random() * 9);
            const ran3 = Math.floor(Math.random() * 9);
            const create = {
                guildID: message.guild.id,
                userID: message.author.id,
                num1: ran1,
                num2: ran2,
                num3: ran3
            };
            createTickets.push(create);
        }
        await lotteryTicketModel.insertMany(createTickets); // Much better for performance :p
        message.reply(`Successfully purchased ${buyAmount} tickets. Use c!tickets to view your current tickets and lucky numbers!`)
        return


    }
};