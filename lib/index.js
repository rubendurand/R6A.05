'use strict';

const Server = require('./server');

const start = async () => {

    try {
        await Server.start();
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }
};

start();
