const database = require('.');

const stopDatabase = async () => {
    try {
        await database.close();
        console.log('Connection has been closed successfully.');
    } catch (error) {
        console.error('Unable to close connection:', error);
    }
};

module.exports = stopDatabase;
