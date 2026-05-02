const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('--- USER DATA IN MONGODB ---');
    
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    
    if (users.length === 0) {
      console.log('No users found in database.');
    } else {
      console.table(users.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        phone: u.phone || 'N/A'
      })));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error fetching users:', error);
    process.exit(1);
  }
};

checkUsers();
