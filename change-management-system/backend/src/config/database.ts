import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export const connectDatabase = async () => {
  try {
    const dbConfig: mysql.PoolOptions = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'change_management',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };

    // Skip SSL cert verification if needed (for production server)
    if (process.env.DB_HOST && process.env.DB_HOST !== 'localhost') {
      dbConfig.ssl = {
        rejectUnauthorized: false
      };
    }

    pool = mysql.createPool(dbConfig);

    // Test the connection
    const connection = await pool.getConnection();
    const environment = process.env.NODE_ENV || 'development';
    const dbHost = process.env.DB_HOST || 'localhost';
    console.log(`✅ MariaDB Connected [${environment}] - ${dbHost}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME}`);
    connection.release();
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
};

export const getDatabase = (): mysql.Pool => {
  if (!pool) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return pool;
};
