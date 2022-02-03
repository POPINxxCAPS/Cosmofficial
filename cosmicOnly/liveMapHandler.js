const gridModel = require('../models/gridSchema');
const planetModel = require('../models/planetSchema');
const playersModel = require('../models/playerSchema');
const asteroidModel = require('../models/asteroidSchema');
const floatingObjectModel = require('../models/floatingObjectSchema');
const characterModel = require('../models/characterSchema');

let loginUsername = "MarkussH";
let apiKey = process.env.plotlyAPIKey || require('../env/env').plotlyAPIKey
let plotly = require('plotly')(loginUsername, apiKey);



module.exports = async () => {
    setInterval(async () => {
        var corners = {
            x: [5000000, -5000000],
            y: [5000000, -5000000],
            z: [5000000, -5000000],
            name: "Map Corners",
            mode: "markers",
            marker: {
                color: "rgb(255, 84, 69)",
                size: 1,
                symbol: "square",
                line: {
                    color: "rgb(0, 0, 0)",
                    width: 1
                },
                opacity: 1
            },
            type: "scatter3d"
        };

        var grids = {
            x: [],
            y: [],
            z: [],
            name: "Player Grid",
            mode: "markers",
            marker: {
                color: "rgb(255, 84, 69)",
                size: 2,
                symbol: "square",
                line: {
                    color: "rgb(0, 0, 0)",
                    width: 1
                },
                opacity: 1
            },
            type: "scatter3d"
        };

        var planets = {
            x: [],
            y: [],
            z: [],
            name: "Planet",
            mode: "markers",
            marker: {
                color: "rgb(255, 213, 161)",
                size: 12,
                symbol: "circle",
                line: {
                    color: "rgb(0, 0, 0)",
                    width: 1
                },
                opacity: 0.9
            },
            type: "scatter3d"
        };

        var moons = {
            x: [],
            y: [],
            z: [],
            name: "Moon",
            mode: "markers",
            marker: {
                color: "rgb(0, 203, 207)",
                size: 6,
                symbol: "circle",
                line: {
                    color: "rgb(0, 0, 0)",
                    width: 1
                },
                opacity: 0.9
            },
            type: "scatter3d"
        };

        var asteroids = {
            x: [],
            y: [],
            z: [],
            name: "Asteroid",
            mode: "markers",
            marker: {
                color: "rgb(115, 110, 110)",
                size: 3,
                symbol: "circle",
                line: {
                    color: "rgb(0, 0, 0)",
                    width: 1
                },
                opacity: 0.8
            },
            type: "scatter3d"
        };

        var characters = {
            x: [],
            y: [],
            z: [],
            name: "Characters",
            mode: "markers",
            marker: {
                color: "rgb(235, 116, 52)",
                size: 3,
                symbol: "star",
                line: {
                    color: "rgb(0, 0, 0)",
                    width: 1
                },
                opacity: 1
            },
            type: "scatter3d"
        };

        var floatingObjects = {
            x: [],
            y: [],
            z: [],
            name: "Floating Objects",
            mode: "markers",
            marker: {
                color: "rgb(255, 238, 0)",
                size: 2,
                symbol: "circle",
                line: {
                    color: "rgb(0, 0, 0)",
                    width: 1
                },
                opacity: 1
            },
            type: "scatter3d"
        };


        let asteroidDocs = await asteroidModel.find({
            guildID: '799685703910686720'
        });
        if (!asteroidDocs[0]) {} else {
            await asteroidDocs.forEach(asteroid => {
                asteroids.x.push(parseFloat(asteroid.x))
                asteroids.y.push(parseFloat(asteroid.y))
                asteroids.z.push(parseFloat(asteroid.z))
            })
        }

        let planetDocs = await planetModel.find({
            guildID: '799685703910686720'
        });
        if (!planetDocs[0]) {} else {
            await planetDocs.forEach(planet => {
                if (planet.name.includes('Tohil')) {
                    moons.x.push(parseFloat(planet.x))
                    moons.y.push(parseFloat(planet.y))
                    moons.z.push(parseFloat(planet.z))
                } else {
                    planets.x.push(parseFloat(planet.x))
                    planets.y.push(parseFloat(planet.y))
                    planets.z.push(parseFloat(planet.z))
                }
            })
        }

        let gridDocs = await gridModel.find({
            guildID: '799685703910686720'
        });
        if (!gridDocs[0]) {} else {
            await gridDocs.forEach(grid => {
                grids.x.push(grid.positionX)
                grids.y.push(grid.positionY)
                grids.z.push(grid.positionZ)
            });
        }

        let characterDocs = await characterModel.find({
            guildID: '799685703910686720'
        });
        if (!characterDocs[0]) {} else {
            await gridDocs.forEach(character => {
                characters.x.push(character.x)
                characters.y.push(character.y)
                characters.z.push(character.z)
            });
        }

        let floatingObjDocs = await floatingObjectModel.find({
            guildID: '799685703910686720'
        });
        if (!floatingObjDocs[0]) {} else {
            await floatingObjDocs.forEach(floatingObj => {
                floatingObjects.x.push(floatingObj.x)
                floatingObjects.y.push(floatingObj.y)
                floatingObjects.z.push(floatingObj.z)
            });
        }


        let data = [corners, grids, planets, moons, asteroids, characters, floatingObjects]
        /*var layout = {margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 0
          }};
        var graphOptions = {layout: layout, filename: "cosmic", fileopt: "overwrite"};*/
        var layout = {
            fileopt: "overwrite",
            filename: "cosmic",
        };
        console.log(`${grids.x.length} Grids`)
        console.log(`${planets.x.length} Planets`)
        console.log(`${moons.x.length} Moons`)
        console.log(`${asteroids.x.length} Asteroids`)
        console.log(`${characters.x.length} Characters`)
        console.log(`${floatingObjects.x.length} Floating Objects`)

        setTimeout(function() {
            plotly.plot(data, layout, function (err, msg) {
                console.log(msg);
                console.log(err)
            });
        })
        
        //    let streamToken = '28ohewec4q';


        /*var i = 0;
    setInterval(() => {
        var streamObject = JSON.stringify({ x : i, y : i });
        stream1.write(streamObject + '\n');
        i++;
    }, 1000);
    /*var initialData = {
        gl: scene.gl,
        position: [ [2058935, -65916, -65801], [1927437, -65185, -65094], [-1919985, -254912, -60010], [1774017, 2700, 55520], [2181534, -44943, -49839], [-2150388, 169396, 54737] ],
        glyph: [  "▼", "▼", "▼", "▼", "▼", "▼" ],
        color: [ [0,0,0], [0,0,0], [0,0,0], [0,0,0], [0,0,0], [0,0,0] ],
        size: 12,
        orthographic: true
      }
  
      var points = createPoints(initialData)
      scene.add(points)
      const attachment = new MessageAttachment(scene)
      await message.channel.send(attachment);*/
    }, 60000)
}