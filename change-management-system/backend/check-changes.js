import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'RLSroot999',
  database: 'change_management',
});

async function check() {
  try {
    const [rows] = await pool.execute('SELECT * FROM change_requests');
    console.log('Change requests in database:', JSON.stringify(rows, null, 2));
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

check();
