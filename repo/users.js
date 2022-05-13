const fs = require("fs");
const crypto = require("crypto");
const util = require("util");

const scrypt = util.promisify(crypto.scrypt);

class usersRepository {
    constructor (filename) {
        this.filename = filename;

        try {
            fs.accessSync(this.filename);
        }   
        catch{
            fs.writeFileSync(this.filename,"[]");
        }
    }

    async getAll() {
        return JSON.parse(
            await fs.promises.readFile(this.filename)
        );
    }
    
    async getOneById(id) {
        const data = await this.getAll();
        return data.find(item => item.id === id);
    }


    async getOneByFilter(obj) {
        const allData = await this.getAll();

        for (let data of allData) {
            let found = true;

            for (let key in obj) {
                if (obj[key] !== data[key]) {
                    found = false;
                }
            }

            if (found) {
                return data;
            }
        }
    }
    
    async writeAll(data) {
        await fs.promises.writeFile(this.filename, JSON.stringify(data, null, 2));
    }

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

    randomId(n) {
        return crypto.randomBytes(n).toString("hex");
    }

    async delete(id) {
        const fulldata = await this.getAll();
        const filtered = fulldata.filter(item => item.id !== id);
        await this.writeAll(filtered);
    }

    async update(id, obj) {
        const data = await this.getAll();
        const record = data.find(item => item.id === id);
        Object.assign(record, obj);
        await this.writeAll(data)
    }

}

module.exports = new usersRepository("users.json");