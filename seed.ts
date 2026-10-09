import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

// Note: Ensure ts-node is used or compile this to run
async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/barter-dev';
  await mongoose.connect(uri);

  const db = mongoose.connection.db;
  
  if (db) {
    try {
      await db.collection('users').drop();
    } catch(e) {}
    try {
      await db.collection('items').drop();
    } catch(e) {}
  }

  const saltOrRounds = 10;
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, saltOrRounds);

  const users = [
    {
      firstName: 'Bob',
      lastName: 'Buyer',
      email: 'buyer@barter.com',
      password: hashedPassword,
      isVerified: true,
      university: 'State University',
      avatar: 'https://ui-avatars.com/api/?name=Bob+Buyer',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      firstName: 'Sally',
      lastName: 'Seller',
      email: 'seller@barter.com',
      password: hashedPassword,
      isVerified: true,
      university: 'State University',
      avatar: 'https://ui-avatars.com/api/?name=Sally+Seller',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      firstName: 'Sam',
      lastName: 'Swapper',
      email: 'swapper@barter.com',
      password: hashedPassword,
      isVerified: true,
      university: 'State University',
      avatar: 'https://ui-avatars.com/api/?name=Sam+Swapper',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];

  const dbUsers = await mongoose.connection.collection('users').insertMany(users);
  
  const sellerId = Object.values(dbUsers.insertedIds)[1];
  const swapperId = Object.values(dbUsers.insertedIds)[2];

  const items = [
    {
      sellerId: sellerId,
      title: 'MacBook Pro M1',
      description: 'Gently used MacBook Pro for sale.',
      price: 900,
      type: 'sell',
      status: 'active',
      location: 'Campus Library',
      category: 'Electronics',
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      sellerId: swapperId,
      title: 'Sony Headphones',
      description: 'Looking to swap for a decent microphone.',
      swapPreference: 'Microphone',
      type: 'swap',
      status: 'active',
      location: 'Student Union',
      category: 'Electronics',
      images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb'],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];

  await mongoose.connection.collection('items').insertMany(items);

  console.log('Database seeded successfully!');
  console.log('Login credentials:');
  console.log('-----------------');
  console.log('Buyer:   buyer@barter.com   / password123');
  console.log('Seller:  seller@barter.com  / password123');
  console.log('Swapper: swapper@barter.com / password123');

  await mongoose.disconnect();
}

seed().catch(console.error);
