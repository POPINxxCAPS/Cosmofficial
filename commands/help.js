const chatModel = require('../models/chatSchema');
const lockedEmbed = require('../functions_discord/lockedEmbed');
// More crap that needs recoding

let commands = [{
    aliases: ['general'],
    commands: [{
        name: 'Lag',
        description: 'Displays current server information and status',
        format: 'c!lag'
    }, {
        name: 'Grids',
        description: 'Looks up grids in the Space Engineers server and displays them in a leaderboard-type layout.',
        format: 'c!grids {pcu, mass} [@playername]'
    }, {
        name: 'Grid Search',
        description: 'Looks up a specific grid by name. If you own the grid, the bot will also DM you coordinates of the position.',
        format: 'c!gridsearch {grid name}'
    }, {
        name: 'Players',
        description: 'Displays all currently online players.',
        format: 'c!players'
    }, {
        name: 'Verify',
        description: 'Link your in-game username to your discord account. Needed to participate in various bot functions.',
        format: 'c!verify {username}'
    }, {
        name: 'Faction',
        description: 'Displays information about players in the faction.',
        format: 'c!faction {factionTag or FactionName}'
    }, {
        name: 'Space Ticket',
        description: 'Purchase a Space Ticket for your faction! Lasts 24 hours.',
        format: 'c!buyspaceticket **||** c!bst',
        cosmicOnly: true
    }, {
        name: 'Chat',
        description: 'Displays chat messages from the Space Engineers server',
        format: 'c!chat [page]'
    }, {
        name: 'Floating Objects',
        description: 'Displays all current floating objects',
        format: 'c!fo'
    }],
}, {
    aliases: ['economy'],
    commands: [{
        name: 'Economy Admin Commands',
        description: 'View admin economy commands',
        format: 'c!help economy admin'
    }, {
        name: 'Balance',
        description: 'Check your balances.',
        format: 'c!bal'
    }, {
        name: 'Pay',
        description: 'Pay a user',
        format: 'c!pay @username {amount}'
    }, {
        name: 'Deposit',
        description: 'Deposit currency into your vault.',
        format: 'c!dep {amount or all}'
    }, {
        name: 'Withdraw',
        description: 'Withdraw currency from your vault.',
        format: 'c!with {amount or all}'
    }, {
        name: 'Timely',
        description: 'Get tokens with a command; Has a cooldown.',
        format: 'c!time'
    }, {
        name: 'Buy Lottery Ticket',
        description: 'Buy a lottery ticket! 0.1% Win Chance',
        format: 'c!blt'
    }, {
        name: 'View Lottery Tickets',
        description: 'View all of your current lottery tickets.',
        format: 'c!tickets'
    }, {
        name: 'Rob',
        description: 'Rob some money from an unfortunate being. Only robs unvaulted tokens.',
        format: 'c!rob {@player}'
    }],
}, {
    aliases: ['events'],
    commands: [{
        name: 'Domination',
        description: 'Domination works just the same as any other game.\n- Multiple Objectives\n- Rewards tokens for winning\n - Rewards tokens per-point (when game ends)\nView current Domination settings - c!cds',
        format: ''
    }, {
        name: 'Hotzone',
        description: 'Hotzone is essentially King-of-the-Hill that appears occasionally. Grants tokens for staying on the objective, and a huge bonus to the faction with the highest *current* surival time.\nView current Hotzone settings - c!chzs',
        format: ''
    }],
}, {
    aliases: ['admin', 'administration'],
    commands: [{
        name: 'Check Remote Setup',
        description: 'Check your current server-link settings.\nWarning: Exposes sensitive information.',
        format: 'c!crs'
    }, {
        name: 'Edit Remote Setup',
        description: 'Edit your current server-link settings.\nWarning: Exposes sensitive information.',
        format: 'c!ers {setting} {value}'
    }, {
        name: 'Check Discord Channel Settings',
        description: 'Check your current channel relays and edit commands.',
        format: 'c!cs'
    }, {
        name: 'Check Hoover Settings',
        description: 'View current Hoover settings. (Trash Cleanup)',
        format: 'c!chs'
    }, {
        name: 'Edit Hoover Settings',
        description: 'Edit current Hoover settings. (Trash Cleanup)',
        format: 'c!ehs {setting} {value}'
    }, {
        name: 'Check Server-Log Settings',
        description: 'View current server-log settings.',
        format: 'c!chs'
    }, {
        name: 'Edit Server-Log Settings',
        description: 'Edit current server-log settings.',
        format: 'c!ehs {setting} {value}'
    }, {
        name: 'Save Server',
        description: 'Perform a server save.',
        format: 'c!saveserver'
    }, {
        name: 'Bulk Delete Messages',
        description: 'Delete x messages from a channel (up to 7 days old)',
        format: 'c!bd {#}'
    }, {
        name: 'Whitelist',
        description: 'View and/or enable/disable the current whitelist.',
        format: 'c!wl [true/false]'
    }, {
        name: 'Add Whitelisted Player',
        description: 'Adds a player to the current whitelist.',
        format: 'c!awp {username}'
    }, {
        name: 'Remove Whitelisted Player',
        description: 'Adds a player to the current whitelist.',
        format: 'c!awp {username}'
    }, {
        name: 'Check Hotzone Settings',
        description: 'Check your current Hotzone settings.',
        format: 'c!chzs'
    }, {
        name: 'Edit Hotzone Settings',
        description: 'Edit your current Hotzone settings.',
        format: 'c!ehzs {setting} {value}'
    }, {
        name: 'Check Domination Settings',
        description: 'Check your current Domination settings.',
        format: 'c!cds'
    }, {
        name: 'Edit Domination Settings',
        description: 'Edit your current Domination settings.',
        format: 'c!eds {setting} {value}'
    }, {
        name: 'Add Domination Objective',
        description: 'Adds a Domination objective. (Max 5)',
        format: 'c!adp {name}'
    }, {
        name: 'Remove Domination Objective',
        description: 'Removes a Domination objective.',
        format: 'c!rdp {name}'
    }, {
        name: 'View Domination Objectives',
        description: 'Views Domination objectives and edit commands.',
        format: 'c!cdp'
    }, {
        name: 'Edit Domination Objective',
        description: 'Edits a Domination objective.',
        format: 'c!edp {name} {setting} {value}'
    }, {
        name: 'Check Economy Settings',
        description: 'View all current economy settings.',
        format: 'c!ces'
    }, {
        name: 'Edit Economy Settings',
        description: 'Change a single current economy setting.',
        format: 'c!ees {setting} {value}'
    }],
}, {
    aliases: ['support'],
    commands: [{
            name: 'Support Ticket (Coming Soon)',
            description: 'Submit a ticket for support. Be sure to include as much information as possible. If you are trying to get a grid un-stuck or out of under the planet include the grid name, and coordinates of the paste location.',
            format: 'c!st {priority} {your message here}\nPriority = high / medium / low'
        },
        {
            name: 'Bug Report (Coming Soon)',
            description: 'Submit a bug report. This can be a mod, the bot, or the server in general. Be sure to include as much information as possible to ensure admins can replicate the issue and solve it.\nIt is up to server owners to relay major bot bug reports to the Cosmofficial discord.',
            format: 'c!br {priority} {your message here}\nPriority = high / medium / low'
        }, {
            name: 'Suggestion (Coming Soon)',
            description: 'Suggest something new. This can be a new mod, server idea, etc.',
            format: 'c!suggest {your message here}'
        },
        {
            name: 'Cosmofficial Discord',
            description: 'Link to the Cosmofficial discord.\nBug reports and suggestions can be made here.\nSetting up the bot: <#854252643946070046>',
            format: 'c!invite'
        }, {
            name: 'Cosmofficial Patreon',
            description: 'Link to the Cosmofficial Patreon.',
            format: 'c!patreon'
        }
    ],
}, {
    aliases: ['mapping'],
    commands: [{
        name: 'Near (Coming Soon)',
        description: 'Purchase a 2D map of your surroundings with approximate coordinates. Price is per meter.',
        format: 'c!near',
    }]
}, {
    aliases: ['combat'],
    commands: [{
        name: 'EMP (Coming Soon)',
        description: 'EMP (power off) All grids within 3km for 15 seconds.',
        format: 'c!emp',
    }]
}, {
    aliases: ['faq'],
    commands: [{
        name: 'Why were my grids deleted?',
        description: `Answer: You are not verified with c!verify or, you left the discord.
        Answer two: If you are verified, and grids are still being deleted, it's because the grid getting deleted has no terminal block, so it cannot detect an actual "owner" to compare to. Start with a battery, reactor, or anything with a terminal.
        
        Odd case: In situations where you have multiple players building on the same grid, ensure majority of the grid is owned by a single player to prevent the "No-Grid Owner" bug.
        Grids are given a 24 hour window from when they're marked for deletion, and when they are actually deleted.
        If you have a grid that is queued for deletion, you will be DM'ed and given that 24hrs to fix the issue. (Must be verified)`,
        format: '',
    }, {
        name: 'Mod pages are being skipped in the radial menu, why?',
        description: `Most mod authors don't properly set up the radial wheel for their mod, so to access their items you must have a keyboard and access the "G" menu. Alternatively, it may show up in progression.`,
        format: '',
    }, {
        name: 'How do I make discord currency?',
        description: 'There are many many ways to make currency. It is received for being online + verified, particpating in events/games/lottery, and eventually blowing stuff up ;)',
        format: '',
    }, {
        name: 'What do I use discord currency for?',
        description: 'EMPs, Map Purchases/Scans, and much more if the server uses Cosmofficial compatability mods.',
        format: '',
    }, {
        name: 'My map purchase is blank?',
        description: 'This means there is nothing close enough to your character to display.',
        format: '',
    }, {
        name: 'How do shields work? I am still taking damage?',
        description: `Jump Drives now behave like shields. Once fully powered, a jump drive will protect your ship from actual damage as long as it has power left. When it runs out, it will stop providing shields until fully powered once again. Your ship will begin to take real damage in this time. There will be dedicated shield blocks when I make tiered jump drives.

        There is a client-side issue where blocks look like they are being damaged, but they aren't. A simple re-log fixes the issue and you can see the actual health values of your blocks.
        
        Stacking Jump Drives = More Shields!`,
        format: '',
        cosmicOnly: true
    }, {
        name: 'Where is the Drone Arcade?',
        description: `Something like this requires 50-100+ custom ship blueprints (minimum) and I simply do not have the time nor skill level to make extremely sexy ships. Due to this, the Drone Arcade will be more of a "community-driven" game-mode using community blueprints. 

        Love making fancy ships? Let me know! The amount of drones required for something like this is actually kinda crazy. We could use all the builders available :)
        
        Note: Your blueprints/builds will never be used without your permission.`,
        format: '',
        cosmicOnly: true
    }, {
        name: 'What is the "Active Players" counter?',
        description: 'The number of unique players that have logged in, in the last two weeks.',
        format: '',
        cosmicOnly: true
    }, {
        name: 'How do I make creative builds for projectors?',
        description: `Like any other server, use single-player. There is a special version of the server's modpack made for single-player. Simply load the modpack into your world and the rest will be downloaded automatically!`,
        format: '',
        cosmicOnly: true
    }]
}, {
    aliases: ['alliance', 'alliances'],
    commands: [{
        name: 'Create Alliance',
        description: 'Create an alliance, this will be used in future bot development projects.',
        format: 'c!createalliance **||** c!ca'
    }, {
        name: 'Invite to Alliance',
        description: 'Invites a faction to your alliance.',
        format: 'c!allianceinvite {factionTag} **||** c!ai {factionTag}'
    }, {
        name: 'Join Alliance',
        description: 'Join an alliance, must be invited first.',
        format: 'c!alliancejoin **||** c!aj'
    }]
}]

