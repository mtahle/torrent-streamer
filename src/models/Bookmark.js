import { DataTypes, Op } from 'sequelize';
import { sequelize } from '../config/database.js';

const Bookmark = sequelize.define('Bookmark', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    
    movieId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'movies',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    
    // Bookmark information
    title: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            len: [0, 255]
        },
        comment: 'Custom bookmark title (optional)'
    },
    
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'User notes about this bookmark'
    },
    
    // Position bookmarking
    currentTime: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00,
        validate: {
            min: 0.00
        },
        comment: 'Bookmarked position in seconds (optional)'
    },
    
    // Categories and organization
    category: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'general',
        comment: 'Bookmark category (favorites, watchlater, etc.)'
    },
    
    tags: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Comma-separated tags for organization'
    },
    
    // Priority and rating
    priority: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 5
        },
        comment: 'Priority level (0-5, 5 = highest)'
    },
    
    rating: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: true,
        validate: {
            min: 0.0,
            max: 5.0
        },
        comment: 'User rating (0.0 to 5.0 stars)'
    },
    
    // Status tracking
    isWatched: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: 'Whether bookmarked movie has been watched'
    },
    
    watchLater: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: 'Mark for watch later queue'
    },
    
    isFavorite: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: 'Mark as favorite bookmark'
    },
    
    // Metadata
    bookmarkedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    
    lastAccessed: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Last time this bookmark was accessed'
    },
    
    accessCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        validate: {
            min: 0
        },
        comment: 'Number of times bookmark was accessed'
    },
    
    // Organization
    sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Custom sort order for user organization'
    }
}, {
    timestamps: true,
    tableName: 'bookmarks',
    indexes: [
        {
            fields: ['movieId']
        },
        {
            fields: ['category']
        },
        {
            fields: ['priority']
        },
        {
            fields: ['bookmarkedAt']
        },
        {
            fields: ['isFavorite']
        },
        {
            fields: ['watchLater']
        },
        {
            fields: ['isWatched']
        }
    ]
});

// Instance methods
Bookmark.prototype.markAccessed = function() {
    this.lastAccessed = new Date();
    this.accessCount += 1;
    return this.save();
};

Bookmark.prototype.updateRating = function(rating) {
    if (rating >= 0 && rating <= 5) {
        this.rating = rating;
        return this.save();
    }
    throw new Error('Rating must be between 0 and 5');
};

Bookmark.prototype.toggleFavorite = function() {
    this.isFavorite = !this.isFavorite;
    return this.save();
};

Bookmark.prototype.toggleWatchLater = function() {
    this.watchLater = !this.watchLater;
    return this.save();
};

Bookmark.prototype.markWatched = function() {
    this.isWatched = true;
    this.lastAccessed = new Date();
    return this.save();
};

Bookmark.prototype.updatePosition = function(currentTime) {
    this.currentTime = currentTime;
    this.lastAccessed = new Date();
    return this.save();
};

// Class methods
Bookmark.getFavorites = function() {
    return this.findAll({
        where: { isFavorite: true },
        order: [['priority', 'DESC'], ['bookmarkedAt', 'DESC']],
        include: ['movie']
    });
};

Bookmark.getWatchLater = function() {
    return this.findAll({
        where: { watchLater: true },
        order: [['priority', 'DESC'], ['bookmarkedAt', 'ASC']],
        include: ['movie']
    });
};

Bookmark.getByCategory = function(category) {
    return this.findAll({
        where: { category },
        order: [['sortOrder', 'ASC'], ['priority', 'DESC'], ['bookmarkedAt', 'DESC']],
        include: ['movie']
    });
};

Bookmark.getRecentlyAccessed = function(limit = 10) {
    return this.findAll({
        where: {
            lastAccessed: {
                [Op.not]: null
            }
        },
        order: [['lastAccessed', 'DESC']],
        limit,
        include: ['movie']
    });
};

Bookmark.getMostAccessed = function(limit = 10) {
    return this.findAll({
        where: {
            accessCount: {
                [Op.gt]: 0
            }
        },
        order: [['accessCount', 'DESC']],
        limit,
        include: ['movie']
    });
};

Bookmark.getHighestRated = function(limit = 10) {
    return this.findAll({
        where: {
            rating: {
                [Op.not]: null
            }
        },
        order: [['rating', 'DESC'], ['bookmarkedAt', 'DESC']],
        limit,
        include: ['movie']
    });
};

Bookmark.findOrCreateForMovie = function(movieId, bookmarkData = {}) {
    return this.findOrCreate({
        where: { movieId },
        defaults: {
            movieId,
            ...bookmarkData
        }
    });
};

export default Bookmark;