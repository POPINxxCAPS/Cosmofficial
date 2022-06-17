const playerEcoModel = require('../models/playerEcoSchema');
const errorEmbed = require('../functions/discord/errorEmbed');
const queryFloatingObjs = require('../functions/execution/queryFloatingObjs');
const floatingObjDelete = require('../functions/execution/floatingObjDelete');
const characterModel = require('../models/characterSchema');
const verificationModel = require('../models/verificationSchema');
const cooldownFunction = require('../functions/database/cooldownFunction');
const cooldownEmbed = require('../functions/discord/cooldownEmbed');
const currencyNames = ['Cosmic Token', 'Space Credits']
module.exports = {
    name: 'convert',
    aliases: [],
    description: "Convert in-game currency to bot currency. Drop your in-game currency as a floating object, stand within 100m of the dropped currency, and type this command.",
    permissions: ["SEND_MESSAGES"],
    category: "Economy",
    categoryAliases: ['economy', 'eco'],
    async execute(req) {
        const message = req.message;
        const config = req.config;
        const discord = req.discord;
        cdInSec = 60;
        const cooldown = await cooldownFunction.cd('convert', cdInSec, message)
        if (cooldown !== undefined) return cooldownEmbed(message.channel, cooldown, 'Convert', message.author.id);
        const verDoc = await verificationModel.findOne({
            userID: message.author.id
        })
        if (verDoc === null) return errorEmbed(message.channel, 'You must be verified to use this command.');
        const characterDoc = await characterModel.findOne({
            name: verDoc.username
        })
        if (characterDoc === null) return errorEmbed(message.channel, 'You must be spawned in to use this command. \nIf you are spawned in, try again in a minute or two.');
        const floatingObjDocs = await queryFloatingObjs(config);
        if (floatingObjDocs === undefined) return errorEmbed(message.channel, 'Server queries have crashed. Server requires restart.');
        if (floatingObjDocs.length === 0) return errorEmbed(message.channel, 'There are no floating objects in the server. Did you drop your currency?\nIf you did, try again in a minute or two.');


        let items = []
        for (const floatingObj of floatingObjDocs) {
            let currency = false;
            for (const currencyName of currencyNames) {
                if (floatingObj.DisplayName.includes(currencyName) === true) currency = true;
            }
            if (currency === false) continue;

            var dx = characterDoc.x - floatingObj.Position.X;
            var dy = characterDoc.y - floatingObj.Position.Y;
            var dz = characterDoc.z - floatingObj.Position.Z;

            let distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (distance < 100) items.push(floatingObj);
        }

        if (items.length === 0) return errorEmbed(message.channel, 'No dropped currency found around your character. Drop your currency as an item, and type the command while standing nearby.\nNote: Bot may take up to 3m to update your character location.')
        let playerEcoDoc = await playerEcoModel.findOne({
            guildID: message.guild.id,
            userID: message.author.id
        })
        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle('Conversion Manager')
            .setURL('https://cosmofficial.herokuapp.com/')
            .setFooter('Cosmofficial by POPINxxCAPS');
        let totalCurrency = 0;
        for (const item of items) {
            let currencyAmount = item.Mass * 1000;
            totalCurrency += currencyAmount;
            await floatingObjDelete(message.guild.id, item.EntityId);
            playerEcoDoc.currency = parseInt(playerEcoDoc.currency) + currencyAmount;
        }
        playerEcoDoc.save();

        embed.setDescription(`Successfully converted ${totalCurrency} in-game currency to bot currency!\nMoney has been deposited to your balance.`);
        message.channel.send(embed)
    }
}