const mongoose = require('mongoose');

class Database {
    constructor() {
        this.connect();
    }

    connect() {
        mongoose
            .connect(
                'mongodb+srv://runyud:runyu4cluster@postchitcluster.evxge.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
            )
            .then(() => {
                console.log('database connection successful');
            })
            .catch((err) => {
                console.log('database connection error' + err);
            });
    }
}

module.exports = new Database();
