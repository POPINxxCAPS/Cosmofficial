const lockedEmbed = require('../functions_discord/lockedEmbed');
const errorEmbed = require('../functions_discord/errorEmbed');
const gridModel = require('../models/gridSchema');
const remoteConfigModel = require('../models/remoteConfigSchema')
const chatModel = require('../models/chatSchema');
const economyModel = require('../models/economySettingSchema');
const allianceModel = require('../models/allianceSchema');
const playerModel = require('../models/playerSchema');
const verificationModel = require('../models/verificationSchema');

module.exports = {
    name: 'deletealliance',
    aliases: ['da'],
    description: "Create an alliance",
    permissions: ["SEND_MESSAGES"],
    async execute(req) {
        const message = req.message;
        const args = req.args;
        const discord = req.discord;
        if (args[0] === undefined) return errorEmbed(message.channel, '**Invalid Argument**\nPlease enter your alliance name to confirm!')
        let name = args[0];
        for (let i = 1; i < args.length; i++) {
            name = name + ' ' + `${args[i]}`;
        }

        const test = await allianceModel.findOne({
            allianceName: name
        })
        if (test === null) return errorEmbed(message.channel, 'Invalid alliance name!');
        if (test.allianceLeaderID !== message.author.id) return errorEmbed(message.channel, 'Only the alliance leader can use this command!');
        // Delete the alliance
        test.remove();
        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle('Alliance Manager')
            .setURL('https://cosmofficial.herokuapp.com/')
            .setFooter('Cosmofficial by POPINxxCAPS')
            .setDescription(`Alliance **${name}** successfully deleted.`)
        try {
            message.channel.send(embed)
        } catch(err) {}
    }
}