import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getDatabase } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const setupDatabase = async () => {
  try {
    const db = getDatabase();

    console.log('Reading schema file...');
    const schemaSQL = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');

    // Split by semicolons and execute each statement
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`Executing ${statements.length} SQL statements...`);

    for (const statement of statements) {
      await db.query(statement);
    }

    console.log('✓ Database schema created successfully');

  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  }
};

export const seedDatabase = async () => {
  try {
    const db = getDatabase();

    console.log('Reading seed file...');
    const seedSQL = readFileSync(join(__dirname, 'seed.sql'), 'utf-8');

    const statements = seedSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`Executing ${statements.length} seed statements...`);

    for (const statement of statements) {
      try {
        await db.query(statement);
      } catch (error: any) {
        // Ignore duplicate entry errors during seeding
        if (!error.message.includes('Duplicate entry')) {
          throw error;
        }
      }
    }

    console.log('✓ Database seeded successfully');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

// CLI runner
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];

  (async () => {
    const { connectDatabase } = await import('../config/database.js');
    await connectDatabase();

    if (command === 'setup' || command === 'schema') {
      await setupDatabase();
    } else if (command === 'seed') {
      await seedDatabase();
    } else if (command === 'reset') {
      await setupDatabase();
      await seedDatabase();
    } else {
      console.log('Usage: tsx src/database/setup.ts [setup|seed|reset]');
      console.log('  setup  - Create database schema');
      console.log('  seed   - Insert sample data');
      console.log('  reset  - Run both setup and seed');
    }

    process.exit(0);
  })();
}
