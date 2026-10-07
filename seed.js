const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGODB_URI = "mongodb+srv://abahmarquis_db_user:RnmGsoHqJxPOnoFH@erranders-barter.gkrvfwj.mongodb.net/?appName=erranders-barter";

const UserSchema = new mongoose.Schema({
  firstName: String, lastName: String, email: String, password: { type: String, select: false },
  isVerified: Boolean, whatsappNumber: String, university: String, avatar: String,
  hostel: String, level: String, rating: Number, totalTrades: Number
}, { timestamps: true });

const ItemSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String, description: String, price: Number, swapPreference: String,
  type: String, status: String, location: String, category: String, images: [String], videos: [String]
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Item = mongoose.model('Item', ItemSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB');

  const email = 'testseller@example.com';
  let seller = await User.findOne({ email });

  if (!seller) {
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);
    seller = new User({
      firstName: 'Test',
      lastName: 'Seller',
      email,
      password,
      isVerified: true,
      whatsappNumber: '08012345678',
      university: 'UNILAG',
      hostel: 'Moremi Hall',
      level: '400L',
      rating: 4.8,
      totalTrades: 12
    });
    await seller.save();
    console.log('Created test seller:', seller._id);
  } else {
    console.log('Test seller already exists:', seller._id);
  }

  // Create an item for this seller
  const item = new Item({
    sellerId: seller._id,
    title: 'iPhone 13 Pro Max - Used',
    description: 'Fairly used iPhone 13 Pro Max. 256GB. Battery health 89%. Selling to upgrade to 15.',
    price: 950000,
    type: 'sell',
    status: 'active',
    location: 'Moremi Hall, UNILAG',
    category: 'electronics',
    images: ['https://images.unsplash.com/photo-1632661674596-df8be070a5c5?q=80&w=600&auto=format&fit=crop']
  });
  await item.save();
  console.log('Created test item for seller:', item._id);

  mongoose.disconnect();
}

seed().catch(console.error);
