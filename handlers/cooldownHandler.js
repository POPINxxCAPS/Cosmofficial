const cooldownModel = require("../models/cooldownSchema");

module.exports = async (client) => {
    const current_time = Date.now();
    let cooldownData;
    try {
        cooldownData = await cooldownModel.findOne();
        if (!cooldownData) return;
    } catch (err) {
        console.log(err)
    };
    cooldownData = await cooldownModel.find();
    for (i = 0; i < cooldownData.length; i++) {
        if (cooldownData[i].expirationTime < current_time) {
            cooldownData[i].remove();
        }
    }
}