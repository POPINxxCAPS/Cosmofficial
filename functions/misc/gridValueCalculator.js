

module.exports = async (grid) => {
    let modifier = 1;
    if(grid === undefined) return;
    if(grid.gridSize === "Large") modifier += 3;
    modifier += grid.PCU / 2000;
    modifier += grid.blocksCount / 33;

    let baseValue = 20000;
    let price = Math.round(baseValue * modifier);
    return price;
}