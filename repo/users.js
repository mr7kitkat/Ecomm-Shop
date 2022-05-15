const fs = require("fs");
const crypto = require("crypto");
const util = require("util");
const repository = require("./repository");

const scrypt = util.promisify(crypto.scrypt);

class usersRepository extends repository {
    async create(obj) {
        // Adding random id to user
        obj.id = this.randomId(4);
        
        // managing password section
        const salt = this.randomId(8);
        const hashed = await scrypt(obj.password, salt, 64);

        obj.password = `${hashed.toString("hex")}.${salt}`;
        
        // getting and writing data
        const fdata = await this.getAll();
        fdata.push(obj);
        await this.writeAll(fdata);
        return obj;
    }

    async comparePasswords(input, hashed) {
        const [hash, salt] = hashed.split(".");
        const inputHash = await scrypt(input, salt, 64);
        return hash === inputHash.toString("hex");
    }

}

module.exports = new usersRepository("users.json");


