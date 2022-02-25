module.exports = [{
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
}]