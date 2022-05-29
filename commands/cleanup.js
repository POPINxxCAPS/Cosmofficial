const spawnerGridNames = ['Zone Chip Spawner', 'Ice Spawner', 'Iron Spawner', 'Silicon Spawner', 'Cobalt Spawner', 'Silver Spawner', 'Magnesium Spawner', 'Gold Spawner', 'Platinum Spawner', 'Uranium Spawner', 'Powerkit Spawner', 'Space Credit Converter', 'Common Loot Box', 'Ramshackle Loot Box', 'Apprentice Loot Box', 'Journeyman Loot Box', 'Mastercraft Loot Box', 'Ascendant Loot Box']
const gridDelete = require('../functions/execution/gridDelete');
const gridPowerOn = require('../functions/execution/gridPowerOn');
const gridPOwerOff = require('../functions/execution/gridPowerOff');
const errorEmbed = require('../functions/discord/errorEmbed');
const verificationModel = require('../models/verificationSchema');
const ms = require('ms');
const gridPowerOff = require('../functions/execution/gridPowerOff');

const parameters = [{
        name: 'ownedBy',
        acceptedValues: ['@username', 'inGameNameHere']
    }, {
        name: 'blockslessthan',
        acceptedValues: ['number']
    },
    {
        name: 'noowner',
        acceptedValues: ['no value needed']
    },
    {
        name: 'npc',
        acceptedValues: ['no value needed']
    },
];
module.exports = {
    name: 'cleanup',
    aliases: [],
    description: "Manually clean-up grids on server.\n- c!cleanup scan {parameter} {value}\n- c!cleanup delete {parameter} {value}.\n- c!cleanup parameters",
    permissions: ["SEND_MESSAGES"],
    category: "Administration",
    categoryAliases: ['administration', 'admin'],
    async execute(req) {
        const args = req.args;
        const message = req.message;
        const discord = req.discord;
        const guildID = req.guild.id;
        const client = req.client;
        const NPCNames = client.commonVars.get('NPCNames');
        let botStatDoc = await botStatModel.findOne({
            name: 'deletedByHoover'
        })
        if(botStatDoc === null) {
            botStatDoc = await botStatModel.create({
                name: 'deletedByHoover',
                value: '0'
            })
        }
        let gridDocs = await client.gridDocCache.get(guildID);
        if (args[0] !== 'scan' && args[0] !== 'delete' && args[0] !== 'parameters' && args[0] !== 'poweroff' && args[0] !== 'poweron') return errorEmbed(message.channel, 'Invalid argument ***one***.\nValid:\n- scan\n- delete\n- parameters\n- poweroff\n - poweron');

        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle(`Cleanup Manager`)
            .setURL('https://cosmofficial.herokuapp.com/')
            .setFooter('Cosmofficial by POPINxxCAPS');

        if (args[0] === 'parameters') {
            for (const item of parameters) {
                let acceptedValueString = '';
                for (const value of item.acceptedValues) {
                    acceptedValueString += `- ${value}\n`;
                }
                embed.addFields({
                    name: `Parameter: ${item.name}`,
                    value: `Accepted Values:\n${acceptedValueString}`
                })
            }
            try {
                return message.channel.send(embed)
            } catch (err) {}
        }
        if (gridDocs === undefined) return errorEmbed(message.channel, `The bot just restarted, or your server isn't linked.\nIf it is linked, please wait 5 minutes and try again.`)

        let grids = [];
        let params = [];
        let infoString = '';
        for (const item of parameters) {
            params.push(item.name);
        }
        if (params.includes(args[1]) === false) return errorEmbed(message.channel, 'Invalid argument ***two***.\nUse **c!cleanup parameters** for a valid list.');
        const param = args[1];
        const value = args[2];
        if (value === undefined && param !== 'npc' && param !== 'noowner') return errorEmbed(message.channel, 'Invalid argument ***three***.\nUse **c!cleanup parameters** for a valid list.');

        if (param === 'ownedBy') {
            const target = message.mentions.users.first();
            const check = await gridDocs.find(doc => doc.ownerDisplayName === value);
            if (!target && check === undefined) return errorEmbed(message.channel, 'Invalid argument ***three***.\nUse **c!cleanup parameters** for a valid list.');
            if (target !== undefined && target !== null) {
                const verDoc = await verificationModel.findOne({
                    userID: target.id
                })
                if (verDoc === null) return errorEmbed(message.channel, `This user is not verified. Use their in-game name instead!`);
                for (const grid of gridDocs) {
                    if (grid.ownerDisplayName === verDoc.username) {
                        if (infoString.length < 500) infoString += `${grid.displayName}\n`;
                        grids.push(grid);
                    } else continue;
                }
            } else {
                for (const grid of gridDocs) {
                    if (grid.ownerDisplayName === "Space Pirates" && spawnerGridNames.includes(grid.displayName) === true) continue;
                    if (grid.ownerDisplayName === value) {
                        if (infoString.length < 500) infoString += `${grid.displayName}\n`;
                        grids.push(grid);
                    } else continue;
                }
            }
        }

        if (param === 'blockslessthan') {
            if (value % 1 != 0 || value <= 0) return errorEmbed(message.channel, 'Value must be a whole number.')
            for (const grid of gridDocs) {
                if (grid.ownerDisplayName === "Space Pirates" && spawnerGridNames.includes(grid.displayName) === true) continue;
                if (grid.blocksCount < value) {
                    if (infoString.length < 500) infoString += `${grid.displayName}\n`;
                    grids.push(grid);
                } else continue;
            }
        }

        if (param === 'npc') {
            for (const grid of gridDocs) {
                if (grid.ownerDisplayName === "Space Pirates" && spawnerGridNames.includes(grid.displayName) === true) continue;
                if (NPCNames.includes(grid.ownerDisplayName) === true && grid.ownerDisplayName !== "Cosmofficial") {
                    if (infoString.length < 500) infoString += `${grid.displayName}\n`;
                    grids.push(grid);
                } else continue;
            }
        }

        if (param === 'noowner') {
            for (const grid of gridDocs) {
                if (grid.ownerDisplayName === "Space Pirates" && spawnerGridNames.includes(grid.displayName) === true) continue;
                if (grid.ownerDisplayName === '') {
                    if (infoString.length < 500) infoString += `${grid.displayName}\n`;
                    grids.push(grid);
                } else continue;
            }
        }

        if (args[0] === 'scan') {
            infoString = `${gridDocs.length} total grids scanned.\n${grids.length} grids matching search criteria.\n\nGrids Include:\n` + infoString;
            embed.setDescription(infoString);
            try {
                message.channel.send(embed)
            } catch (err) {}
        }

        if (args[0] === 'delete') {
            let count = 0;
            const secondsBetweenDeletion = 0.25
            for (const grid of grids) {
                count += 1;
                botStatDoc.value = parseInt(botStatDoc.value) + 1;
                const index = gridDocs.indexOf(grid);
                gridDocs.splice(index, 1);
                setTimeout(() => {
                    gridDelete(guildID, grid.entityID);
                }, ((count * secondsBetweenDeletion) * 1000));
                grid.remove();
            }
            client.gridDocCache.set(guildID, gridDocs)
            infoString = `${gridDocs.length} total grids remaining.\n${grids.length} grids being deleted.\nCompletes in: ${ms((count * secondsBetweenDeletion) * 1000)} (${1 / secondsBetweenDeletion} grid(s) per second)\n\nGrids Include:\n` + infoString;
            embed.setDescription(infoString);
            try {
                botStatDoc.save();
                message.channel.send(embed)
            } catch (err) {}
        }

        if (args[0] === 'poweroff') {
            let count = 0;
            const secondsBetweenPower = 0.25
            for (const grid of grids) {
                const index = gridDocs.indexOf(grid);
                count += 1;
                if (grid.isPowered === true || grid.isPowered === 'true') {
                    setTimeout(() => {
                        gridPowerOff(guildID, grid.entityID);
                    }, ((count * secondsBetweenPower) * 1000));
                }
                grid.isPowered = false;
                await grid.save().then(savedDoc => {
                    gridDocs[index] = savedDoc
                }).catch(err => {});
            }
            client.gridDocCache.set(guildID, gridDocs)
            infoString = `${gridDocs.length} total grids processed.\n${grids.length} grids being powered off.\nCompletes in: ${ms((count * secondsBetweenDeletion) * 1000)} (${1 / secondsBetweenDeletion} grid(s) per second)\n\nGrids Include:\n` + infoString;
            embed.setDescription(infoString);
            try {
                message.channel.send(embed)
            } catch (err) {}
        }

        if (args[0] === 'poweron') {
            let count = 0;
            const secondsBetweenPower = 0.25
            for (const grid of grids) {
                const index = gridDocs.indexOf(grid);
                count += 1;
                if (grid.isPowered === false || grid.isPowered === 'false') {
                    setTimeout(() => {
                        gridPowerOn(guildID, grid.entityID);
                    }, ((count * secondsBetweenPower) * 1000));
                }
                grid.isPowered = true;
                await grid.save().then(savedDoc => {
                    gridDocs[index] = savedDoc
                }).catch(err => {});
            }
            client.gridDocCache.set(guildID, gridDocs)
            infoString = `${gridDocs.length} total grids processed.\n${grids.length} grids being powered on.\nCompletes in: ${ms((count * secondsBetweenDeletion) * 1000)} (${1 / secondsBetweenDeletion} grid(s) per second)\n\nGrids Include:\n` + infoString;
            embed.setDescription(infoString);
            try {
                message.channel.send(embed)
            } catch (err) {}
        }
    }
}