let allHelp = [commands]

module.exports = {
    name: 'help',
    aliases: ['help'],
    description: "List server chat messages",
    permissions: ["SEND_MESSAGES"],
    async execute(message, args, cmd, client, discord, mainGuild, guild, playerEco) {
        const embed = new discord.MessageEmbed()
            .setColor('#E02A6B')
            .setTitle(`Cosmofficial Help`)
            .setURL('https://cosmofficial.herokuapp.com/')
            .setDescription(`Command format: c!help {category/command} [page]\n{} = Required\n[] = Optional`)
        // Main embed set-up

        if (args[0] === undefined) { // If no category defined, list available categories
            embed.addFields({
                    name: 'Categories',
                    value: `Adminstration\nGeneral\nEconomy\nEvents\nCombat\nMapping\nSupport\nFAQ\nAlliance`
                }, )
                .setFooter('Cosmofficial by POPINxxCAPS');
            return message.channel.send(embed);
        }

        let category;
        let searchTerm = args[0].toLowerCase();
        for (let i = 0; i < allHelp.length; i++) { // Find category
            let section = allHelp[0]
            for (let a = 0; a < section.length; a++) {
                let categoryArray = section[a];
                if (categoryArray.aliases.includes(searchTerm)) {
                    category = categoryArray
                }
            }
        }

        if (category === undefined) { // Return an error message (unfinished)
            embed.addFields({
                name: 'Invalid Format',
                value: 'Category/Command not found'
            })
            return message.channel.send(embed);
        };

        let page = 0;
        if (args[1] !== undefined) {
            if (args[1] % 1 != 0 || args[1] <= 0) { // Attempt to set page #, verify it is a whole number
                embed.addFields({
                    name: 'Invalid Format',
                    value: 'Page must be a number.'
                })
                return message.channel.send(embed)
            } else {
                page = parseInt(args[1]) - 1;
            }
        }
        let startingPoint = page * 10;
        if (startingPoint > category.commands.length) {
            startingPoint = category.commands.length - 10;
        }
        if (startingPoint < 0) { // Redundancy crash checks
            startingPoint = 0;
        }
        let endingPoint = (startingPoint + 10);
        for (let i = startingPoint; i < endingPoint; i++) {
            if (category.commands[i] !== undefined) {
                if (category.commands[i].cosmicOnly === undefined) {
                    let embedValue = `${category.commands[i].description}`
                    if (category.commands[i].format !== '') {
                        embedValue += `\nFormat: ${category.commands[i].format}`
                    }
                    embed.addFields({
                        name: `${category.commands[i].name}`,
                        value: embedValue
                    })
                }
                if (category.commands[i].cosmicOnly === true && message.guild.id === '799685703910686720') {
                    let embedValue = `${category.commands[i].description}`
                    if (category.commands[i].format !== '') {
                        embedValue += `\nFormat: ${category.commands[i].format}`
                    }
                    embed.addFields({
                        name: `${category.commands[i].name}`,
                        value: embedValue
                    })
                }
            }
        }
        if (endingPoint < category.commands.length) {
            embed.setFooter(`c!help ${category.aliases[0]} ${page + 2}\nCosmofficial by POPINxxCAPS`);
        }
        return message.channel.send(embed);
    }
}