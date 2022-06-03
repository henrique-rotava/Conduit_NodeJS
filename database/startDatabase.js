const database = require('.');
require('./loadModels');

const startDatabase = async () => {
    try {
        await database.authenticate();
        await database.sync({ alter: true });
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

module.exports = startDatabase;
