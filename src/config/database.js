import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const dbPath = path.join(__dirname, '../../data/torrent-streamer.db');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false, // Disable SQL logging for cleaner output
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// Test database connection
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully');
        return true;
    } catch (error) {
        console.error('❌ Unable to connect to database:', error.message);
        return false;
    }
};

// Initialize database and sync models
const initDatabase = async () => {
    try {
        // Import models
        const Movie = (await import('../models/Movie.js')).default;
        const WatchHistory = (await import('../models/WatchHistory.js')).default;
        const Bookmark = (await import('../models/Bookmark.js')).default;
        const ActiveSession = (await import('../models/ActiveSession.js')).default;

        // Define associations
        await setupAssociations();

        // Sync all models
        await sequelize.sync({ 
            alter: process.env.NODE_ENV === 'development',
            force: false 
        });

        console.log('✅ Database models synchronized successfully');
        return true;
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        return false;
    }
};

// Setup model associations
const setupAssociations = async () => {
    const Movie = (await import('../models/Movie.js')).default;
    const WatchHistory = (await import('../models/WatchHistory.js')).default;
    const Bookmark = (await import('../models/Bookmark.js')).default;
    const ActiveSession = (await import('../models/ActiveSession.js')).default;

    // Movie has many watch history entries
    Movie.hasMany(WatchHistory, { 
        foreignKey: 'movieId', 
        as: 'watchHistory',
        onDelete: 'CASCADE' 
    });
    WatchHistory.belongsTo(Movie, { 
        foreignKey: 'movieId', 
        as: 'movie' 
    });

    // Movie has many bookmarks
    Movie.hasMany(Bookmark, { 
        foreignKey: 'movieId', 
        as: 'bookmarks',
        onDelete: 'CASCADE' 
    });
    Bookmark.belongsTo(Movie, { 
        foreignKey: 'movieId', 
        as: 'movie' 
    });

    // Movie has many active sessions
    Movie.hasMany(ActiveSession, { 
        foreignKey: 'movieId', 
        as: 'activeSessions',
        onDelete: 'CASCADE' 
    });
    ActiveSession.belongsTo(Movie, { 
        foreignKey: 'movieId', 
        as: 'movie' 
    });
};

export {
    sequelize,
    testConnection,
    initDatabase,
    setupAssociations
};