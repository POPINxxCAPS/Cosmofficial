const statusModel = require('../models/statusSchema');


const ChartJS = require('chart.js');
const {
    ChartJSNodeCanvas
} = require('chartjs-node-canvas');
const {
    MessageAttachment
} = require('discord.js');
const plugin = {
    id: 'Blank',
    beforeDraw: (chart) => {
        const ctx = chart.canvas.getContext('2d');
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
    }
};



module.exports = (client, discord) => {
    const guild = client.guilds.cache.get('799685703910686720');
    const channel = guild.channels.cache.get('916397632019128330');
    setInterval(async () => {

        const statusDoc = await statusModel.findOne({
            guildID: guild.id
        })
        if (statusDoc === null) return;

        const current_time = Date.now()
        const timeCutoff = current_time - (30 * (86400 * 1000))
        

        try {
            channel.bulkDelete(4)
        } catch(err) {}
        for (let i = 0; i < 2; i++) {
            let targetData;
            if (i === 0) targetData = statusDoc.populationLog;
            if (i === 1) targetData = statusDoc.simSpeedLog;
            let unfilteredEntryData = []
            let entryData = []
            for (let a = 0; a < targetData.length; a++) {
                if (i === 0 && parseInt(targetData[a].timestamp) > timeCutoff && targetData[a].playerCount !== undefined) {
                    unfilteredEntryData.push({
                        data: targetData[a].playerCount,
                        timestamp: parseInt(targetData[a].timestamp)
                    })
                } else if (parseInt(targetData[a].timestamp) > timeCutoff) {
                    unfilteredEntryData.push({
                        data: targetData[a].simSpeed,
                        timestamp: parseInt(targetData[a].timestamp)
                    })
                }
            }
            for(let b = 0; b < unfilteredEntryData.length; b++) { // Filter out data that is too close together (2 hours apart)
                let invalid = false;
                if(current_time - parseInt(unfilteredEntryData[b].timestamp) > 604800000) invalid = true;
                /*for (let c = 0; c < entryData.length; c++) {
                    if(unfilteredEntryData[b] !== entryData[c]) {
                        console.log(unfilteredEntryData[b].timestamp - entryData[c].timestamp < ((3600 * 2) * 1000) && unfilteredEntryData[b].timestamp - entryData[c].timestamp > ((3600 * -2) * 1000))
                        console.log(unfilteredEntryData[b].timestamp - entryData[c].timestamp)
                        if(unfilteredEntryData[b].timestamp - entryData[c].timestamp < ((3600 * 2) * 1000) && unfilteredEntryData[b].timestamp - entryData[c].timestamp > ((3600 * -2) * 1000)) {
                            invalid = true
                        }
                    }
                }*/
                if(invalid === false) {
                    entryData.push(unfilteredEntryData[b])
                }
            }

            if (targetData !== undefined && entryData.length !== 0) {
                let sortedChartData = entryData.sort((a, b) => ((a.timestamp) > (b.timestamp)) ? -1 : 1);
                let dateLabels = [];
                let chartData = [];
                for (let y = entryData.length; y >= 0; y--) {
                    if (sortedChartData[y] === undefined) {} else {
                        const dateObject = new Date(parseInt(sortedChartData[y].timestamp))
                        const minuteString = `${dateObject.getMinutes()}`
                        const minute = minuteString.length === 1 ? `0${minuteString}` : minuteString;
                        const timestamp = `${dateObject.getMonth() + 1}/${dateObject.getDate()} ${dateObject.getHours()}:${minute}`
                        chartData.push(sortedChartData[y].data);
                        dateLabels.push(timestamp);
                    }
                }
                const width = 800;
                const height = 600;

                const canvas = new ChartJSNodeCanvas({width, height})
                const temp = i === 0 ? 'Player Count' : 'Sim Speed'
                const configuration = {
                    type: 'line',
                    data: {
                        labels: dateLabels,
                        datasets: [{
                            label: `${temp}`,
                            data: chartData,
                            backgroundColor: '#FF0042',
                            borderColor: '#000000',
                            borderWidth: 1

                        }, ],
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    },
                    plugins: [plugin]
                }
                const image = await canvas.renderToBuffer(configuration)
                const attachment = new MessageAttachment(image)

                const stringVar = i === 0 ? `${entryData.length} data points for the last 7 days.\n**__Player Activity__**` : `**__Sim Speeds__**`
                
                try {
                    channel.send(stringVar, attachment)
                } catch (err) {}
            }
        }
    }, 1800000)
}