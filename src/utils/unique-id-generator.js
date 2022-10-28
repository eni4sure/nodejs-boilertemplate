const { nanoid, customAlphabet } = require("nanoid");

class UniqueIDGenerator {
    constructor(customString) {
        this.alphabet = customString || "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        this.length = 15;
    }

    generateRandom(length) {
        return nanoid(length);
    }

    generateCustom(length) {
        return customAlphabet(this.alphabet, this.length)(length);
    }
}

module.exports = UniqueIDGenerator;
