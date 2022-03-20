const checkPatron = require('../functions/misc/checkPatron');
const errorEmbed = require('../functions/discord/errorEmbed');
const lockedEmbed = require('../functions/discord/lockedEmbed');
const ms = require('ms');
module.exports = {
    name: 'settings',
    aliases: ['set'],
    description: "Edit bot settings. This includes almost all bot configuration.",
    permissions: ["ADMINISTRATOR"],
    category: "Administration",
    async execute(req) {
        // New Settings Command Format: c!settings {category} {setting} {value}
        const client = req.client;
        const message = req.message;
        const args = req.args;
        const guild = req.guild;
        const discord = req.discord;
        let settings = req.settings

        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle(`Settings Manager`)
            .setURL('https://cosmofficial.herokuapp.com/')
            .setFooter('Cosmofficial by POPINxxCAPS');
        const category = args[0];
        const setting = args[1];
        const value = args[2];

        if (category === undefined) { // If category is undefined, list available categories and descriptions.
            let string = '';
            for (let i = 0; i < settings.length; i++) {
                string += `__**${settings[i].displayName}**__\n${settings[i].description}\nEdit command: c!settings ${settings[i].name}\n\n`;
            }
            embed.setDescription(string);
            return message.channel.send(embed)
        }

        // If there is a category defined
        let categorySearch = settings.find(cat => cat.aliases.includes(category) === true || cat.name === category)

        if (categorySearch === undefined) return errorEmbed(message.channel, 'Category was not found. Please check your spelling and try again.')
        if (categorySearch.guildOwnerOnly === true) { // Confirm it's the guild owner running the command.
            if (message.author.id !== message.guild.owner.user.id) return errorEmbed(message.channel, 'Only the discord owner may edit settings in this category.');
        }
        if(categorySearch.patronReq === true) {
            const patron = await checkPatron(client, message.guild.owner.user.id)
            if(patron === false) return lockedEmbed(message.channel, discord)
        }

        if (setting === undefined) { // If setting is undefined, list available settings within that category.
            let string = '';
            for (let i = 0; i < categorySearch.settings.length; i++) {
                string += `__**${categorySearch.settings[i].displayName}**__\nCurrent Value: ${categorySearch.settings[i].value}\n${categorySearch.settings[i].description}\nEdit command: c!settings ${categorySearch.name} ${categorySearch.settings[i].setting} {value}\n\n`;
            }
            embed.setDescription(string);
            return message.channel.send(embed)
        }

        // If there is a setting defined
        let settingSearch = categorySearch.settings.find(set => set.setting === setting);

        if (settingSearch === undefined) return errorEmbed(message.channel, 'Setting name was not found. Please check your spelling and try again.')
        // If setting was found
        if (value === undefined) return errorEmbed(message.channel, 'Missing a value after setting name. Please include a value.');

        // And value is described
        let testVar;
        let errorString;
        if (settingSearch.valueType === 'time') {
            // Attempt to get time value
            try {
                testVar = ms(value)
                embed.setDescription(`${settingSearch.displayName} Successfully changed to ${settingSearch.value}`);
            } catch (err) {
                errorString = 'Invalid Setting Value.\nValid: 1d, 4h, 30m, etc.'
            }
        }
        if (settingSearch.valueType === 'number') {
            // Verify number is a whole number
            if (value % 1 != 0 || value <= 0) {
                errorString = 'Invalid Setting Value.\nValid: Any whole number.';
            } else {
                testVar = value;
                embed.setDescription(`${settingSearch.displayName} Successfully changed to ${value}`);

            }
        }
        if (settingSearch.valueType === 'boolean') {
            // Verify value is true/false
            if (value !== 'true' && value !== 'false') {
                errorString = 'Invalid Setting Value.\nValid: true/false.'
            } else {
                testVar = value;
                embed.setDescription(`${settingSearch.displayName} Successfully changed to ${value}`);

            }
        }
        if (settingSearch.valueType === 'string') {
            testVar = value; // No checks really needed for this one.
            // Might need to set it up to allow more than 1word? Not really needed though.
            embed.setDescription(`${settingSearch.displayName} Successfully changed to ${value}`);
        }
        if (settingSearch.valueType === 'channel') {
            // Confirm channel actually exists
            const channel = message.guild.channels.cache.get(value)
            if (channel === undefined) errorString = 'Not a valid channel ID. Please enter a valid channel ID.';
            testVar = value;
            embed.setDescription(`${settingSearch.displayName} Successfully changed to <#${value}>`);
        }

        if (errorString !== undefined) return errorEmbed(message.channel, errorString);
        if (testVar === undefined) return errorEmbed(message.channel, 'An unknown error occurred. Contact the bot owner.');

        settingSearch.value = testVar;
        settingSearch.save();
        return message.channel.send(embed);
    }
}