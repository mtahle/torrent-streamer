import { DataTypes, Op } from 'sequelize';
import { sequelize } from '../config/database.js';

const Movie = sequelize.define('Movie', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    
    // Core movie information
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 255]
        }
    },
    
    year: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1900,
            max: new Date().getFullYear() + 5
        }
    },
    
    genre: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            len: [0, 100]
        }
    },
    
    quality: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isIn: [['480p', '720p', '1080p', '1440p', '4K', 'Unknown']]
        },
        defaultValue: 'Unknown'
    },
    
    // Torrent information
    magnetUri: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            isMagnetUri(value) {
                if (!value.startsWith('magnet:')) {
                    throw new Error('Must be a valid magnet URI');
                }
            }
        }
    },
    
    infoHash: {
        type: DataTypes.STRING(40),
        allowNull: true,
        unique: true,
        validate: {
            len: [40, 40]
        }
    },
    
    // File information
    filePath: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Path to the main movie file within the torrent'
    },
    
    fileSize: {
        type: DataTypes.BIGINT,
        allowNull: true,
        validate: {
            min: 0
        }
    },
    
    duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 0
        },
        comment: 'Movie duration in seconds'
    },
    
    // Status and metadata
    status: {
        type: DataTypes.ENUM,
        values: ['pending', 'downloading', 'ready', 'error'],
        defaultValue: 'pending',
        allowNull: false
    },
    
    downloadProgress: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0.00,
        validate: {
            min: 0.00,
            max: 100.00
        },
        comment: 'Download progress percentage (0.00 to 100.00)'
    },
    
    seeders: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    
    leechers: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    
    // User interaction
    isBookmarked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    
    lastWatched: {
        type: DataTypes.DATE,
        allowNull: true
    },
    
    watchCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    
    // Additional metadata
    poster: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            isUrl: true
        },
        comment: 'URL to movie poster image'
    },
    
    imdbId: {
        type: DataTypes.STRING(10),
        allowNull: true,
        validate: {
            is: /^tt\d{7,8}$/
        }
    },
    
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    
    tags: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Comma-separated tags'
    }
}, {
    timestamps: true,
    tableName: 'movies',
    indexes: [
        {
            fields: ['magnetUri']
        },
        {
            fields: ['infoHash']
        },
        {
            fields: ['status']
        },
        {
            fields: ['lastWatched']
        },
        {
            fields: ['isBookmarked']
        }
    ]
});

// Instance methods
Movie.prototype.updateProgress = function(progress) {
    this.downloadProgress = Math.min(100, Math.max(0, progress));
    return this.save();
};

Movie.prototype.markAsWatched = function() {
    this.lastWatched = new Date();
    this.watchCount += 1;
    return this.save();
};

Movie.prototype.toggleBookmark = function() {
    this.isBookmarked = !this.isBookmarked;
    return this.save();
};

// Class methods
Movie.getRecentlyWatched = function(limit = 10) {
    return this.findAll({
        where: {
            lastWatched: {
                [Op.not]: null
            }
        },
        order: [['lastWatched', 'DESC']],
        limit
    });
};

Movie.getBookmarked = function() {
    return this.findAll({
        where: {
            isBookmarked: true
        },
        order: [['createdAt', 'DESC']]
    });
};

Movie.getByStatus = function(status) {
    return this.findAll({
        where: { status },
        order: [['createdAt', 'DESC']]
    });
};

export default Movie;