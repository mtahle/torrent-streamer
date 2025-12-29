import { sequelize, testConnection, initDatabase } from './config/database.js';
import Movie from './models/Movie.js';
import WatchHistory from './models/WatchHistory.js';
import Bookmark from './models/Bookmark.js';
import ActiveSession from './models/ActiveSession.js';

// Database utilities for common operations
class DatabaseUtils {
    
    // Initialize database connection and models
    static async initialize() {
        try {
            console.log('🔄 Initializing database...');
            
            // Test connection
            const connected = await testConnection();
            if (!connected) {
                throw new Error('Database connection failed');
            }
            
            // Initialize models and sync
            await initDatabase();
            
            console.log('✅ Database initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Database initialization failed:', error.message);
            throw error;
        }
    }
    
    // Movie operations
    static async addMovie(movieData) {
        try {
            // Extract infoHash from magnetUri for deduplication
            const infoHashMatch = movieData.magnetUri?.match(/btih:([a-f0-9]{40})/i);
            const infoHash = infoHashMatch ? infoHashMatch[1].toLowerCase() : null;
            
            // Check if movie already exists by infoHash first, then magnet URI
            let existingMovie = null;
            if (infoHash) {
                existingMovie = await Movie.findOne({
                    where: { infoHash }
                });
            }
            if (!existingMovie) {
                existingMovie = await Movie.findOne({
                    where: { magnetUri: movieData.magnetUri }
                });
            }
            
            if (existingMovie) {
                console.log('📋 Movie already exists:', existingMovie.title);
                return existingMovie;
            }
            
            // Create new movie
            const movie = await Movie.create(movieData);
            console.log('➕ Added movie:', movie.title);
            return movie;
        } catch (error) {
            console.error('❌ Error adding movie:', error.message);
            throw error;
        }
    }
    
    static async updateMovieStatus(movieId, status, additionalData = {}) {
        try {
            const movie = await Movie.findByPk(movieId);
            if (!movie) {
                throw new Error(`Movie with ID ${movieId} not found`);
            }
            
            console.log('🔍 Updating movie with:', { status, ...additionalData });
            await movie.update({ status, ...additionalData });
            console.log(`📊 Updated movie ${movie.title} status to: ${status}`);
            return movie;
        } catch (error) {
            console.error('❌ Error updating movie status:', error.message);
            if (error.errors) {
                error.errors.forEach(err => {
                    console.error(`  - Field: ${err.path}, Value: ${err.value}, Message: ${err.message}`);
                });
            }
            throw error;
        }
    }
    
    static async updateMovieProgress(movieId, progress) {
        try {
            const movie = await Movie.findByPk(movieId);
            if (!movie) {
                throw new Error(`Movie with ID ${movieId} not found`);
            }
            
            await movie.updateProgress(progress);
            return movie;
        } catch (error) {
            console.error('❌ Error updating movie progress:', error.message);
            throw error;
        }
    }
    
    // Watch history operations
    static async createWatchSession(movieId, sessionData = {}) {
        try {
            const session = await WatchHistory.createSession(movieId, sessionData);
            console.log(`▶️ Created watch session for movie ID: ${movieId}`);
            return session;
        } catch (error) {
            console.error('❌ Error creating watch session:', error.message);
            throw error;
        }
    }
    
    static async updateWatchProgress(sessionId, currentTime, duration) {
        try {
            const session = await WatchHistory.findOne({
                where: { sessionId }
            });
            
            if (!session) {
                throw new Error(`Watch session ${sessionId} not found`);
            }
            
            await session.updateProgress(currentTime, duration);
            
            // Also update the movie's last watched time
            const movie = await Movie.findByPk(session.movieId);
            if (movie) {
                await movie.markAsWatched();
            }
            
            return session;
        } catch (error) {
            console.error('❌ Error updating watch progress:', error.message);
            throw error;
        }
    }
    
    // Bookmark operations
    static async toggleBookmark(movieId, bookmarkData = {}) {
        try {
            const [bookmark, created] = await Bookmark.findOrCreateForMovie(movieId, bookmarkData);
            
            if (!created) {
                // Toggle existing bookmark
                await bookmark.destroy();
                console.log(`🔖 Removed bookmark for movie ID: ${movieId}`);
                return null;
            } else {
                console.log(`⭐ Added bookmark for movie ID: ${movieId}`);
                return bookmark;
            }
        } catch (error) {
            console.error('❌ Error toggling bookmark:', error.message);
            throw error;
        }
    }
    
    // Active session operations
    static async createActiveSession(movieId, sessionData = {}) {
        try {
            // Clean up any existing stale sessions for this movie
            await ActiveSession.cleanupStale(5);
            
            const session = await ActiveSession.createSession(movieId, sessionData);
            console.log(`🎬 Created active session: ${session.sessionId}`);
            return session;
        } catch (error) {
            console.error('❌ Error creating active session:', error.message);
            throw error;
        }
    }
    
    static async updateActiveSession(sessionId, playbackData) {
        try {
            const session = await ActiveSession.getSessionById(sessionId);
            if (!session) {
                throw new Error(`Active session ${sessionId} not found`);
            }
            
            await session.updatePlayback(playbackData);
            return session;
        } catch (error) {
            console.error('❌ Error updating active session:', error.message);
            throw error;
        }
    }
    
    static async endActiveSession(sessionId) {
        try {
            const session = await ActiveSession.getSessionById(sessionId);
            if (!session) {
                console.log(`ℹ️ Session ${sessionId} not found (may have already ended)`);
                return null;
            }
            
            await session.endSession();
            console.log(`🛑 Ended active session: ${sessionId}`);
            return session;
        } catch (error) {
            console.error('❌ Error ending active session:', error.message);
            throw error;
        }
    }
    
    // Dashboard and stats operations
    static async getDashboardStats() {
        try {
            const [
                totalMovies,
                readyMovies,
                downloadingMovies,
                totalBookmarks,
                activeSessions,
                recentlyWatched
            ] = await Promise.all([
                Movie.count(),
                Movie.count({ where: { status: 'ready' } }),
                Movie.count({ where: { status: 'downloading' } }),
                Bookmark.count(),
                ActiveSession.getActiveSessions(),
                Movie.getRecentlyWatched(5)
            ]);
            
            return {
                movies: {
                    total: totalMovies,
                    ready: readyMovies,
                    downloading: downloadingMovies
                },
                bookmarks: totalBookmarks,
                activeSessions: activeSessions.length,
                recentlyWatched
            };
        } catch (error) {
            console.error('❌ Error getting dashboard stats:', error.message);
            throw error;
        }
    }
    
    // Cleanup operations
    static async cleanupDatabase() {
        try {
            console.log('🧹 Cleaning up database...');
            
            // Clean up stale active sessions
            const cleanedSessions = await ActiveSession.cleanupStale(10);
            console.log(`🗑️ Cleaned up ${cleanedSessions} stale sessions`);
            
            // You can add more cleanup operations here
            
            return {
                cleanedSessions
            };
        } catch (error) {
            console.error('❌ Error during database cleanup:', error.message);
            throw error;
        }
    }
    
    // Health check
    static async healthCheck() {
        try {
            await sequelize.authenticate();
            const stats = await this.getDashboardStats();
            
            return {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                stats
            };
        } catch (error) {
            return {
                status: 'error',
                timestamp: new Date().toISOString(),
                error: error.message
            };
        }
    }
}

export {
    DatabaseUtils,
    sequelize
};

export const models = {
    Movie,
    WatchHistory,
    Bookmark,
    ActiveSession
};