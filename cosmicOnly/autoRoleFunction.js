const verificationModel = require('../models/verificationSchema');
const playersModel = require('../models/playerSchema');
module.exports = async (client) => {
    const guild = client.guilds.cache.get("799685703910686720");
    const botGuild = client.guilds.cache.get("853247020567101440");
    let isRunning = false;
    setInterval(async () => {
        if(isRunning === true) return;
        isRunning = true
        const memberList = await guild.roles.cache.get('799686409468117062').members.map(m => m.user.id);
        
        let ownerRole = await guild.roles.cache.find(r => r.name === 'Server Owner');

        for(const member of memberList) {
            const user = await client.users.cache.get(member);
            const guildMember = await guild.member(user);
            const verDoc = await verificationModel.findOne({
                userID: member
            })
            if(verDoc === null) continue;
            let playerDoc = await playersModel.findOne({
                guildID: guild.id,
                displayName: verDoc.username
            })
            let factionTag = playerDoc === null ? '' : playerDoc.factionTag;
            if(factionTag === '' && guildMember !== null) {
                for(const roleID of guildMember.roles.cache) {
                    const role = roleID[1];
                    if(role.name.length === 3) {
                        guildMember.roles.remove(role)
                        const updatedRole = await guild.roles.cache.get(roleID[0]);
                        if(updatedRole.members.length <= 0) role.delete();
                    }
                }
            } else {
                for(const roleID of guildMember.roles.cache) {
                    if(roleID[1].name.length === 3) { // If they have another faction tag's role, remove it
                        if(roleID[1].name !== factionTag) {
                            guildMember.roles.remove(roleID[1]);
                        }
                    }
                }
                let role = await guild.roles.cache.find(role => role.name === factionTag);
                if(role === undefined) {
                    guild.roles.create({
                        data: {
                          name: factionTag,
                        },
                        reason: 'Faction Role Creation',
                    }).then(console.log(`Role created for ${factionTag}`)).catch(console.error);
                    role = await guild.roles.cache.find(role => role.name === factionTag);
                }
                if(role !== undefined) { // Extra check
                    if(guildMember.roles.cache.has(role.id) === false) {
                        console.log("Faction Role Applied")
                        guildMember.roles.add(role);
                    }
                }
            }
        }
        for(const role of guild.roles.cache) { // Cleanup any crap roles
            if(role[1].name.length === 3 && role[1].members.size === 0) await role[1].delete()
            // members is a collection, need to use size instead of length
        }
        isRunning = false;
    }, 30000)
}