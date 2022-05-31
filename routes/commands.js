const express = require('express');
const router = express.Router();
const statusModel = require('../models/statusSchema');
const gridCount = require('../functions/misc/gridCount');
const getGrids = require('../functions/database/getGrids');

// Get one server
router.get('/', async (req, res) => {
    let count;
    await gridCount(req.params.guildID).then(result => { count = result });
    const grids = await getGrids(req.params.guildID)
    const data = {
        server: res.server,
        count: count,
        grids: grids,
    }

    res.render("singleServerGrids.ejs", data)
})

module.exports = router