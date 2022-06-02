const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME ?? 'd6rk5ijgmvcf6q',
    process.env.USER_NAME,
    process.env.PASSWORD,
    {
        dialect: process.env.NODE_ENV === 'test' ? 'sqlite' : 'postgres',
        host: process.env.DB_HOST,
        logging: false,
        port: process.env.DB_PORT ?? 5432,
        storage: './__tests__/database.sqlite',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false // <<<<<<< YOU NEED THIS
            }
        }
    }
);

module.exports = sequelize;
