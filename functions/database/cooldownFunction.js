async function cd(cdString, cdTime, message) {
    // Cooldown Setup
    const cooldown = cdTime;
    const cooldownString = cdString;
    const current_time = Date.now();
    const cooldown_amount = (cooldown) * 1000;
    const expiration_time = current_time + cooldown_amount;
    // Require cooldown model
    const cooldownModel = require("../../models/cooldownSchema");
    try {
        // Try to find cooldown data in database
        cooldownData = await cooldownModel.findOne({
            guildID: message.guild.id,
            userID: message.author.id,
            commandString: cooldownString,
        });
        // Check if cooldown data was found in database
        if(!cooldownData) {
            // If no cooldown data found, create one
            cooldownModel.create({
                guildID: message.guild.id,
                userID: message.author.id,
                commandString: cooldownString,
                expirationTime: expiration_time
            });
        } else { // If cooldown is found, return cooldown amount to command and have the command cancel and return a message to the channel
            const cdTimeleft = Math.round((cooldownData.expirationTime - current_time));
            return cdTimeleft;
        }
    } catch(err) {console.log(err)};
}
module.exports = {
    cd
}