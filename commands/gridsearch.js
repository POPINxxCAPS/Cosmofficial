const verificationModel = require('../models/verificationSchema');
const gridModel = require('../models/gridSchema');
const errorEmbed = require('../functions_discord/errorEmbed');

module.exports = {
    name: 'gridsearch',
    aliases: ['gs'],
    description: "Check the database for a specific grid name",
    permissions: ["SEND_MESSAGES"],
    async execute(req) {
        const message = req.message;
        const args = req.args;
        const discord = req.discord;
        let searchTerm = args[0];
        for (let i = 1; i < args.length; i++) {
            searchTerm = searchTerm + ' ' + `${args[i]}`;
        }

        if (searchTerm === '') return errorEmbed(message.channel, `**Invalid Argument *one***\nPlease enter a grid name.`);

        let grid = await gridModel.findOne({
            guildID: message.guild.id,
            displayName: searchTerm
        })



        if (grid === null) return errorEmbed(message.channel, `Grid does not exist, or it is attached to another grid.`);
        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle(`Grid Manager`)
            .setURL('https://cosmofficial.herokuapp.com/')
            .setFooter('Cosmofficial by POPINxxCAPS')
            .addFields({
                name: 'Grid Name',
                value: grid.displayName
            }, {
                name: 'Owner',
                value: grid.ownerDisplayName
            }, {
                name: 'Entity ID',
                value: grid.entityID
            })
        message.channel.send(embed);
        let verDoc = await verificationModel.findOne({
            userID: message.author.id
        })

        if (verDoc !== null) {
            if (grid.ownerDisplayName === verDoc.username) {
                embed.addFields({
                    name: 'X',
                    value: grid.positionX
                }, {
                    name: 'Y',
                    value: grid.positionY
                }, {
                    name: 'Z',
                    value: grid.positionZ
                })
                message.author.send(embed)
            }
        }
    }
}