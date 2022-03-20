const statusModel = require('../../models/statusSchema');


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



module.exports = async (discord, guild, channel) => {

    const statusDoc = await statusModel.findOne({
        guildID: guild.id
    })
    if (statusDoc === null) return;

    const current_time = Date.now()
    const timeCutoff = current_time - (2 * (86400 * 1000))


    let targetData = statusDoc.populationLog;
    
    let entryData = []
    for (let a = 0; a < targetData.length; a++) {
        if (parseInt(targetData[a].timestamp) > timeCutoff) {
            entryData.push({
                data: targetData[a].playerCount,
                timestamp: parseInt(targetData[a].timestamp)
            })
        }
    }
    // IF there is data found to chart
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
        const width = 400;
        const height = 200;

        const canvas = new ChartJSNodeCanvas({
            width,
            height
        })
        const temp = 'Player Activity'
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

        const stringVar = `**__Player Activity__**`

        try {
            channel.send(stringVar, attachment)
            //channel.send(attachment);
        } catch (err) {
            console.log(err)
        }
        return;
    }

}