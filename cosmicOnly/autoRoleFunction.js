const verificationModel = require('../models/verificationSchema');
const playersModel = require('../models/playerSchema');
module.exports = async (client) => {
    const guild = client.guilds.cache.get("799685703910686720");
    const botGuild = client.guilds.cache.get("853247020567101440");
    setInterval(async () => {
        const memberList = await guild.roles.cache.get('799686409468117062').members.map(m => m.user.id);
        let ownerRole = await guild.roles.cache.find(r => r.name === 'Server Owner');
        let mainRole = await guild.roles.cache.find(r => r.name === 'Engineer');
        let muteRole = await guild.roles.cache.find(r => r.name === 'Cosmic Mute');
        let sneakPeakRole = await guild.roles.cache.find(r => r.id === '945566999956836382')
        let moderatorRole = await guild.roles.cache.find(r => r.name === 'Discord Moderator');
        let teamOneTDMRole = await guild.roles.cache.find(r => r.name === 'TDM Red Team');
        let teamTwoTDMRole = await guild.roles.cache.find(r => r.name === 'TDM Blue Team');

        let playerBoosterOne = await botGuild.roles.cache.find(r => r.name === 'Patron - Player Booster T1');
        let playerBoosterTwo = await botGuild.roles.cache.find(r => r.name === 'Patron - Player Booster T2');
        let playerBoosterThree = await botGuild.roles.cache.find(r => r.name === 'Patron - Player Booster T3');
        let demiBooster = await botGuild.roles.cache.find(r => r.name === 'Patron - Demi-God Booster');
        let godBooster = await botGuild.roles.cache.find(r => r.name === 'Patron - God Booster');




        await memberList.forEach(async member => {
            let factionRole;

            let roleArray = [mainRole];
            let memberTarget = await guild.members.cache.get(member);
            let botGuildMemTarget = await botGuild.members.cache.get(member)
            if (botGuildMemTarget !== undefined) { // If in bot discord, check if patron. If yes, apply roles to Cosmic
                console.log('Checked for patron role')
                if (botGuildMemTarget.roles.cache.has(playerBoosterOne.id)) {
                    let role = await guild.roles.cache.find(r => r.name === 'Player Booster T1');
                    roleArray.push(role);
                }
                if (botGuildMemTarget.roles.cache.has(playerBoosterTwo.id)) {
                    let role = await guild.roles.cache.find(r => r.name === 'Player Booster T2');
                    roleArray.push(role);
                }
                if (botGuildMemTarget.roles.cache.has(playerBoosterThree.id)) {
                    let role = await guild.roles.cache.find(r => r.name === 'Player Booster T3');
                    console.log('Added player booster t3 to array')
                    roleArray.push(role);
                }
                if (botGuildMemTarget.roles.cache.has(demiBooster.id)) {
                    let role = await guild.roles.cache.find(r => r.name === 'Demi-God Booster');
                    roleArray.push(role);
                }
                if (botGuildMemTarget.roles.cache.has(godBooster.id)) {
                    let role = guild.roles.cache.find(r => r.name === 'God Booster');
                    roleArray.push(role);
                }

                // If player is in a match of TDM, add that role as well.
                if (botGuildMemTarget.roles.cache.has('884108362881585233')) { // If has red TDM team role
                    roleArray.push(teamOneTDMRole)
                }
                if (botGuildMemTarget.roles.cache.has('884108483438465025')) { // If has blue TDM team role
                    roleArray.push(teamTwoTDMRole)
                }
            }

            // If player is muted, do nothing. Otherwise, fix their roles.
            if (memberTarget.roles.cache.has(muteRole.id) || memberTarget.roles.cache.has(ownerRole.id)) {
                console.log('Muted player or Admin skipped role-assignment')
                return;
            } else {
                const verificationData = await verificationModel.findOne({
                    userID: memberTarget.id
                })
                if (!verificationData || verificationData === undefined || verificationData === null) { // If user is not verified, skip faction role
                } else { // If user is verified, add faction role to array
                    // Check if verified player exists in database
                    const playerData = await playersModel.findOne({
                        guildID: guild.id,
                        displayName: verificationData.username
                    });
                    if (playerData === null) {} else {
                        // If exists, find the faction role.
                        let factionTag = playerData.factionTag;
                        factionRole = await guild.roles.cache.find(r => r.name === factionTag);
                        if (factionRole === undefined || factionRole === null) {
                            if (factionTag === '') {} else {
                                await guild.roles.create({
                                    data: {
                                        name: factionTag
                                    }
                                });
                                factionRole = await guild.roles.cache.find(r => r.name === factionTag);
                            }
                        }
                        if(factionRole !== undefined) {
                            roleArray.push(factionRole) // Push role to array
                        }
                    }
                }

                // Check for other odd roles the user may have, if they have them, add to array
                if (memberTarget.roles.cache.has('827741099740233728')) { // If member is moderator
                    roleArray.push(moderatorRole)
                }
                if (memberTarget.roles.cache.has('945566999956836382')) { // If member has sneak peak role
                    roleArray.push(sneakPeakRole)
                }

                // Assign role array to member
                try {
                    await memberTarget.roles.set(roleArray) // Assign all valid roles
                } catch (err) {
                    return console.log(err);
                }
                console.log(`${roleArray.length} Roles set for ${memberTarget.user.username}`);
            }
        })
    }, 3600000)
}