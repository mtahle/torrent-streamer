// Simple DB test script for development
const { DatabaseUtils, models } = require('./database');

async function testDB() {
  try {
    console.log('🔄 Initializing database...');
    await DatabaseUtils.initialize();

    // Add a test movie
    const movie = await DatabaseUtils.addMovie({
      magnetUri: 'magnet:?xt=urn:btih:TESTMAGNET1234567890',
      title: 'Test Movie',
      quality: '1080p',
      year: 2025,
      status: 'ready'
    });
    console.log('✅ Movie added:', movie.title, movie.id);

    // Create a watch session
    const session = await DatabaseUtils.createActiveSession(movie.id, {
      userAgent: 'TestAgent',
      ipAddress: '127.0.0.1',
      platform: 'test'
    });
    console.log('✅ Session created:', session.sessionId);

    // Update progress
    await DatabaseUtils.updateActiveSession(session.sessionId, {
      currentTime: 120,
      duration: 3600,
      status: 'playing'
    });
    console.log('✅ Progress updated');

    // Toggle bookmark
    const bookmark = await DatabaseUtils.toggleBookmark(movie.id, {
      notes: 'Test bookmark',
      category: 'test'
    });
    console.log('✅ Bookmark toggled:', !!bookmark);

    // Get dashboard stats
    const stats = await DatabaseUtils.getDashboardStats();
    console.log('📊 Dashboard stats:', stats);

    // Health check
    const health = await DatabaseUtils.healthCheck();
    console.log('🔧 Health check:', health);

    console.log('🎉 DB test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ DB test failed:', error.message);
    process.exit(1);
  }
}

testDB();
