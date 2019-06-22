const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const mongodb = function() {
    const self = this;

    // Connection URL
    const url = 'mongodb://localhost:27017';

    // Database Name
    const dbName = 'pm-tool';

    // Create a new MongoClient
    const client = new MongoClient(url);
    this.db = null;

    // Use connect method to connect to the Server
    this.connect = () => {
        client.connect((err) => {
            assert.equal(null, err);
            console.log("Connected successfully to server");
            self.db = client.db(dbName);
        });
    };

    return this;

};

module.exports = new mongodb();