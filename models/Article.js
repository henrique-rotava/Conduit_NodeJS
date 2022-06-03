const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Tag = require('./Tag');
const Comment = require('./Comments');

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

Article.belongsToMany(Tag, { through: 'TagList', uniqueKey: false, timestamps: false });
Tag.belongsToMany(Article, { through: 'TagList', uniqueKey: false, timestamps: false });

Article.hasMany(Comment, { onDelete: 'CASCADE' });
Comment.belongsTo(Article);

module.exports = Article;
