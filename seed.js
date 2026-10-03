const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  price: Number,
  swapPreference: String,
  type: { type: String, enum: ['sell', 'swap', 'service'], default: 'sell' },
  status: { type: String, enum: ['active', 'pending', 'sold', 'completed'], default: 'active' },
  location: { type: String, required: true },
  category: String,
  images: [String],
  videos: [String],
}, { timestamps: true });

const Item = mongoose.model('Item', itemSchema);

const userSchema = new mongoose.Schema({
  email: String,
});
const User = mongoose.model('User', userSchema);

const seedDatabase = async () => {
  try {
    await mongoose.connect('mongodb+srv://abahmarquis_db_user:RnmGsoHqJxPOnoFH@erranders-barter.gkrvfwj.mongodb.net/?appName=erranders-barter', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    let user = await User.findOne();
    if (!user) {
      user = await User.create({ email: 'seeduser@example.com' });
    }

    const items = [
      {
        sellerId: user._id,
        title: 'iPhone 13 Pro',
        description: 'Excellent condition, 256GB, Sierra Blue.',
        price: 700,
        type: 'sell',
        location: 'New York, NY',
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1632661674596-df8be070a5c5?q=80&w=2000&auto=format&fit=crop'],
      },
      {
        sellerId: user._id,
        title: 'MacBook Air M1',
        description: 'Looking to swap for a gaming PC.',
        swapPreference: 'Gaming PC with RTX 3060 or better',
        type: 'swap',
        location: 'Austin, TX',
        category: 'Computers',
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=2000&auto=format&fit=crop'],
      },
      {
        sellerId: user._id,
        title: 'Plumbing Services',
        description: 'Experienced plumber for home repairs.',
        price: 50,
        type: 'service',
        location: 'Chicago, IL',
        category: 'Services',
        images: ['https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=2000&auto=format&fit=crop'],
      },
      {
        sellerId: user._id,
        title: 'Sony A7III Camera',
        description: 'Camera body only, lightly used.',
        price: 1200,
        type: 'sell',
        location: 'Seattle, WA',
        category: 'Photography',
        images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2000&auto=format&fit=crop'],
      }
    ];

    await Item.deleteMany({});
    await Item.insertMany(items);
    console.log('Database seeded with products!');

    mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.disconnect();
  }
};

seedDatabase();
