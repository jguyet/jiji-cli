function tab(n, tabValue = 4) {
    return Array(n).fill().map(x => Array(tabValue).fill().map(x => ' ').join("")).join("");
}

module.exports = tab;