const discord = require('discord.js')
const lotteryTicketModel = require('../models/lotteryTicketSchema');
const lotteryPotModel = require('../models/lotteryPotSchema');
const getPlayerEco = require('../functions_db/getPlayerEco')
const makeLotterySettingVar = require('../functions_misc/makeLotterySettingVar');
const makeChannelSettingVar = require('../functions_misc/makeChannelSettingVar')
const timerFunction = require('../functions_db/timerFunction');
const ms = require('ms');

module.exports = async (req) => {
    const current_time = Date.now();
    const client = req.client;
    const guildID = req.guildID;
    const guild = client.guilds.cache.get(guildID);
    const channelSettings = await makeChannelSettingVar(guildID, req.settings);
    const lotterySettings = await makeLotterySettingVar(guildID, req.settings);
    const drawTimeMS = lotterySettings.drawTime === undefined || lotterySettings.drawTime === 'Not Set' ? 3600000 : lotterySettings.drawTime
    const drawTime = current_time + (drawTimeMS) // Set draw time to 1hr from now
    const dailyInterestRate = lotterySettings.dailyInterestRate === undefined || lotterySettings.dailyInterestRate === 'Not Set' ? 0.01 : lotterySettings.dailyInterestRate / 100;
    req.expirationInSeconds = lotterySettings.updateInterval === undefined || lotterySettings.updateInterval === 'Not Set' ? 30 : lotterySettings.updateInterval
    req.name = 'lotteryHandler'
    const timerCheck = await timerFunction(req) // Delay for updating lottery channel
    if (timerCheck === true) return; // If there is a timer, cancel.
    const ecoSettings = req.ecoSettings;
    const currencyName = ecoSettings.currencyName;

    const embed = new discord.MessageEmbed()
        .setColor('#E02A6B')
        .setTitle('Lottery Manager')
        .setURL('https://cosmofficial.herokuapp.com/')

    if (guild === undefined || guild === null) return; // If bot is no longer in guild

    const channelID = channelSettings.lottery;
    if (channelID === undefined || channelID === 'Not Set') return;
    const channel = guild.channels.cache.get(channelID);
    if (channel === undefined || channel === null) return;

    const tickets = await lotteryTicketModel.find({
        guildID: guildID
    });

    let potDoc = await lotteryPotModel.findOne({
        guildID: guildID
    });
    if (potDoc === null) { // If guild does not have a lottery document, create one.
        let ran1 = Math.floor(Math.random() * 9);
        let ran2 = Math.floor(Math.random() * 9);
        let ran3 = Math.floor(Math.random() * 9);
        potDoc = await lotteryPotModel.create({
            guildID: guildID,
            potAmount: 100000,
            winningNum1: ran1,
            winningNum2: ran2,
            winningNum3: ran3,
            drawTime: drawTime
        })
    }
    // After confirming doc is created
    if (potDoc === null) return; // Just in case lol
    if (potDoc.drawTime > current_time) { // If not time to update tickets, just update the channel and return.
        if (tickets.length === 0) {
            ticketCount = 0;
        } else {
            ticketCount = tickets.length
        }
        embed.addFields({
                name: `Next Draw Time`,
                value: `${ms(potDoc.drawTime - current_time)}`
            }, {
                name: 'Current Pot Amount',
                value: `${Math.round(parseFloat(potDoc.potAmount)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
            }, {
                name: 'Current Ticket Count',
                value: `${ticketCount}`
            }, {
                name: 'Buy Tickets!',
                value: 'Use c!blt to purchase tickets!'
            })
            .setFooter('Cosmofficial by POPINxxCAPS');

        try {
            await channel.bulkDelete(2);
        } catch (err) {}
        return channel.send(embed);
    }

    const potInterest = Math.round((parseInt(potDoc.potAmount) * (dailyInterestRate / (86400000 / drawTimeMS))))
    // If it is time to draw tickets
    if (tickets.length === 0) { // If no tickets, cancel draw, return embed and update next draw time.
        potDoc.potAmount = potInterest + parseInt(potDoc.potAmount);

        embed.addFields({
                name: `No Tickets!`,
                value: `There are no tickets for this round. Cancelling draw.`
            }, {
                name: 'Interest added this round',
                value: `${potInterest.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
            }, {
                name: `${currencyName} in Pot`,
                value: `${Math.round(parseFloat(potDoc.potAmount)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
            })
            .setFooter('Cosmofficial by POPINxxCAPS');

        try {
            await channel.bulkDelete(2);
            channel.send(embed);
        } catch (err) {}
        potDoc.drawTime = drawTime
        potDoc.save();
        return;
    }


    // If there are tickets, check for winners
    let winningTickets = [];
    for (let t = 0; t < tickets.length; t++) {
        if ((tickets[t].num1 === potDoc.winningNum1) && (tickets[t].num2 === potDoc.winningNum2) && (tickets[t].num3 === potDoc.winningNum3)) {
            winningTickets.push(tickets[t])
        }
    }

    let winners = [];
    let totalWeight = 0;
    for (let w = 0; w < winningTickets.length; w++) { // Condense winning tickets into "player weights"
        let search = winners.find(winner => winner.userID === winningTickets.userID);
        totalWeight += 1;
        if (search === undefined) {
            search = {
                userID: winners.userID,
                weight: 1
            }
            winners.push(search)
        } else {
            search.weight += 1;
            const index = winners.findIndex(search);
            winners[index] = search;
        }
    }

    for (let t = 0; t < winners.length; t++) { // Reward each winner based on their weight (Winning ticket count)
        const playerEcoDoc = await getPlayerEco(guildID, userID, req.settings)
        const memberTarget = await guild.members.cache.find(member => member.id === verDoc.userID)
        const rewardAmount = (winners[t].weight / totalWeight) * (parseInt(potDoc.potAmount) * 0.8);
        playerEcoDoc.vault = parseInt(playerEcoDoc.vault) + rewardAmount;
        playerEcoDoc.save();
        try {
            memberTarget.send(`You won the lottery!\n${rewardAmount} ${currencyName} has been deposited into your vault!`)
        } catch (err) {}
    }

    if (winners.length !== 0) { // If winners were rewarded, return an embed with fields to match
        const totalRewardAmount = parseInt(potDoc.potAmount) * 0.8;
        let winnerString = '';
        for (let i = 0; i < winners.length; i++) {
            winnerString += `@<${winners[i].userID}>, ${winners[i].weight} Winning Tickets\n`
        }
        potDoc.potAmount = parseInt(potDoc.potAmount) - rewardAmount;
        potDoc.drawTime = drawTime;
        let ran1 = Math.floor(Math.random() * 9);
        let ran2 = Math.floor(Math.random() * 9);
        let ran3 = Math.floor(Math.random() * 9);
        potDoc.winningNum1 = ran1;
        potDoc.winningNum2 = ran2;
        potDoc.winningNum3 = ran3;
        potDoc.save()
        embed.addFields({
            name: `Winners`,
            value: `${winnerString}`
        }, {
            name: `Last Winning Numbers`,
            value: `${potDoc.winningNum1}, ${potDoc.winningNum2}, ${potDoc.winningNum3}`
        }, {
            name: `Total Tokens Rewarded`,
            value: `${totalRewardAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
        }, {
            name: 'New Pot Amount',
            value: `${Math.round(parseFloat(potDoc.potAmount)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
        })
        try {
            await channel.bulkDelete(2);
            return channel.send(embed);
        } catch (err) {}
        tickets.forEach(ticket => {
            ticket.remove()
        })
        return;
    }

    // If there are no winning tickets
    embed.addFields({
        name: `No Winning Tickets!`,
        value: `Better luck next time.`
    }, {
        name: `Last Winning Numbers`,
        value: `${potDoc.winningNum1}, ${potDoc.winningNum2}, ${potDoc.winningNum3}`
    }, {
        name: 'Interest added this round',
        value: `${potInterest.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
    }, {
        name: `${currencyName} in Pot`,
        value: `${Math.round(parseFloat(potDoc.potAmount)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
    })

    potDoc.potAmount = potInterest + parseInt(potDoc.potAmount);
    potDoc.drawTime = drawTime;
    let ran1 = Math.floor(Math.random() * 9);
    let ran2 = Math.floor(Math.random() * 9);
    let ran3 = Math.floor(Math.random() * 9);
    potDoc.winningNum1 = ran1;
    potDoc.winningNum2 = ran2;
    potDoc.winningNum3 = ran3;
    potDoc.save();
    tickets.forEach(ticket => {
        ticket.remove()
    })
    try {
        channel.bulkDelete(2);
        channel.send(embed);
    } catch(err) {}
    return;
}