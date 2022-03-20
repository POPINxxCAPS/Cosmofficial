const checkGridForFaction = require('../functions/database/checkGridForFaction');
const verificationModel = require('../models/verificationSchema');
let playerEcoModel = require('../models/playerEcoSchema');
const gridModel = require('../models/gridSchema');
const playerModel = require('../models/playerSchema');
const characterModel = require('../models/characterSchema');
const ms = require('ms');
const hotzoneSettingModel = require('../models/hotzoneSettingSchema');
const hotzoneEntityModel = require('../models/hotzoneEntitySchema');
const hotzoneModel = require('../models/hotzoneSchema');
const discordServerSettingModel = require('../models/discordServerSettingsSchema');
const interval = 60000;

// Noob code from absolute hell. Needs complete re-do.
module.exports = async (client, discord) => {
    const guildIDs = await client.guilds.cache.map(guild => guild.id);
    const mainGuild = client.guilds.cache.get("853247020567101440");

    setInterval(async () => {
        guildIDs.forEach(async guildID => {
            const embed = new discord.MessageEmbed()
                .setColor('#E02A6B')
                .setTitle(`Hotzone Alerts`)
                .setURL('https://cosmofficial.herokuapp.com/')
                .setFooter('Cosmofficial by POPINxxCAPS')
            const guild = client.guilds.cache.get(guildID);
            if (guild === undefined || guild === null) return; // If bot is no longer in guild
            let current_time = Date.now();

            let eventPackage;
            if(guild.owner === null) return; // Redundancy Check
            let guildOwner = mainGuild.members.cache.get(guild.owner.user.id);
            if (!guildOwner) return; // If guild owner is no longer in Cosmofficial discord

            if (guildOwner.roles.cache.has('854211115915149342') || guildOwner.roles.cache.has('883535930630213653') || guildOwner.roles.cache.has('883534965650882570')) {
                eventPackage = true;
            }

            let hotzoneSettings = await hotzoneSettingModel.findOne({
                guildID: guildID
            })
            if (hotzoneSettings === null) return;
            if (hotzoneSettings.hotzoneEnabled === false) return;

            let discordSettings = await discordServerSettingModel.findOne({
                guildID: guildID
            })
            if (discordSettings === null) return;

            let channelID = discordSettings.hotzoneChannel;
            if (channelID === undefined || channelID === 'Not Set') return;
            let channel = client.channels.cache.get(channelID);
            if (channel === undefined || channel === null) return;

            let hotzoneDoc = await hotzoneModel.findOne({
                guildID: guildID
            })
            if (hotzoneDoc === null) { // If no hotzone doc, create a blank doc
                await hotzoneModel.create({
                    guildID: guildID,
                    x: '0',
                    y: '0',
                    z: '0',
                    expirationTime: '0'
                })
                hotzoneDoc = await hotzoneModel.findOne({
                    guildID: guildID
                })
            }



            let newZoneTimer = parseInt(hotzoneDoc.expirationTime) + parseInt(hotzoneSettings.hotzoneInterval);
            if (newZoneTimer < current_time) { // If time for a new zone
                if (hotzoneSettings.presetZones === true) { // Select a zone from the preset zones
                    // Unfinished



                } else { // If not using preset zones, generate a random zone based on spawn range setting
                    let current_time = Date.now()
                    let expirationTime = parseInt(hotzoneSettings.hotzoneTimer) + current_time;
                    let randomX = Math.floor(Math.random() * (hotzoneSettings.hotzoneSpawnRange / 3)) + 1;
                    randomX *= Math.round(Math.random()) ? 1 : -1;
                    let randomY = Math.floor(Math.random() * (hotzoneSettings.hotzoneSpawnRange / 3)) + 1;
                    randomY *= Math.round(Math.random()) ? 1 : -1;
                    let randomZ = Math.floor(Math.random() * (hotzoneSettings.hotzoneSpawnRange / 3)) + 1;
                    randomZ *= Math.round(Math.random()) ? 1 : -1;

                    hotzoneDoc.x = randomX;
                    hotzoneDoc.y = randomY;
                    hotzoneDoc.z = randomZ;
                    hotzoneDoc.expirationTime = expirationTime;
                    hotzoneDoc.save();
                }
                embed.addFields({
                    name: 'New Hotzone',
                    value: `Expires In: ${ms(parseInt(hotzoneSettings.hotzoneInterval))}`
                })
            }



            let descriptionString = '';
            if (parseInt(hotzoneDoc.expirationTime) < current_time) { // If zone is expired, tweak message
                descriptionString += `Zone Expired\n`
            } else {
                descriptionString += `Zone Expires in: ${ms(parseInt(hotzoneDoc.expirationTime) - current_time)}\n`
            }
            descriptionString += `Next Zone: ${ms(newZoneTimer - Date.now())}`
            embed.setDescription(`${descriptionString}`);



            if (parseInt(hotzoneDoc.expirationTime) < current_time) { // If zone is expired, send embed as it is and check if any players need rewarding
                let hotzoneCharDocs = await hotzoneEntityModel.find({
                    category: 'Character',
                    guildID: guildID
                })
                if(hotzoneCharDocs.length !== 0) {
                    let sorted = hotzoneCharDocs.sort((a, b) => ((a.entryTime) > (b.entryTime)) ? -1 : 1);
                    let verificationDoc = await verificationModel.findOne({
                        username: sorted[0].displayName
                    })
                    if(verificationDoc !== null) {
                        let playerEcoDoc = await playerEcoModel.findOne({
                            guildID: guildID,
                            userID: verificationDoc.userID
                        })
                        if(playerEcoDoc !== null) {
                            let rewardModifier = 1;
                        const memberTarget = guild.members.cache.find(member => member.id === verificationDoc.userID);
                        let memberTargetMainGuild = mainGuild.members.cache.find(member => member.id === verificationDoc.userID);
                        if (memberTarget === null || memberTarget === undefined) {} else {
                            if (memberTarget.roles.cache.has('853949230350991392')) {
                                rewardModifier += .35
                            }
                            if (memberTarget.roles.cache.has('853947102521851914')) {
                                rewardModifier += .7
                            }
                            if (memberTarget.roles.cache.has('847648987933835285')) {
                                rewardModifier += 1.15
                            }
                        }
                        if (memberTargetMainGuild === null || memberTargetMainGuild === undefined) {} else {
                            if (memberTargetMainGuild.roles.cache.has('883564759541243925')) {
                                rewardModifier += .35
                            }
                            if (memberTargetMainGuild.roles.cache.has('883563886815617025')) {
                                rewardModifier += .7
                            }
                            if (memberTargetMainGuild.roles.cache.has('883564396587147275')) {
                                rewardModifier += 1.15
                            }
                        }
                            playerEcoDoc.currency = parseInt(playerEcoDoc.currency) + (parseInt(hotzoneSettings.hotzoneEndBonus) * rewardModifier);
                            playerEcoDoc.save();
                        }
                    }
                }
                
                let docs = await hotzoneEntityModel.find({
                    guildID: guildID
                });

                docs.forEach(doc => {
                    doc.remove();
                })
                try {
                    await channel.bulkDelete(2)
                    channel.send(embed)
                } catch(err) {}
                return;
            }



            embed.addFields({
                name: `X`,
                value: `${hotzoneDoc.x}`
            }, {
                name: `Y`,
                value: `${hotzoneDoc.y}`
            }, {
                name: `Z`,
                value: `${hotzoneDoc.z}`
            })



            let eventPos = [parseInt(hotzoneDoc.x), parseInt(hotzoneDoc.y), parseInt(hotzoneDoc.z)];
            let validGrids = [];
            let validGridIDs = [];
            let validCharacters = [];
            let gridDocs = await gridModel.find({
                guildID: guildID
            })
            let characterDocs = await characterModel.find({
                guildID: guildID
            })



            let gridString = '';
            for (let i = 0; i < gridDocs.length; i++) { // Log valid grids to seperate collection
                var dx = gridDocs[i].positionX - eventPos[0];
                var dy = gridDocs[i].positionY - eventPos[1];
                var dz = gridDocs[i].positionZ - eventPos[2];

                distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (distance < parseInt(hotzoneSettings.hotzoneRadius)) {
                    validGrids.push(gridDocs[i])
                    validGridIDs.push(gridDocs[i].entityID)
                    let current_time = Date.now();
                    let expirationTime = current_time + 120000;
                    let docCheck = await hotzoneEntityModel.findOne({
                        entityID: gridDocs[i].entityID
                    })
                    if (docCheck === null) { // If grid just entered the zone
                        let factionTag = await checkGridForFaction.dbGrid(gridDocs[i], guildID);
                        await hotzoneEntityModel.create({
                            guildID: guildID,
                            category: 'Grid',
                            displayName: gridDocs[i].displayName,
                            entityID: gridDocs[i].entityID,
                            factionTag: factionTag,
                            x: gridDocs[i].positionX,
                            y: gridDocs[i].positionY,
                            z: gridDocs[i].positionZ,
                            expirationTime: expirationTime,
                            entryTime: `${Date.now()}`
                        })
                        gridString += `**[**${factionTag}**]** ${gridDocs[i].displayName}\n`
                    } else {
                        gridString += `**[**${docCheck.factionTag}**]** ${gridDocs[i].displayName}\n`
                    }
                }
            }



            let characterString = '';
            for (let i = 0; i < characterDocs.length; i++) { // Log valid characters to seperate collection
                var dx = characterDocs[i].x - eventPos[0];
                var dy = characterDocs[i].y - eventPos[1];
                var dz = characterDocs[i].z - eventPos[2];

                distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (distance < parseInt(hotzoneSettings.hotzoneRadius)) {
                    validCharacters.push(characterDocs[i])
                    let current_time = Date.now();
                    let expirationTime = current_time + 30000;
                    let docCheck = await hotzoneEntityModel.findOne({
                        entityID: characterDocs[i].entityID
                    })
                    if (docCheck === null) { // If character just entered the zone
                        let playerDoc = await playerModel.findOne({
                            guildID: guildID,
                            displayName: characterDocs[i].name
                        })
                        if (playerDoc !== null) { // Redundancy Check
                            if (playerDoc.factionTag === "") {
                                playerDoc.factionTag = 'NoF';
                            }
                            await hotzoneEntityModel.create({
                                guildID: guildID,
                                category: 'Character',
                                displayName: characterDocs[i].name,
                                entityID: characterDocs[i].entityID,
                                factionTag: playerDoc.factionTag,
                                x: characterDocs[i].positionX,
                                y: characterDocs[i].positionY,
                                z: characterDocs[i].positionZ,
                                expirationTime: expirationTime,
                                entryTime: `${Date.now()}`
                            })
                            characterString += `**[**${playerDoc.factionTag}**]** ${characterDocs[i].name}`;
                        }
                    } else {
                        characterString += `**[**${docCheck.factionTag}**]** ${characterDocs[i].name}`;
                    }
                }
            }

            // Reward Valid Characters
            let rewardAmt = (Math.floor(Math.random() * Math.round(parseInt(hotzoneSettings.hotzoneRewardPerSec) / 2)) + Math.round(parseInt(hotzoneSettings.hotzoneRewardPerSec) / 2)) * (interval / 1000);
            for (let i = 0; i < validCharacters.length; i++) {
                let verificationDoc = await verificationModel.findOne({
                    username: validCharacters[i].name
                })
                if (verificationDoc === null) { // If player is not verified, do not count/reward. Modify Embed
                } else {
                    let playerEcoDoc = await playerEcoModel.findOne({
                        userID: verificationDoc.userID,
                        guildID: guildID
                    })
                    if (playerEcoDoc !== null) { // If player has no balance doc, do not count/reward. Otherwise, continue.
                        let rewardModifier = 1;
                        const memberTarget = guild.members.cache.find(member => member.id === verificationDoc.userID);
                        let memberTargetMainGuild = mainGuild.members.cache.find(member => member.id === verificationDoc.userID);
                        if (memberTarget === null || memberTarget === undefined) {} else {
                            if (memberTarget.roles.cache.has('853949230350991392')) {
                                rewardModifier += .35
                            }
                            if (memberTarget.roles.cache.has('853947102521851914')) {
                                rewardModifier += .7
                            }
                            if (memberTarget.roles.cache.has('847648987933835285')) {
                                rewardModifier += 1.15
                            }
                        }
                        if (memberTargetMainGuild === null || memberTargetMainGuild === undefined) {} else {
                            if (memberTargetMainGuild.roles.cache.has('883564759541243925')) {
                                rewardModifier += .35
                            }
                            if (memberTargetMainGuild.roles.cache.has('883563886815617025')) {
                                rewardModifier += .7
                            }
                            if (memberTargetMainGuild.roles.cache.has('883564396587147275')) {
                                rewardModifier += 1.15
                            }
                        }
                        playerEcoDoc.currency = parseInt(playerEcoDoc.currency) + ((rewardAmt * rewardModifier) / validCharacters.length);
                        playerEcoDoc.save();
                    }
                }
            }

            if (validCharacters.length !== 0) {
                embed.addFields({
                    name: 'Characters',
                    value: `${characterString}`
                })
            }

            if (validGrids.length !== 0) {
                embed.addFields({
                    name: 'Grids',
                    value: `${gridString}`
                })
            }

            try {
                await channel.bulkDelete(2)
                await channel.send(embed)
            } catch(err) {}
            return;
        })
    }, interval)
}