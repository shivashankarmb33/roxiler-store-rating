const bcrypt = require('bcryptjs');
const { pool } = require('./db');
const { initializeDatabase } = require('./initDb');

async function seed() {
  console.log('--- Starting Seed Process ---');
  await initializeDatabase();

  const connection = await pool.getConnection();
  try {
    // Check if admin already exists
    const [existingAdmins] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      ['admin@roxiler.com']
    );

    if (existingAdmins.length > 0) {
      console.log('Seed data already present. Skipping re-seed.');
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('Admin@123', salt);
    const ownerPasswordHash = await bcrypt.hash('Owner@123', salt);
    const userPasswordHash = await bcrypt.hash('User@1234', salt);

    // 1. Insert Users
    console.log('Creating seed users...');
    const users = [
      {
        name: 'System Administrator Root',
        email: 'admin@roxiler.com',
        password: adminPasswordHash,
        address: 'Suite 100, Tech Park Boulevard, Silicon Hills, CA',
        role_id: 1 // ADMIN
      },
      {
        name: 'Robert Michael Smith Owner',
        email: 'owner1@roxiler.com',
        password: ownerPasswordHash,
        address: '452 Market Street, Downtown Commercial District, NY',
        role_id: 3 // STORE_OWNER
      },
      {
        name: 'Samantha Jane Davies Owner',
        email: 'owner2@roxiler.com',
        password: ownerPasswordHash,
        address: '789 Grand Avenue, Metro Plaza, Suite 4B, Chicago, IL',
        role_id: 3 // STORE_OWNER
      },
      {
        name: 'Johnathan Edward Doe Normal',
        email: 'john.doe@example.com',
        password: userPasswordHash,
        address: '123 Pinecrest Way, Meadow Ridge Estates, Austin, TX',
        role_id: 2 // USER
      },
      {
        name: 'Emily Victoria Watson Normal',
        email: 'emily.watson@example.com',
        password: userPasswordHash,
        address: '88 Sunshine Lane, Silver Lake Community, Seattle, WA',
        role_id: 2 // USER
      },
      {
        name: 'Alexander Christopher Clark',
        email: 'alex.clark@example.com',
        password: userPasswordHash,
        address: '560 Oakridge Drive, Maplewood Heights, Denver, CO',
        role_id: 2 // USER
      }
    ];

    const insertedUsers = {};
    for (const u of users) {
      const [result] = await connection.query(
        'INSERT INTO users (name, email, password, address, role_id) VALUES (?, ?, ?, ?, ?)',
        [u.name, u.email, u.password, u.address, u.role_id]
      );
      insertedUsers[u.email] = result.insertId;
    }

    // 2. Insert Stores
    console.log('Creating seed stores...');
    const stores = [
      {
        name: 'Apex Electronics Superstore',
        email: 'contact@apexelectronics.com',
        address: '100 Innovation Parkway, Tech District, San Jose, CA',
        owner_id: insertedUsers['owner1@roxiler.com']
      },
      {
        name: 'Organic Harvest Food Market',
        email: 'hello@organicharvestmarket.com',
        address: '350 Green Valley Road, Eco Center, Portland, OR',
        owner_id: insertedUsers['owner2@roxiler.com']
      },
      {
        name: 'Urban Artisan Coffee Roasters',
        email: 'support@urbanartisancoffee.com',
        address: '712 Broadway Street, Cultural Quarter, Brooklyn, NY',
        owner_id: null
      }
    ];

    const insertedStores = [];
    for (const s of stores) {
      const [result] = await connection.query(
        'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
        [s.name, s.email, s.address, s.owner_id]
      );
      insertedStores.push(result.insertId);
    }

    // 3. Insert Ratings
    console.log('Creating seed ratings...');
    const ratings = [
      { user_id: insertedUsers['john.doe@example.com'], store_id: insertedStores[0], rating: 5 },
      { user_id: insertedUsers['emily.watson@example.com'], store_id: insertedStores[0], rating: 4 },
      { user_id: insertedUsers['alex.clark@example.com'], store_id: insertedStores[0], rating: 4 },
      { user_id: insertedUsers['john.doe@example.com'], store_id: insertedStores[1], rating: 3 },
      { user_id: insertedUsers['emily.watson@example.com'], store_id: insertedStores[1], rating: 5 },
      { user_id: insertedUsers['alex.clark@example.com'], store_id: insertedStores[2], rating: 5 }
    ];

    for (const r of ratings) {
      await connection.query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        [r.user_id, r.store_id, r.rating]
      );
    }

    console.log('✓ Seeding completed successfully!');
    console.log('\n--- Default Seed Accounts ---');
    console.log('Admin:       admin@roxiler.com       / Admin@123');
    console.log('Store Owner: owner1@roxiler.com      / Owner@123');
    console.log('Store Owner: owner2@roxiler.com      / Owner@123');
    console.log('Normal User: john.doe@example.com    / User@1234');
    console.log('Normal User: emily.watson@example.com / User@1234');
    console.log('-----------------------------\n');
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    connection.release();
    process.exit(0);
  }
}

if (require.main === module) {
  seed();
}

module.exports = { seed };

