const lotteryTicketModel = require('../models/lotteryTicketSchema');
const lotteryPotModel = require('../models/lotteryPotSchema');
const playerEcoModel = require('../models/playerEcoSchema');
const ms = require('ms');
const economySettingModel = require('../models/economySettingSchema');
const discordServerSettingModel = require('../models/discordServerSettngsSchema');

const dailyInterestRate = 0.1;
module.exports = async (client, discord) => {
    const guildIDs = await client.guilds.cache.map(guild => guild.id);
    const mainGuild = client.guilds.cache.get("853247020567101440");

    setInterval(async () => {
        guildIDs.forEach(async guildID => {
            const guild = client.guilds.cache.get(guildID);
            if (guild === undefined || guild === null) return; // If bot is no longer in guild
            let current_time = Date.now();

            let economyPackage;
            if(guild.owner === null) return; // Redundancy Check
            let guildOwner = mainGuild.members.cache.get(guild.owner.user.id);
            if (!guildOwner) return; // If guild owner is no longer in Cosmofficial discord

            if (guildOwner.roles.cache.has('854236270129971200') || guildOwner.roles.cache.has('883535930630213653') || guildOwner.roles.cache.has('883534965650882570')) {
                economyPackage = true;
            }
            let channelID;
            let currencyName;

            if (economyPackage === true) {
                let ecoSettings = await economySettingModel.findOne({
                    guildID: guildID
                })
                if (ecoSettings !== null) {
                    ecoSettings.settings.forEach(setting => {
                        if (setting.name === 'LotteryChannel') {
                            channelID = setting.value
                        }
                        if (setting.name === 'CurrencyName') {
                            currencyName = setting.value
                        }
                    })
                }
            }
            if (channelID === undefined || channelID === 'Not Set') return;


            let channel = client.channels.cache.get(channelID);
            if (channel === undefined || channel === null) return;

            let drawTime = current_time + (3600 * 1000) // Set draw time to 1hr from now
            let potDoc = await lotteryPotModel.findOne({
                guildID: guildID
            });
            if (potDoc === null) {
                let ran1 = Math.floor(Math.random() * 9);
                let ran2 = Math.floor(Math.random() * 9);
                let ran3 = Math.floor(Math.random() * 9);
                await lotteryPotModel.create({
                    guildID: guildID,
                    potAmount: 100000,
                    winningNum1: ran1,
                    winningNum2: ran2,
                    winningNum3: ran3,
                    drawTime: drawTime
                })
                potDoc = await lotteryPotModel.findOne({
                    guildID: guildID
                });
            }

            // After confirming doc is created
            drawTime = current_time + (3600 * 1000) // Set draw time to 1hr from now

            if (potDoc.drawTime < current_time) { // If time to draw tickets
                let tickets = await lotteryTicketModel.find({
                    guildID: guildID
                });
                if (tickets.length === 0) { // If no tickets, cancel draw, return embed and update next draw time.
                    let potInterest = Math.round((parseInt(potDoc.potAmount) * (dailyInterestRate / 24)))
                    potDoc.potAmount = potInterest + parseInt(potDoc.potAmount);

                    const embed = new discord.MessageEmbed()
                        .setColor('#E02A6B')
                        .setTitle('Lottery Manager')
                        .setURL('https://cosmofficial.herokuapp.com/')
                        .addFields({
                            name: `No Tickets!`,
                            value: `There are no tickets for this round. Cancelling draw.`
                        }, {
                            name: 'Interest added this round',
                            value: `${potInterest.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
                        }, {
                            name: 'Cosmic Tokens in Pot',
                            value: `${Math.round(parseFloat(potDoc.potAmount)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
                        })
                        .setFooter('Cosmofficial by POPINxxCAPS');

                    try {
                        await channel.bulkDelete(1);
                    channel.send(embed);

                    } catch (err) {}

                    potDoc.drawTime = drawTime
                    potDoc.save();
                    return;
                }


                // If there are tickets, check if any won
                let winningTickets = [];
                for (let t = 0; t < tickets.length; t++) {
                    if ((tickets[t].num1 === potDoc.winningNum1) && (tickets[t].num2 === potDoc.winningNum2) && (tickets[t].num3 === potDoc.winningNum3)) {
                        winningTickets.push(tickets[t])
                    }
                }

                // If no winning tickets, update winning numbers+draw time and return embed
                if (winningTickets === [] || winningTickets[0] === undefined) {
                    let potInterest = Math.round((parseInt(potDoc.potAmount) * (dailyInterestRate / 24)))
                    potDoc.potAmount = potInterest + parseInt(potDoc.potAmount);
                    const embed = new discord.MessageEmbed()
                        .setColor('#E02A6B')
                        .setTitle('Lottery Manager')
                        .setURL('https://cosmofficial.herokuapp.com/')
                        .addFields({
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
                        .setFooter('Cosmofficial by POPINxxCAPS');

                    try {
                        await channel.bulkDelete(1);
                        channel.send(embed);
                    } catch (err) {}


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
                    return;
                }



                // If there are winning tickets in the array
                let rewardAmount = Math.round(parseFloat(potDoc.potAmount) * 0.8);
                let winnerString = '';

                // Reward all winning tickets
                for (let w = 0; w < winningTickets.length; w++) {
                    let playerEcoDoc = await playerEcoModel.findOne({
                        guildID: guildID,
                        userID: winningTickets[w].userID
                    });
                    playerEcoDoc.currency = parseInt(playerEcoDoc.currency) + Math.round(rewardAmount / winningTickets.length);
                    playerEcoDoc.save();
                    let user = client.users.cache.find(user => user.id === winningTickets[w].userID)
                    winnerString += `${user.username} Won ${Math.round(rewardAmount / winningTickets.length)} ${currencyName}\n`;
                }

                // Update pot amount to 20% of it's original amount
                potDoc.potAmount = parseInt(potDoc.potAmount) - rewardAmount;
                const embed = new discord.MessageEmbed()
                    .setColor('#E02A6B')
                    .setTitle('Cosmic Lottery')
                    .setURL('https://cosmofficial.herokuapp.com/')
                    .setDescription('Showing lottery info')
                    .addFields({
                        name: `Winners`,
                        value: `${winnerString}`
                    }, {
                        name: `Last Winning Numbers`,
                        value: `${potDoc.winningNum1}, ${potDoc.winningNum2}, ${potDoc.winningNum3}`
                    }, {
                        name: `Total Tokens Rewarded`,
                        value: `${rewardAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
                    }, {
                        name: 'New Pot Amount',
                        value: `${Math.round(parseFloat(potDoc.potAmount)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
                    })
                    .setFooter('Cosmofficial by POPINxxCAPS');

                try {
                    await channel.bulkDelete(1);
                } catch (err) {}
                channel.send(embed);


                potDoc.drawTime = drawTime;
                let ran1 = Math.floor(Math.random() * 9);
                let ran2 = Math.floor(Math.random() * 9);
                let ran3 = Math.floor(Math.random() * 9);
                potDoc.winningNum1 = ran1;
                potDoc.winningNum2 = ran2;
                potDoc.winningNum3 = ran3;
                potDoc.save()

                tickets.forEach(ticket => {
                    ticket.remove()
                })
            } else {
                // If not time to draw tickets
                let ticketCount = await lotteryTicketModel.find({
                    guildID: guildID
                });
                if (ticketCount === undefined || ticketCount === [] || ticketCount === null || !ticketCount[0] || ticketCount[0] === undefined) {
                    ticketCount = 0;
                } else {
                    ticketCount = ticketCount.length
                }
                potDoc = await lotteryPotModel.findOne({
                    guildID: guildID
                });
                const embed = new discord.MessageEmbed()
                    .setColor('#E02A6B')
                    .setTitle('Lottery Manager')
                    .setURL('https://cosmofficial.herokuapp.com/')
                    .setDescription('Showing lottery info')
                    .addFields({
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
                    await channel.bulkDelete(1);
                } catch (err) {}
                channel.send(embed);
            }
        })
    }, 120000)
}