import { DataTypes, Op } from 'sequelize';
import { sequelize } from '../config/database.js';

const ActiveSession = sequelize.define('ActiveSession', {
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
    
    // Session identification
    sessionId: {
        type: DataTypes.STRING(36),
        allowNull: false,
        unique: true,
        comment: 'Unique session identifier (UUID)'
    },
    
    // Client information
    clientId: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Unique client identifier for reconnection'
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
    
    // Session status
    status: {
        type: DataTypes.ENUM,
        values: ['initializing', 'loading', 'playing', 'paused', 'buffering', 'ended', 'error'],
        defaultValue: 'initializing',
        allowNull: false
    },
    
    // Playback state
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
        comment: 'Total duration of the media'
    },
    
    playbackRate: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: false,
        defaultValue: 1.00,
        validate: {
            min: 0.25,
            max: 4.00
        },
        comment: 'Playback speed (0.25x to 4.00x)'
    },
    
    volume: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: false,
        defaultValue: 1.00,
        validate: {
            min: 0.00,
            max: 1.00
        },
        comment: 'Volume level (0.00 to 1.00)'
    },
    
    isMuted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    
    isFullscreen: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    
    // Quality and technical info
    quality: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Current video quality (720p, 1080p, etc.)'
    },
    
    bandwidth: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 0
        },
        comment: 'Available bandwidth in kbps'
    },
    
    bufferHealth: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        validate: {
            min: 0.00,
            max: 100.00
        },
        comment: 'Buffer health percentage'
    },
    
    downloadSpeed: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
            min: 0.00
        },
        comment: 'Current download speed in MB/s'
    },
    
    uploadSpeed: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
            min: 0.00
        },
        comment: 'Current upload speed in MB/s'
    },
    
    // Session timing
    startedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    
    lastActivity: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    
    endedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    
    // Statistics
    bufferingCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    
    seekCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    
    pauseCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    
    // Error tracking
    errorCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    
    lastError: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Last error message encountered'
    },
    
    // Device and platform info
    platform: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Platform (web, mobile, desktop, etc.)'
    },
    
    browserName: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    
    browserVersion: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    
    screenResolution: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Screen resolution (e.g., 1920x1080)'
    }
}, {
    timestamps: true,
    tableName: 'active_sessions',
    indexes: [
        {
            fields: ['sessionId']
        },
        {
            fields: ['movieId']
        },
        {
            fields: ['status']
        },
        {
            fields: ['lastActivity']
        },
        {
            fields: ['clientId']
        }
    ]
});

// Instance methods
ActiveSession.prototype.updatePlayback = function(playbackData) {
    const allowedFields = [
        'currentTime', 'duration', 'playbackRate', 'volume', 
        'isMuted', 'isFullscreen', 'status', 'bufferHealth'
    ];
    
    allowedFields.forEach(field => {
        if (playbackData[field] !== undefined) {
            this[field] = playbackData[field];
        }
    });
    
    this.lastActivity = new Date();
    return this.save();
};

ActiveSession.prototype.recordBuffering = function() {
    this.bufferingCount += 1;
    this.status = 'buffering';
    this.lastActivity = new Date();
    return this.save();
};

ActiveSession.prototype.recordSeek = function(newTime) {
    this.seekCount += 1;
    this.currentTime = newTime;
    this.lastActivity = new Date();
    return this.save();
};

ActiveSession.prototype.recordPause = function() {
    this.pauseCount += 1;
    this.status = 'paused';
    this.lastActivity = new Date();
    return this.save();
};

ActiveSession.prototype.recordError = function(errorMessage) {
    this.errorCount += 1;
    this.lastError = errorMessage;
    this.status = 'error';
    this.lastActivity = new Date();
    return this.save();
};

ActiveSession.prototype.endSession = function() {
    this.status = 'ended';
    this.endedAt = new Date();
    this.lastActivity = new Date();
    return this.save();
};

ActiveSession.prototype.heartbeat = function() {
    this.lastActivity = new Date();
    return this.save();
};

// Class methods
ActiveSession.getActiveSessions = function() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    return this.findAll({
        where: {
            status: {
                [Op.in]: ['loading', 'playing', 'paused', 'buffering']
            },
            lastActivity: {
                [Op.gte]: fiveMinutesAgo
            }
        },
        order: [['lastActivity', 'DESC']],
        include: ['movie']
    });
};

ActiveSession.getSessionsForMovie = function(movieId) {
    return this.findAll({
        where: { movieId },
        order: [['lastActivity', 'DESC']],
        include: ['movie']
    });
};

ActiveSession.getSessionById = function(sessionId) {
    return this.findOne({
        where: { sessionId },
        include: ['movie']
    });
};

ActiveSession.cleanupStale = function(timeoutMinutes = 10) {
    const cutoffTime = new Date(Date.now() - timeoutMinutes * 60 * 1000);
    
    return this.destroy({
        where: {
            lastActivity: {
                [Op.lt]: cutoffTime
            },
            status: {
                [Op.notIn]: ['ended']
            }
        }
    });
};

ActiveSession.createSession = async function(movieId, sessionData = {}) {
    const { v4: uuidv4 } = await import('uuid');
    
    return this.create({
        movieId,
        sessionId: uuidv4(),
        clientId: sessionData.clientId || null,
        userAgent: sessionData.userAgent,
        ipAddress: sessionData.ipAddress,
        platform: sessionData.platform,
        browserName: sessionData.browserName,
        browserVersion: sessionData.browserVersion,
        screenResolution: sessionData.screenResolution,
        quality: sessionData.quality
    });
};

ActiveSession.getSessionStats = function() {
    return this.findAll({
        attributes: [
            [sequelize.fn('COUNT', sequelize.col('id')), 'totalSessions'],
            [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status IN ('playing', 'paused', 'buffering') THEN 1 END")), 'activeSessions'],
            [sequelize.fn('AVG', sequelize.col('bufferingCount')), 'avgBufferingEvents'],
            [sequelize.fn('AVG', sequelize.col('errorCount')), 'avgErrors']
        ],
        raw: true
    });
};

export default ActiveSession;