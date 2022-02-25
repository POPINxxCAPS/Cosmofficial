const chatModel = require('../models/chatSchema');
const lockedEmbed = require('../functions_discord/lockedEmbed');
const helpData = require('../data/helpCommand/route')
// More crap that needs recoding

let commands = [{
    aliases: ['general'],
    commands: helpData.general,
}, {
    aliases: ['economy'],
    commands: helpData.economy,
}, {
    aliases: ['games', 'Games'],
    commands: helpData.games
}, {
    aliases: ['admin', 'administration'],
    commands: helpData.administration
}, {
    aliases: ['support'],
    commands: helpData.support
}, {
    aliases: ['mapping'],
    commands: helpData.mapping
}, {
    aliases: ['combat'],
    commands: helpData.combat
}, {
    aliases: ['faq'],
    commands: helpData.faq
}, ]

module.exports = {
    name: 'help',
    aliases: ['help'],
    description: "List server chat messages",
    permissions: ["SEND_MESSAGES"],
    async execute(message, args, cmd, client, discord, mainGuild, guild, playerEco) {
        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle(`Cosmofficial Help`)
            .setURL('https://cosmofficial.herokuapp.com/')
            .setDescription(`Command format: c!help {category/command} [page]\n{} = Required\n[] = Optional`)
        // Main embed set-up

        if (args[0] === undefined) { // If no category defined, list available categories
            embed.addFields({
                    name: 'Categories',
                    value: `Adminstration\nGeneral\nEconomy\nEvents\nCombat\nMapping\nSupport\nFAQ\nAlliance`
                }, )
                .setFooter('Cosmofficial by POPINxxCAPS');
            return message.channel.send(embed);
        }

        let category;
        let searchTerm = args[0].toLowerCase();
        for (let a = 0; a < commands.length; a++) {
            let categoryArray = commands[a]
            if (categoryArray.aliases.includes(searchTerm)) {
                category = categoryArray
            }
        }

        if (category === undefined) { // Return an error message (unfinished)
            embed.addFields({
                name: 'Invalid Format',
                value: 'Category not found.'
            })
            return message.channel.send(embed);
        };

        let page = 0;
        if (args[1] !== undefined) {
            if (args[1] % 1 != 0 || args[1] <= 0) { // Attempt to set page #, verify it is a whole number
                embed.addFields({
                    name: 'Invalid Format',
                    value: 'Page must be a number.'
                })
                return message.channel.send(embed)
            } else {
                page = parseInt(args[1]) - 1;
            }
        }
        let startingPoint = page * 10;
        if (startingPoint > category.commands.length) {
            startingPoint = category.commands.length - 10;
        }
        if (startingPoint < 0) { // Redundancy crash checks
            startingPoint = 0;
        }
        let endingPoint = (startingPoint + 10);
        for (let i = startingPoint; i < endingPoint; i++) {
            if (category.commands[i] !== undefined) {
                if (category.commands[i].cosmicOnly === undefined) {
                    let embedValue = `${category.commands[i].description}`
                    if (category.commands[i].format !== '') {
                        embedValue += `\nFormat: ${category.commands[i].format}`
                    }
                    embed.addFields({
                        name: `${category.commands[i].name}`,
                        value: embedValue
                    })
                }
                if (category.commands[i].cosmicOnly === true && message.guild.id === '799685703910686720') {
                    let embedValue = `${category.commands[i].description}`
                    if (category.commands[i].format !== '') {
                        embedValue += `\nFormat: ${category.commands[i].format}`
                    }
                    embed.addFields({
                        name: `${category.commands[i].name}`,
                        value: embedValue
                    })
                }
            }
        }
        if (endingPoint < category.commands.length) {
            embed.setFooter(`c!help ${category.aliases[0]} ${page + 2}\nCosmofficial by POPINxxCAPS`);
        }
        return message.channel.send(embed);
    }
}