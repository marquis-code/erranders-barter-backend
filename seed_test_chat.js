const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function seed() {
  await mongoose.connect('mongodb+srv://abahmarquis_db_user:RnmGsoHqJxPOnoFH@erranders-barter.gkrvfwj.mongodb.net/?appName=erranders-barter');
  
  const UserSchema = new mongoose.Schema({
    email: String,
    passwordHash: String,
    firstName: String,
    lastName: String,
    authProvider: String,
  }, { strict: false });
  const User = mongoose.model('User', UserSchema);

  const ItemSchema = new mongoose.Schema({
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: String,
    description: String,
    price: Number,
    type: String,
    status: String,
    location: String,
    category: String,
    images: [String]
  }, { strict: false });
  const Item = mongoose.model('Item', ItemSchema);

  const passwordHash = await bcrypt.hash('password123', 10);

  // Create Seller
  const seller = new User({
    email: 'seller@example.com',
    passwordHash,
    firstName: 'Test',
    lastName: 'Seller',
    authProvider: 'email',
    isVerified: true,
  });
  await seller.save();

  // Create Buyer
  const buyer = new User({
    email: 'buyer@example.com',
    passwordHash,
    firstName: 'Test',
    lastName: 'Buyer',
    authProvider: 'email',
    isVerified: true,
  });
  await buyer.save();

  // Create Item for Seller
  const item = new Item({
    sellerId: seller._id,
    title: 'Test Swap Item (Used for Chat Test)',
    description: 'This is a test item for testing the chat flow.',
    price: 0,
    type: 'swap',
    status: 'active',
    location: 'Test Location',
    category: 'Electronics',
    images: ['https://via.placeholder.com/600']
  });
  await item.save();

  console.log(`Seller Login: seller@example.com / password123`);
  console.log(`Buyer Login: buyer@example.com / password123`);
  console.log(`Item ID: ${item._id}`);
  
  process.exit(0);
}
seed().catch(console.error);
