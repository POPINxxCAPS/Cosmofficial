const gridModel = require('../models/gridSchema');
const errorEmbed = require('../functions/discord/errorEmbed');
const makeConfigVar = require('../functions/misc/makeConfigVar');
const gridDelete = require('../functions/execution/gridDelete');

module.exports = {
    name: 'deletegrid',
    aliases: ['dg'],
    description: "Delete a specific grid. Accepts an EntityID or Grid Name.",
    permissions: ["SEND_MESSAGES"],
    category: "Administration",
    async execute(req) {
        const message = req.message;
        const args = req.args;
        const discord = req.discord;

        let grid;
        if (parseInt(args[0]) !== NaN) { // If entity ID is used
            grid = await gridModel.findOne({
                guildID: message.guild.id,
                entityID: args[0]
            })
        } else {
            let searchTerm = args[0];
            for (let i = 1; i < args.length; i++) {
                searchTerm = searchTerm + ' ' + `${args[i]}`;
            }

            if (searchTerm === '') return errorEmbed(message.channel, `**Invalid Argument *one***\nPlease enter a grid name.`);

            grid = await gridModel.findOne({
                guildID: message.guild.id,
                displayName: searchTerm
            })
        }


        if (grid === null) return errorEmbed(message.channel, `Grid does not exist, ${searchTerm} queued for deletion by the Hoover.\nIf it appears again in the database, it will be deleted.`);

        await gridDelete(message.guild.id, grid.entityID)
        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle(`Grid Manager`)
            .setURL('https://cosmofficial.herokuapp.com/')
            .setFooter('Cosmofficial by POPINxxCAPS')
            .setDescription(`Grid ${grid.displayName} Successfully Deleted.`)
        message.channel.send(embed);
    }
}