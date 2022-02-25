module.exports = [{
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
}]