const chatModel = require('../models/chatSchema');
const lockedEmbed = require('../functions/discord/lockedEmbed');
// More crap that needs recoding

/*let commands = [{
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
}, ]*/

// Completely redoing this to auto-update as I make the commands :)

module.exports = {
    name: 'help',
    aliases: ['help'],
    description: "List all commands and helpful information.",
    permissions: ["SEND_MESSAGES"],
    category: "General",
    categoryAliases: ['general'],
    async execute(req) {
        const message = req.message;
        const args = req.args;
        const discord = req.discord;
        const client = req.client;
        const commands = client.commands;
        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle(`Cosmofficial Help`)
            .setURL('https://cosmofficial.herokuapp.com/')
            .setDescription(`Command format: c!help {category/command} [page]\n{} = Required\n[] = Optional`)
        // Main embed set-up

        let categories = [];
        for (const command of commands) {
            if(command[1].category === 'Cosmic' && message.guild.id !== '799685703910686720') continue; // If not running on cosmic, do not include cosmic categories/commands.
            if (categories.includes(command[1].category) === false) categories.push(command[1].category);
        }
        let categoryString = '';
        if (args[0] === undefined) { // If no category defined, list available categories
            categories.sort((a, b) => ((a) > (b)) ? 1 : -1) // Alphabetical sorting for display
            for (let a = 0; a < categories.length; a++) {
                categoryString += `${categories[a]}\n`
            }
            embed.addFields({
                    name: 'Categories',
                    value: categoryString
                }, )
                .setFooter('Cosmofficial by POPINxxCAPS');
            return message.channel.send(embed);
        }

        let helpSearch = [];
        let searchTerm = args[0].toLowerCase();
        for (const command of commands) {
            if(command[1].category === 'Cosmic' && message.guild.id !== '799685703910686720') continue; // If not running on cosmic, do not include cosmic categories/commands.
            console.log(command[1].category === 'Cosmic')
            console.log(message.guild.id !== '799685703910686720')
            if (command[1].category === searchTerm || command[1].aliases.includes(searchTerm) === true || command[1].name === searchTerm || command[1].categoryAliases.includes(searchTerm) === true) {
                helpSearch.push(command)
            }
        };

        if (helpSearch.length === 0) { // Return an error message (unfinished)
            embed.addFields({
                name: 'Invalid Format',
                value: 'Category/Command not found.'
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
        if (startingPoint > helpSearch.length) {
            startingPoint = helpSearch.length - 10;
        }
        if (startingPoint < 0) startingPoint = 0; // Redundancy crash check
        let endingPoint = (startingPoint + 10);
        if (endingPoint < helpSearch.length) endingPoint = helpSearch.length;

        for (let i = startingPoint; i < endingPoint; i++) {
            const command = helpSearch[i];
            console.log(command)
            if (command === undefined) continue;
            if (command[1].cosmicOnly === false || command[1].cosmicOnly === undefined) {
                let embedValue = `${command[1].description}`
                if (command[1].format !== '' && command[1].format !== undefined) {
                    embedValue += `\nFormat: ${command[1].format}`
                }
                embed.addFields({
                    name: `${command[1].name}`,
                    value: embedValue
                })
            }
            if (command[1].cosmicOnly === true && message.guild.id === '799685703910686720') {
                let embedValue = `${command[1].description}`
                if (command[1].cosmicOnly === false || command[1].cosmicOnly === undefined) {
                    embedValue += `\nFormat: ${command[1].format}`
                }
                embed.addFields({
                    name: `${command[1].name}`,
                    value: embedValue
                })
            }
        }
        if (endingPoint < helpSearch.length) {
            embed.setFooter(`c!help ${category.aliases[0]} ${page + 2}\nCosmofficial by POPINxxCAPS`);
        }
        return message.channel.send(embed);
    }
}