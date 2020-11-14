function sepCase(str, sep = '-') {
    return str
      .replace(/[A-Z]/g, (letter, index) => {
        const lcLet = letter.toLowerCase();
        return index ? sep + lcLet : lcLet;
      })
      .replace(/([-_ ]){1,}/g, sep)
};

module.exports = sepCase;