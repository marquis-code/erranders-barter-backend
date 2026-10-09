const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const uri = "mongodb+srv://abahmarquis_db_user:RnmGsoHqJxPOnoFH@erranders-barter.gkrvfwj.mongodb.net/?appName=erranders-barter";

async function seed() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  const usersCollection = db.collection('users');
  const itemsCollection = db.collection('items');

  // Clear existing users and items that we are about to create, if any (optional)
  await usersCollection.deleteMany({ email: { $in: ['testuser1@example.com', 'testuser2@example.com'] } });

  const passwordHash = await bcrypt.hash('password123', 12);

  const user1 = {
    firstName: 'Alice',
    lastName: 'Test',
    email: 'testuser1@example.com',
    password: passwordHash,
    isVerified: true,
    university: 'Unilag',
    hostel: 'Moremi',
    level: '300',
    rating: 4.8,
    totalTrades: 12,
    walletBalance: 15000,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const user2 = {
    firstName: 'Bob',
    lastName: 'Test',
    email: 'testuser2@example.com',
    password: passwordHash,
    isVerified: true,
    university: 'Unilag',
    hostel: 'Jaja',
    level: '200',
    rating: 4.5,
    totalTrades: 8,
    walletBalance: 5000,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const res1 = await usersCollection.insertOne(user1);
  const res2 = await usersCollection.insertOne(user2);

  const u1Id = res1.insertedId;
  const u2Id = res2.insertedId;

  // Cleanup old seed items just in case
  await itemsCollection.deleteMany({ sellerId: { $in: [u1Id, u2Id] } });

  const items = [
    {
      sellerId: u1Id,
      title: 'Haier Thermocool Mini Fridge',
      description: 'Used mini fridge. Perfect for hostel rooms. Very cold!',
      price: 45000,
      type: 'sell',
      status: 'active',
      location: 'Moremi Hall, Unilag',
      category: 'Appliances',
      images: ['https://picsum.photos/400/300?random=1'],
      videos: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      sellerId: u1Id,
      title: 'Portable Rechargeable Fan',
      description: 'Swap my reading fan for a good power bank.',
      swapPreference: '20000mAh Power Bank (Oraimo or Xiaomi)',
      type: 'swap',
      status: 'active',
      location: 'Moremi Hall, Unilag',
      category: 'Electronics',
      images: ['https://picsum.photos/400/300?random=2'],
      videos: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      sellerId: u1Id,
      title: 'Medical Biochemistry Textbook',
      description: 'Barely used. Selling off because I just finished the course.',
      price: 5000,
      type: 'sell',
      status: 'active',
      location: 'Moremi Hall, Unilag',
      category: 'Books',
      images: ['https://picsum.photos/400/300?random=3'],
      videos: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      sellerId: u2Id,
      title: 'Electric Hot Plate (Single Burner)',
      description: 'Working perfectly. Great for quick cooking in the hostel.',
      price: 8000,
      type: 'sell',
      status: 'active',
      location: 'Jaja Hall, Unilag',
      category: 'Appliances',
      images: ['https://picsum.photos/400/300?random=4'],
      videos: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      sellerId: u2Id,
      title: 'Moufia 6x4 Student Mattress',
      description: 'Swap my student mattress for a good reading chair.',
      swapPreference: 'Ergonomic Reading Chair',
      type: 'swap',
      status: 'active',
      location: 'Jaja Hall, Unilag',
      category: 'Furniture',
      images: ['https://picsum.photos/400/300?random=5'],
      videos: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      sellerId: u2Id,
      title: 'LED Reading Lamp (Rechargeable)',
      description: 'Very bright and lasts up to 6 hours on a full charge. Great for TDB (Till Day Break) reading.',
      price: 3500,
      type: 'sell',
      status: 'active',
      location: 'Jaja Hall, Unilag',
      category: 'Electronics',
      images: ['https://picsum.photos/400/300?random=6'],
      videos: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  await itemsCollection.insertMany(items);

  console.log('Seed completed successfully.');
  await client.close();
}

seed().catch(console.error);
