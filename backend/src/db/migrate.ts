import pool from '../config/database';

async function runMigrations() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create enum types
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE program_type AS ENUM ('MBA', 'EWMBA', 'FTMBA', 'BCMBA', 'MFE', 'MIDS', 'MENG', 'OTHER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE post_type AS ENUM ('DROPPING_OPEN', 'DROPPING_TARGETED', 'LOOKING_FOR');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE post_status AS ENUM ('ACTIVE', 'TRADE_AGREED', 'CLOSED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE offer_status AS ENUM ('PENDING', 'COUNTERED', 'ACCEPTED', 'REJECTED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        graduation_year INTEGER,
        program_type program_type,
        phone VARCHAR(20),
        contact_visible BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT valid_email CHECK (
          email ~* '^[A-Za-z0-9._%+-]+@(haas\.berkeley\.edu|berkeley\.edu)$'
        )
      );
    `);

    // Classes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS classes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        professor VARCHAR(255),
        semester VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Enrolled_Classes join table
    await client.query(`
      CREATE TABLE IF NOT EXISTS enrolled_classes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, class_id)
      );
    `);

    // Posts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        post_type post_type NOT NULL,
        class_dropping_id INTEGER REFERENCES classes(id),
        class_wanted_id INTEGER REFERENCES classes(id),
        notes TEXT,
        timing VARCHAR(255),
        status post_status DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT valid_dropping_open CHECK (
          post_type != 'DROPPING_OPEN' OR class_dropping_id IS NOT NULL
        ),
        CONSTRAINT valid_dropping_targeted CHECK (
          post_type != 'DROPPING_TARGETED' OR
          (class_dropping_id IS NOT NULL AND class_wanted_id IS NOT NULL)
        ),
        CONSTRAINT valid_looking_for CHECK (
          post_type != 'LOOKING_FOR' OR class_wanted_id IS NOT NULL
        )
      );
    `);

    // Offers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS offers (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        offerer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        parent_offer_id INTEGER REFERENCES offers(id),
        offered_class_ids INTEGER[] NOT NULL,
        message TEXT,
        status offer_status DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for better query performance
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_enrolled_classes_user ON enrolled_classes(user_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_enrolled_classes_class ON enrolled_classes(class_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(post_type);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_offers_post ON offers(post_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_offers_offerer ON offers(offerer_id);');

    // Create updated_at trigger function
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create triggers for updated_at
    await client.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
      CREATE TRIGGER update_posts_updated_at
        BEFORE UPDATE ON posts
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_offers_updated_at ON offers;
      CREATE TRIGGER update_offers_updated_at
        BEFORE UPDATE ON offers
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await client.query('COMMIT');
    console.log('✓ All migrations completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('✗ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default runMigrations;
