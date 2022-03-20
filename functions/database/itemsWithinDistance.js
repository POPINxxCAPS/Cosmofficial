const gridModel = require('../models/gridSchema');
const planetModel = require('../models/planetSchema');
const floatingObjectModel = require('../models/floatingObjectSchema');
const asteroidModel = require('../models/asteroidSchema');
const characterModel = require('../models/characterSchema');

let loginUsername = "Cosmic_PvPvAI_Network";
let apiKey = "wocLNJRgMpo9OualZpl7";
let plotly = require('plotly')(loginUsername, apiKey);

const NPCNames = ['The Tribunal', 'Contractors', 'Gork and Mork', 'Space Pirates', 'Space Spiders', 'The Chairman', 'Miranda Survivors', 'VOID', 'The Great Tarantula', 'Cosmofficial', 'Clang Technologies CEO', 'Merciless Shipping CEO', 'Mystic Settlers CEO', 'Royal Drilling Consortium CEO', 'Secret Makers CEO', 'Secret Prospectors CEO', 'Specialized Merchants CEO', 'Star Inventors CEO', 'Star Minerals CEO', 'The First Heavy Industry CEO', 'The First Manufacturers CEO', 'United Industry CEO', 'Universal Excavators CEO', 'Universal Miners Guild CEO', 'Unyielding Excavators CEO'];
let allGrids = [];
let playerGrids = [];
let NPCGrids = [];
let asteroids = [];
let planets = [];
let characters = [];
let floatingObjs = [];

module.exports = async (distance, x, y, z, guildID) => {
    let gridDocs = await gridModel.find({
        guildID: guildID
    });
    let asteroidDocs = await asteroidModel.find({
        guildID: guildID
    })
    let planetDocs = await planetModel.find({
        guildID: guildID
    });
    let characterDocs = await characterModel.find({
        guildID: guildID
    });
    let floatingObjDocs = await floatingObjectModel.find({
        guildID: guildID
    });

    if (gridDocs !== null) {
        for (let i = 0; i < gridDocs.length; i++) {
            var dx = Math.round(parseFloat(gridDocs[i].positionX)) - x;
            var dy = Math.round(parseFloat(gridDocs[i].positionY)) - y;
            var dz = Math.round(parseFloat(gridDocs[i].positionZ)) - z;

            let mathDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (gridDocs[i].ownerDisplayName === 'POPINxxCAPS') {}
            if (mathDistance < distance) {
                if (NPCNames.includes(gridDocs[i].ownerDisplayName)) {
                    NPCGrids.push(gridDocs[i]);
                    allGrids.push(gridDocs[i]);
                } else {
                    playerGrids.push(gridDocs[i]);
                    allGrids.push(gridDocs[i]);
                }
            }
        }
    }


    if (asteroidDocs !== null) {
        await asteroidDocs.forEach(doc => {
            var dx = Math.round(parseFloat(doc.x)) - x;
            var dy = Math.round(parseFloat(doc.y)) - y;
            var dz = Math.round(parseFloat(doc.z)) - z;

            let mathDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (mathDistance < distance) {
                asteroids.push(doc)
            }
        })
    }

    if (planetDocs !== null) {
        await planetDocs.forEach(doc => {
            var dx = Math.round(parseFloat(doc.x)) - x;
            var dy = Math.round(parseFloat(doc.y)) - y;
            var dz = Math.round(parseFloat(doc.z)) - z;

            let mathDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (mathDistance < 65000) {
                planets.push(doc)
            }
        })
    }

    if (floatingObjDocs !== null) {
        await floatingObjDocs.forEach(doc => {
            var dx = Math.round(parseFloat(doc.x)) - x;
            var dy = Math.round(parseFloat(doc.y)) - y;
            var dz = Math.round(parseFloat(doc.z)) - z;

            let mathDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (mathDistance < 65000) {
                floatingObjs.push(doc)
            }
        })
    }

    if (characters !== null) {
        await characterDocs.forEach(doc => {
            var dx = Math.round(parseFloat(doc.x)) - x;
            var dy = Math.round(parseFloat(doc.y)) - y;
            var dz = Math.round(parseFloat(doc.z)) - z;

            let mathDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (mathDistance < 65000) {
                characters.push(doc)
            }
        })
    }


    return {
        planets,
        asteroids,
        playerGrids,
        NPCGrids,
        characters,
        floatingObjs
    }
}