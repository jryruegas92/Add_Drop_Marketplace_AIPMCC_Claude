import pool from '../config/database';
import bcrypt from 'bcrypt';

async function seedDatabase() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('Starting database seeding...');

    // Seed Classes
    const classesData = [
      { code: 'MBA201', title: 'Microeconomic Analysis for Business Decisions', professor: 'Prof. Smith', semester: 'Spring 2025' },
      { code: 'MBA203', title: 'Introduction to Finance', professor: 'Prof. Johnson', semester: 'Spring 2025' },
      { code: 'MBA205', title: 'Leading People', professor: 'Prof. Williams', semester: 'Spring 2025' },
      { code: 'MBA209', title: 'Data and Decisions', professor: 'Prof. Brown', semester: 'Spring 2025' },
      { code: 'MBA211', title: 'Marketing Management', professor: 'Prof. Davis', semester: 'Spring 2025' },
      { code: 'MBA213', title: 'Corporate Financial Reporting and Analysis', professor: 'Prof. Miller', semester: 'Spring 2025' },
      { code: 'MBA215', title: 'Macroeconomics in the Global Economy', professor: 'Prof. Wilson', semester: 'Spring 2025' },
      { code: 'MBA220', title: 'Strategic Leadership', professor: 'Prof. Moore', semester: 'Spring 2025' },
      { code: 'MBA221', title: 'Problem Finding Problem Solving', professor: 'Prof. Taylor', semester: 'Spring 2025' },
      { code: 'MBA223', title: 'Negotiations', professor: 'Prof. Anderson', semester: 'Spring 2025' },
      { code: 'MBA230', title: 'Power and Politics in Organizations', professor: 'Prof. Thomas', semester: 'Spring 2025' },
      { code: 'MBA237', title: 'Entrepreneurship', professor: 'Prof. Jackson', semester: 'Spring 2025' },
      { code: 'MBA239', title: 'Corporate Strategy', professor: 'Prof. White', semester: 'Spring 2025' },
      { code: 'MBA240', title: 'Operations Management', professor: 'Prof. Harris', semester: 'Spring 2025' },
      { code: 'MBA242', title: 'Applied Innovation', professor: 'Prof. Martin', semester: 'Spring 2025' },
      { code: 'MBA243', title: 'Financial Management', professor: 'Prof. Thompson', semester: 'Spring 2025' },
      { code: 'MBA251', title: 'Investment Management', professor: 'Prof. Garcia', semester: 'Spring 2025' },
      { code: 'MBA252', title: 'Real Estate Finance and Investments', professor: 'Prof. Martinez', semester: 'Spring 2025' },
      { code: 'MBA254', title: 'Venture Capital and Private Equity', professor: 'Prof. Robinson', semester: 'Spring 2025' },
      { code: 'MBA255', title: 'Corporate Financial Strategy', professor: 'Prof. Clark', semester: 'Spring 2025' },
    ];

    console.log('Seeding classes...');
    for (const classData of classesData) {
      await client.query(
        'INSERT INTO classes (code, title, professor, semester) VALUES ($1, $2, $3, $4) ON CONFLICT (code) DO NOTHING',
        [classData.code, classData.title, classData.professor, classData.semester]
      );
    }
    console.log(`✓ Seeded ${classesData.length} classes`);

    // Seed Users
    const password = await bcrypt.hash('Password123!', 10);
    const usersData = [
      { email: 'alice.chen@haas.berkeley.edu', name: 'Alice Chen', graduation_year: 2025, program_type: 'FTMBA', phone: '510-555-0101' },
      { email: 'bob.smith@berkeley.edu', name: 'Bob Smith', graduation_year: 2025, program_type: 'EWMBA', phone: '510-555-0102' },
      { email: 'carol.jones@haas.berkeley.edu', name: 'Carol Jones', graduation_year: 2026, program_type: 'FTMBA', phone: '510-555-0103' },
      { email: 'david.kim@berkeley.edu', name: 'David Kim', graduation_year: 2025, program_type: 'FTMBA', phone: '510-555-0104' },
      { email: 'emma.wilson@haas.berkeley.edu', name: 'Emma Wilson', graduation_year: 2026, program_type: 'EWMBA', phone: '510-555-0105' },
    ];

    console.log('Seeding users...');
    const userIds: number[] = [];
    for (const userData of usersData) {
      const result = await client.query(
        'INSERT INTO users (email, password_hash, name, graduation_year, program_type, phone, contact_visible) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name RETURNING id',
        [userData.email, password, userData.name, userData.graduation_year, userData.program_type, userData.phone, false]
      );
      userIds.push(result.rows[0].id);
    }
    console.log(`✓ Seeded ${usersData.length} users (password: Password123!)`);

    // Get class IDs for seeding enrollments
    const classesResult = await client.query('SELECT id, code FROM classes ORDER BY id LIMIT 20');
    const classIds = classesResult.rows.map((row: { id: number }) => row.id);

    // Seed Enrolled Classes - assign random classes to users
    console.log('Seeding enrolled classes...');
    let enrollmentCount = 0;
    for (const userId of userIds) {
      // Each user gets 3-5 random classes
      const numClasses = Math.floor(Math.random() * 3) + 3;
      const selectedClasses = [...classIds].sort(() => 0.5 - Math.random()).slice(0, numClasses);

      for (const classId of selectedClasses) {
        await client.query(
          'INSERT INTO enrolled_classes (user_id, class_id) VALUES ($1, $2) ON CONFLICT (user_id, class_id) DO NOTHING',
          [userId, classId]
        );
        enrollmentCount++;
      }
    }
    console.log(`✓ Seeded ${enrollmentCount} class enrollments`);

    // Seed Sample Posts
    console.log('Seeding sample posts...');
    const postsData = [
      {
        user_id: userIds[0],
        post_type: 'DROPPING_OPEN',
        class_dropping_id: classIds[0],
        notes: 'Willing to drop MBA201, open to offers for any finance or strategy class',
        timing: 'Can drop immediately during add/drop',
      },
      {
        user_id: userIds[1],
        post_type: 'DROPPING_TARGETED',
        class_dropping_id: classIds[1],
        class_wanted_id: classIds[4],
        notes: 'Looking to swap MBA203 for MBA211. Preferred timing is week 1 of add/drop.',
        timing: 'Week 1 of add/drop period',
      },
      {
        user_id: userIds[2],
        post_type: 'LOOKING_FOR',
        class_wanted_id: classIds[9],
        notes: 'Really need MBA223 (Negotiations). Can drop any of my enrolled classes in exchange.',
        timing: 'Flexible, anytime during add/drop',
      },
      {
        user_id: userIds[3],
        post_type: 'DROPPING_OPEN',
        class_dropping_id: classIds[3],
        notes: 'Have MBA209, will consider all offers',
        timing: 'Week 2 of add/drop',
      },
    ];

    for (const postData of postsData) {
      await client.query(
        'INSERT INTO posts (user_id, post_type, class_dropping_id, class_wanted_id, notes, timing, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [postData.user_id, postData.post_type, postData.class_dropping_id || null, postData.class_wanted_id || null, postData.notes, postData.timing, 'ACTIVE']
      );
    }
    console.log(`✓ Seeded ${postsData.length} sample posts`);

    await client.query('COMMIT');
    console.log('\n✓ Database seeding completed successfully!');
    console.log('\nTest credentials:');
    console.log('  Email: alice.chen@haas.berkeley.edu');
    console.log('  Password: Password123!');
    console.log('\n  (All seeded users have the same password)');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('✗ Seeding failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default seedDatabase;
