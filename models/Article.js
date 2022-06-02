const { DataTypes } = require('sequelize');
const sequelize = require('../dbConnection');

const Article = sequelize.define('Article', {
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    body: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    isMatureContent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

module.exports = Article;
