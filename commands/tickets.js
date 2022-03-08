const lotteryTicketModel = require('../models/lotteryTicketSchema');
const lotteryPotModel = require('../models/lotteryPotSchema');
const economySettingsModel = require('../models/economySettingSchema');
const errorEmbed = require('../functions_discord/errorEmbed');
module.exports = {
    name: "tickets",
    aliases: ["t", "ticket"],
    permissions: ["SEND_MESSAGES"],
    description: "Views your lottery tickets",
    async execute(req) {
        const message = req.message;
        const discord = req.discord;
        const mainGuild = req.mainGuild;
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
        let ticketString = '';
        let ticketDocs = await lotteryTicketModel.find({
            guildID: message.guild.id,
            userID: message.author.id
        });

        if (ticketDocs.length === 0) {
            ticketString = 'You do not have any lottery tickets. #sadpanda'
        } else {
            let uniqueTickets = [];
            let duplicateTickets = 0;
            for (let i = 0; i < ticketDocs.length; i++) {
                let ticket = ticketDocs[i];
                if (uniqueTickets.includes(`${ticket.num1} ${ticket.num2} ${ticket.num3}`) === true) {
                        duplicateTickets += 1;
                } else {
                    uniqueTickets.push(`${ticket.num1} ${ticket.num2} ${ticket.num3}`)
                }
            }
            ticketString = `Unique Tickets: ${uniqueTickets.length}\nDuplicate Tickets: ${duplicateTickets}\nWin Chance: ${uniqueTickets.length * 0.1}%`
        }
        if (ticketString.length > 1023) return errorEmbed(message.channel, 'Too many tickets to display!\nMust be doing something right.')
        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle('Lottery Manager')
            .setURL('https://cosmofficial.herokuapp.com/')
            .addFields({
                name: `Your Tickets`,
                value: `${ticketString}`
            })
            .setFooter('Cosmobot by POPINxxCAPS');

        message.channel.send(embed);
        return
    }
};