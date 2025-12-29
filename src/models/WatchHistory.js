import { DataTypes, Op } from 'sequelize';
import { sequelize } from '../config/database.js';

const WatchHistory = sequelize.define('WatchHistory', {
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
    
    // Playback position information
    watchedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    
    currentTime: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: 0.00
        },
        comment: 'Current playback position in seconds'
    },
    
    duration: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
            min: 0.00
        },
        comment: 'Total duration when this record was created'
    },
    
    watchedDuration: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: 0.00
        },
        comment: 'Total time watched in this session (seconds)'
    },
    
    // Progress tracking
    progressPercentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: 0.00,
            max: 100.00
        },
        comment: 'Percentage of movie watched (0.00 to 100.00)'
    },
    
    isCompleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: 'True if movie was watched to completion (>90%)'
    },
    
    // Session information
    sessionId: {
        type: DataTypes.STRING(36),
        allowNull: true,
        comment: 'UUID for grouping watch session events'
    },
    
    userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Browser/device information'
    },
    
    ipAddress: {
        type: DataTypes.STRING(45),
        allowNull: true,
        comment: 'Client IP address (supports IPv6)'
    },
    
    // Quality and technical info
    playbackQuality: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Video quality during playback'
    },
    
    bufferingEvents: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        validate: {
            min: 0
        },
        comment: 'Number of buffering events during session'
    },
    
    // Metadata
    platform: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Platform/device type (web, mobile, etc.)'
    },
    
    location: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Geographic location (optional)'
    }
}, {
    timestamps: true,
    tableName: 'watch_history',
    indexes: [
        {
            fields: ['movieId']
        },
        {
            fields: ['watchedAt']
        },
        {
            fields: ['sessionId']
        },
        {
            fields: ['isCompleted']
        },
        {
            fields: ['movieId', 'watchedAt']
        }
    ]
});

// Instance methods
WatchHistory.prototype.updateProgress = function(currentTime, duration) {
    this.currentTime = currentTime;
    if (duration) {
        this.duration = duration;
        this.progressPercentage = Math.min(100, (currentTime / duration) * 100);
        this.isCompleted = this.progressPercentage >= 90;
    }
    this.watchedAt = new Date();
    return this.save();
};

WatchHistory.prototype.addBufferingEvent = function() {
    this.bufferingEvents += 1;
    return this.save();
};

WatchHistory.prototype.markCompleted = function() {
    this.isCompleted = true;
    this.progressPercentage = 100.00;
    return this.save();
};

// Class methods
WatchHistory.getRecentForMovie = function(movieId, limit = 10) {
    return this.findAll({
        where: { movieId },
        order: [['watchedAt', 'DESC']],
        limit
    });
};

WatchHistory.getLatestProgress = function(movieId) {
    return this.findOne({
        where: { movieId },
        order: [['watchedAt', 'DESC']]
    });
};

WatchHistory.getCompletedMovies = function(limit = 50) {
    return this.findAll({
        where: { isCompleted: true },
        order: [['watchedAt', 'DESC']],
        limit,
        include: ['movie']
    });
};

WatchHistory.getWatchingStats = function(movieId) {
    return this.findAll({
        where: { movieId },
        attributes: [
            [sequelize.fn('COUNT', sequelize.col('id')), 'totalSessions'],
            [sequelize.fn('SUM', sequelize.col('watchedDuration')), 'totalWatchTime'],
            [sequelize.fn('MAX', sequelize.col('progressPercentage')), 'maxProgress'],
            [sequelize.fn('AVG', sequelize.col('bufferingEvents')), 'avgBufferingEvents']
        ],
        raw: true
    });
};

WatchHistory.createSession = async function(movieId, sessionData = {}) {
    const { v4: uuidv4 } = await import('uuid');
    
    return this.create({
        movieId,
        sessionId: uuidv4(),
        currentTime: 0,
        watchedDuration: 0,
        progressPercentage: 0,
        userAgent: sessionData.userAgent,
        ipAddress: sessionData.ipAddress,
        platform: sessionData.platform,
        location: sessionData.location
    });
};

export default WatchHistory;