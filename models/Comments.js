const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Comment = sequelize.define('Comment', {
    body: {
        type: DataTypes.TEXT
    }
});

module.exports = Comment;
