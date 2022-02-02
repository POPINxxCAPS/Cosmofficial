const checkGridForFaction = require('../functions_db/checkGridForFaction');
const verificationModel = require('../models/verificationSchema');
const playerEcoModel = require('../models/playerEcoSchema');
const gridModel = require('../models/gridSchema');
const playerModel = require('../models/playerSchema');
const characterModel = require('../models/characterSchema');
const ms = require('ms');
const dominationSettingModel = require('../models/dominationSettingSchema');
const dominationScoreModel = require('../models/dominationScoreSchema');
const discordServerSettingModel = require('../models/discordServerSettngsSchema');
const economySettingModel = require('../models/economySettingSchema');
const statusModel = require('../models/statusSchema');
const interval = 60000;

module.exports = async (client, discord) => {
    let guildIDs = await client.guilds.cache.map(guild => guild.id);
    setInterval(async () => {
        guildIDs = await client.guilds.cache.map(guild => guild.id);
    }, 300000)
    const mainGuild = client.guilds.cache.get("853247020567101440");
    setInterval(async () => {
        const current_time = Date.now()


        let verificationCache = [];
        guildIDs.forEach(async guildID => {
            const embed = new discord.MessageEmbed()
                .setColor('#E02A6B')
                .setTitle(`Domination Alerts`)
                .setURL('https://mod.io/members/popinuwu')
                .setFooter('Cosmofficial by POPINxxCAPS')
            const guild = client.guilds.cache.get(guildID);
            if (guild === undefined || guild === null) return; // If bot is no longer in guild

            let patron;
            if (guild.owner === null) return; // Redundancy Check
            let guildOwner = mainGuild.members.cache.get(guild.owner.user.id);
            if (!guildOwner) return; // If guild owner is no longer in Cosmofficial discord

            if (guildOwner.roles.cache.has('883534965650882570') || guildOwner.roles.cache.has('883535930630213653')) {
                patron = true;
            }
            if (patron !== true) return;

            let discordSettings = await discordServerSettingModel.findOne({
                guildID: guildID
            })
            if (discordSettings === null) return;
            if (discordSettings.serverOnline === false || discordSettings.serverOnline === undefined) return;



            let ecoSettings = await economySettingModel.findOne({
                guildID: guildID,
            })
            if (ecoSettings === null) {
                return errorEmbed(message.channel, discord, 'An admin must first setup economy with c!ces')
            }
            let currencyName;
            await ecoSettings.settings.forEach(setting => {
                if (setting.name === 'CurrencyName') {
                    currencyName = setting.value;
                }
            })



            let dominationSettings = await dominationSettingModel.findOne({
                guildID: guildID
            })
            if (dominationSettings === null) return;
            if (dominationSettings.enabled === false) return;

            const statusDoc = await statusModel.findOne({
                guildID: guildID
            })
            if (statusDoc === null) return;
            const serverName = statusDoc.serverName;

            const captureTime = parseInt(dominationSettings.captureTime);

            let channelID = dominationSettings.channelID;
            if (channelID === undefined || channelID === 'Not Set') return;
            let channel = client.channels.cache.get(channelID);
            if (channel === undefined || channel === null) return;

            let characterDocs = await characterModel.find({
                guildID: guildID
            })




            // If there is a faction at or above score limit, set gameendtime to 0 to start a new match
            let tempDocs = await dominationScoreModel.find({
                guildID: guildID,
            })
            if (tempDocs.length !== 0) {
                for (let i = 0; i < tempDocs.length; i++) {
                    if (tempDocs[i].score >= parseInt(dominationSettings.pointLimit)) {
                        dominationSettings.gameEndTime = '0'
                    }
                }
            }
            //

            if (parseInt(dominationSettings.gameEndTime) < current_time) { // When game is over
                // Reward all faction members their tokens. Then clear score documents.
                let winBonus = (dominationSettings.winReward);
                let rewardPerPoint = parseInt(dominationSettings.rewardPerPoint);
                let scoreDocs = await dominationScoreModel.find({
                    guildID: guildID
                })

                let scoreArray = [];
                scoreDocs.forEach(doc => { // String to number conversion to fix sorting
                    scoreArray.push({
                        factionTag: doc.factionTag,
                        score: parseInt(doc.score)
                    })
                })
                let sortedScores = scoreArray.sort((a, b) => ((a.score) > (b.score)) ? -1 : 1);
                let finalScoreString = '';
                for (let s = 0; s < sortedScores.length; s++) {
                    let doc = sortedScores[s];
                    finalScoreString += `**${doc.factionTag}**: ${doc.score}\n`
                }
                await scoreDocs.forEach(async faction => {
                    let factionTag = faction.factionTag;
                    let score = faction.score;
                    let playerDocs = await playerModel.find({
                        guildID: guildID,
                        factionTag: factionTag
                    })

                    if (playerDocs.length !== 0) { // Attempt to reward all faction members if any are found
                        playerDocs.forEach(async playerDoc => { // For each player in faction
                            let verDoc = await verificationModel.findOne({ // Find verification doc to get userID
                                username: playerDoc.displayName
                            })
                            if (verDoc !== null) { // If a verification doc is found, check if they are still in the discord. If they are, reward them with currency.
                                let memberTarget = guild.members.cache.find(member => member.id === verDoc.userID) // Check if still in discord
                                // If they are in the discord, check for any modifiers that need to be applied
                                if (memberTarget !== null && memberTarget !== undefined) {
                                    let rewardModifier = 1 // Set reward Modifier
                                    let patronCheck = await mainGuild.members.cache.get(verDoc.userID)
                                    if (patronCheck !== undefined && patronCheck !== null) {
                                        if (patronCheck.roles.cache.has('883564759541243925')) {
                                            rewardModifier += .35
                                            cooldownModifier -= .1
                                        }
                                        if (patronCheck.roles.cache.has('883563886815617025')) {
                                            rewardModifier += .7
                                            cooldownModifier -= .2
                                        }
                                        if (patronCheck.roles.cache.has('883564396587147275')) {
                                            rewardModifier += 1.15
                                            cooldownModifier -= .3
                                        }
                                        if (patronCheck.roles.cache.has('883564396587147275')) {
                                            rewardModifier += 3
                                            cooldownModifier -= .3
                                        }
                                        if (patronCheck.roles.cache.has('889505714815504405')) {
                                            rewardModifier += 6.5
                                        }
                                    } // Check if patron, add reward modifier if true

                                    let playerEcoDoc = await playerEcoModel.findOne({ // Find playerEcoDoc using verification userID
                                        guildID: guildID,
                                        userID: verDoc.userID
                                    })
                                    let rewardAmount;
                                    console.log(factionTag)
                                    console.log(scoreArray[0].factionTag)
                                    if(factionTag === scoreArray[0].factionTag) {
                                        rewardAmount = rewardModifier * ((parseInt(dominationSettings.rewardPerPoint) * (score / playerDocs.length)) + (winBonus / playerDocs.length)) // Divide by number of rewarded players
                                    } else {
                                        rewardAmount = rewardModifier * (parseInt(dominationSettings.rewardPerPoint) * (score / playerDocs.length)) // Divide by number of rewarded players
                                    }


                                    rewardAmount = Math.round(rewardAmount)
                                    playerEcoDoc.currency = parseInt(playerEcoDoc.currency) + rewardAmount;
                                    playerEcoDoc.save();
                                    console.log(`Server: ${serverName}  -  [${factionTag}] ${verDoc.username} Awarded ${rewardAmount} currency for Domination`)

                                    // If the player was rewarded, dm them the final score of the last match
                                    try {
                                        memberTarget.send(`>>> This message was sent because your faction particpated in the last Domination match on ${serverName}.\n\nYou were awarded with ${rewardAmount} ${currencyName}.\nFinal Scores:\n${finalScoreString}`);
                                    } catch(err) {}
                                }
                            }
                        })
                    }
                    faction.remove();
                })
                // Rewards End


                // Start prep for a new match
                let gameEndTime = parseInt(dominationSettings.newGameDelay) + parseInt(dominationSettings.matchTime) + current_time;
                dominationSettings.gameEndTime = gameEndTime;


                // Reset objective data
                for (let i = 0; i < dominationSettings.objectives.length; i++) {
                    dominationSettings.objectives[i].capturedBy = 'Neutral'
                    dominationSettings.objectives[i].capturePercentage = '0'
                }
                console.log(`Server: ${serverName}  -  Prep for new domination match completed`)
            }




            // When game has ended, and awaiting a new match
            if ((parseInt(dominationSettings.gameEndTime) - current_time) > parseInt(dominationSettings.matchTime)) {
                let nextMatch = (parseInt(dominationSettings.gameEndTime) - current_time) - parseInt(dominationSettings.matchTime);
                console.log('Awaiting new match')
                embed.setDescription(`Time Until Next Match: ${ms(nextMatch, { long: true })}`)
                dominationSettings.save();
                try {
                    channel.bulkDelete(2)
                    channel.send(embed)
                } catch (err) {}
                return;
            }



            // Check for characters valid on point
            let objectiveArray = [];
            for (let i = 0; i < dominationSettings.objectives.length; i++) {
                let objective = dominationSettings.objectives[i];
                if (objective.enabled === true) {
                    for (let y = 0; y < characterDocs.length; y++) {
                        let character = characterDocs[y];
                        var dx = character.x - objective.x;
                        var dy = character.y - objective.y;
                        var dz = character.z - objective.z;

                        let distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                        if (distance < objective.pointRadius) {
                            let verDoc;
                            verificationCache.forEach(item => {
                                if(item === null) return;
                                if (item.username === character.name) {
                                    verDoc = item;
                                }
                            })
                            if (verDoc === undefined) { // If not found in the cache, add to cache and find verdoc
                                verDoc = await verificationModel.findOne({
                                    username: character.name
                                })
                                if (verDoc !== undefined) {
                                    verificationCache.push(verDoc)
                                }
                            }
                            if (verDoc !== undefined) { // If ver doc is found, add character to array
                                // Get faction tag
                                let playerDoc = await playerModel.findOne({
                                    guildID: guildID,
                                    displayName: character.name
                                })
                                let factionTag;
                                if (playerDoc === null) {
                                    factionTag = 'NoFac'
                                } else {
                                    factionTag = playerDoc.factionTag
                                    if (factionTag === undefined || factionTag === "") {
                                        factionTag = 'NoFac'
                                    }
                                }
                                // Faction tag end
                                objectiveArray.push({
                                    objective: objective.name,
                                    character: character,
                                    verDoc: verDoc,
                                    factionTag: factionTag
                                })
                            }
                        }
                    }
                }
            }

            // After getting all valid characters and info added to the array
            // Log all characters on points with an index value for the strings and names
            //console.log(objectiveArray)
            let objectiveCharacterStrings = [];
            let objectiveCharacters = [];
            let objectiveNames = [];
            for (let i = 0; i < objectiveArray.length; i++) {
                let info = objectiveArray[i];
                if (objectiveNames.includes(info.objective) === false) {
                    objectiveNames.push(info.objective)
                }
                let index = objectiveNames.indexOf(info.objective);
                if (objectiveCharacterStrings[index] === undefined) {
                    objectiveCharacterStrings[index] = '';
                }
                if (objectiveCharacters[index] === undefined) {
                    objectiveCharacters[index] = {
                        objective: [],
                        character: [],
                        factionTag: [],
                    }
                }
                if (objectiveCharacters[index].character.includes(info.character) === false) {
                    objectiveCharacters[index].objective.push(info.objective)
                    objectiveCharacters[index].character.push(info.character)
                    objectiveCharacters[index].factionTag.push(info.factionTag)
                    objectiveCharacterStrings[index] += `[${info.factionTag}] ${info.character.name}\n`;
                }

            }

            // Find out which factions are on what points
            let objectiveFactionData = [];
            let objectiveContested = [];
            objectiveCharacters.forEach(char => {
                let characterIndex = objectiveCharacters.indexOf(char);
                let index = objectiveNames.indexOf(char.objective[characterIndex]);
                if (objectiveFactionData[index] === undefined) {
                    objectiveFactionData[index] = {
                        objective: char.objective[index],
                        factionTags: []
                    };
                }

                if (objectiveFactionData[index].factionTags.includes(char.factionTag[characterIndex]) === false) {
                    objectiveFactionData[index].factionTags.push(char.factionTag[characterIndex])
                }
            })
            // After getting factions seperated into their arrays, handle the data
            for (let objI = 0; objI < objectiveFactionData.length; objI++) { // Use for loop to ensure this completes before the save is called
                let data = objectiveFactionData[objI];
                let index = objectiveNames.indexOf(data.objective);
                for (let i = 0; i < data.factionTags.length; i++) {
                    if (data.factionTags[i] !== 'NoFac' && data.factionTags[i] !== undefined) { // Do not do anything with players not in a faction
                        let scoreDoc = await dominationScoreModel.findOne({
                            guildID: guildID,
                            factionTag: data.factionTags[i],
                        })
                        if (scoreDoc === null) {
                            scoreDoc = await dominationScoreModel.create({
                                guildID: guildID,
                                factionTag: data.factionTags[i],
                                score: '0'
                            })
                        }
                        if (data.factionTags.length >= 2) {
                            objectiveContested[index] = true;
                        } else { // If not contested, attempt to capture
                            objectiveContested[index] = false;
                            for (let l = 0; l < dominationSettings.objectives.length; l++) {
                                let obj = dominationSettings.objectives[l];
                                if (obj.name === data.objective && obj.capturedBy !== data.factionTags[i] && objectiveContested[index] === false) { // If attempting to capture an objective

                                    if (parseFloat(dominationSettings.objectives[l].capturePercentage) === NaN || dominationSettings.objectives[l].capturePercentage === "NaN") { // Redundancy Check
                                        dominationSettings.objectives[l].capturePercentage = '0';
                                        console.log('NaN Domination Capture % Fixed')
                                    }
                                    // Update capture percentage
                                    let captureIncrement = 100 / (captureTime / interval);
                                    if (obj.capturedBy === 'Neutral') { // If neutral, just add the captureIncrement, and change 'captured by'
                                        dominationSettings.objectives[l].capturedBy = data.factionTags[i];
                                        dominationSettings.objectives[l].capturePercentage = parseFloat(dominationSettings.objectives[l].capturePercentage) + (Math.round((captureIncrement * 100)) / 100)
                                    }
                                }

                                // If point is owned, increase capture percentage until 100
                                if (obj.name === data.objective && obj.capturedBy === data.factionTags[i] && data.capturePercentage !== '100' && objectiveContested[index] === false) {
                                    let captureIncrement = 100 / ((captureTime / interval) / 2)
                                    if (parseFloat(dominationSettings.objectives[l].capturePercentage) === NaN || dominationSettings.objectives[l].capturePercentage === "NaN") { // Redundancy Check
                                        dominationSettings.objectives[l].capturePercentage = '0';
                                        console.log('NaN Domination Capture % Fixed')
                                    }
                                    dominationSettings.objectives[l].capturePercentage = parseFloat(dominationSettings.objectives[l].capturePercentage) + (Math.round((captureIncrement * 100)) / 100)
                                    if (parseFloat(dominationSettings.objectives[l].capturePercentage) >= 100) { // If 100% is breached, set to 100
                                        dominationSettings.objectives[l].capturePercentage = 100
                                    }
                                }

                                // If enemy point, lower the enemy faction's %
                                if (obj.name === data.objective && obj.capturedBy !== data.factionTags[i] && obj.capturedBy !== 'Neutral' && objectiveContested[index] === false) {
                                    let captureIncrement = 100 / ((captureTime / interval) / 2)
                                    if (parseFloat(dominationSettings.objectives[l].capturePercentage) === NaN || dominationSettings.objectives[l].capturePercentage === "NaN") { // Redundancy Check
                                        dominationSettings.objectives[l].capturePercentage = '0';
                                        console.log('NaN Domination Capture % Fixed')
                                    }
                                    dominationSettings.objectives[l].capturePercentage = parseFloat(dominationSettings.objectives[l].capturePercentage) - (Math.round((captureIncrement * 100)) / 100)
                                    if (parseFloat(dominationSettings.objectives[l].capturePercentage) >= 100) { // If 100% is breached, set to 100
                                        dominationSettings.objectives[l].capturePercentage = 100
                                    }

                                    // If below or equal to 0, take over the point
                                    if (parseFloat(dominationSettings.objectives[l].capturePercentage) <= 0) {
                                        dominationSettings.objectives[l].capturedBy = data.factionTags[i]
                                        dominationSettings.objectives[l].capturePercentage = 0
                                    }
                                }

                                dominationSettings.objectives[l].capturePercentage = (Math.round((parseFloat(dominationSettings.objectives[l].capturePercentage) * 100)) / 100)
                            }
                        }
                    }
                }
            }


            // MAIN EMBED
            // Embed Objective Setting and Point Awarding
            for (let o = 0; o < dominationSettings.objectives.length; o++) {
                let obj = dominationSettings.objectives[o]
                let factionToReward = obj.capturedBy;
                if (obj.capturePercentage === '100' && factionToReward !== 'Neutral') {
                    let scoreDoc = await dominationScoreModel.findOne({
                        guildID: guildID,
                        factionTag: factionToReward
                    })
                    if (scoreDoc === null) {
                        scoreDoc = await dominationScoreModel.create({
                            guildID: guildID,
                            factionTag: factionToReward,
                            score: '0'
                        })
                    }
                    let score = parseInt(scoreDoc.score) + 1;
                    await dominationScoreModel.findOneAndUpdate({ // Using findOneAndUpdate to avoid double save error
                        guildID: guildID,
                        factionTag: factionToReward
                    }, {
                        score: score
                    })
                } // Finish point awarding




                let index = objectiveNames.indexOf(obj.name);
                let capturedBy = obj.capturedBy;
                let capturePercentage = (obj.capturePercentage)
                let fieldName = `__${obj.name}__`
                if (objectiveCharacterStrings[index] === undefined) {
                    objectiveCharacterStrings[index] = 'No players on objective.'
                }
                let positionString = "```" + `Position:\nX: ${obj.x}\nY: ${obj.y}\nZ: ${obj.z}` + "```";
                let embedCharacterString = "```On Objective:\n" + `${objectiveCharacterStrings[index]}` + "```";
                embed.addFields({
                    name: fieldName,
                    value: `**${capturePercentage}% Captured by: ${capturedBy}**\n${positionString}\n${embedCharacterString}\n`
                })
            }
            // MAIN EMBED
            //console.log(dominationSettings)
            let topScoreString = '';
            let scoreDocs = await dominationScoreModel.find({
                guildID: guildID
            })
            let scoreArray = [];
            scoreDocs.forEach(doc => { // String to number conversion to fix sorting
                scoreArray.push({
                    factionTag: doc.factionTag,
                    score: parseInt(doc.score)
                })
            })
            let sortedScores = scoreArray.sort((a, b) => ((a.score) > (b.score)) ? -1 : 1);
            for (let s = 0; s < sortedScores.length && s < 5; s++) {
                let doc = sortedScores[s];
                topScoreString += `**${doc.factionTag}**: ${doc.score}\n`
            }


            dominationSettings.save();


            if(topScoreString === '>>> ') {
                topScoreString === 'N/A'
            }
            try {
                embed.setDescription(`Time Remaining: ${ms(dominationSettings.gameEndTime - current_time, { long: true })}\n**__Top Scores__**  ||  **Limit**: ${dominationSettings.pointLimit}\n${">>> " + topScoreString}`)
                channel.bulkDelete(2);
                channel.send(embed);
            } catch (err) {}
            // End Embed
        })
    }, interval)
}