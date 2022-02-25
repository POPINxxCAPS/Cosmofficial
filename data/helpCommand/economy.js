module.exports = [{
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
}]