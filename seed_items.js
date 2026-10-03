const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://abahmarquis_db_user:RnmGsoHqJxPOnoFH@erranders-barter.gkrvfwj.mongodb.net/?appName=erranders-barter';

const ItemSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  description: String,
  price: Number,
  swapPreference: String,
  type: String,
  status: String,
  location: String,
  category: String,
  images: [String],
  videos: [String],
}, { timestamps: true });

const UserSchema = new mongoose.Schema({}, { strict: false });

const Item = mongoose.model('Item', ItemSchema);
const User = mongoose.model('User', UserSchema);

const studentItems = [
  {
    title: 'Fairly Used Mini Refrigerator',
    description: 'Perfect for hostel corner. Keeps drinks and food very cold. Selling because I am graduating.',
    price: 35000,
    type: 'sell',
    status: 'active',
    location: 'Zik Hall',
    category: 'appliances',
    images: ['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&q=80&w=800'],
  },
  {
    title: 'Gas Cylinder (6kg) + Camp Gas Burner',
    description: 'Almost new gas cylinder with a burner attached. Still has some gas in it.',
    price: 15000,
    type: 'sell',
    status: 'active',
    location: 'Mellamby Hall',
    category: 'appliances',
    images: ['https://images.unsplash.com/photo-1620023577317-a06626601b07?auto=format&fit=crop&q=80&w=800'],
  },
  {
    title: 'Engineering Mathematics Textbook (K.A Stroud)',
    description: '7th Edition. A must-have for all 100L and 200L engineering students. Swap with Engineering Drawing equipment or sell.',
    price: 10000,
    swapPreference: 'Engineering Drawing Board/T-Square',
    type: 'swap',
    status: 'active',
    location: 'Awo Hall',
    category: 'books',
    images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800'],
  },
  {
    title: 'MacBook Pro 2015 (Retina)',
    description: '8GB RAM, 256GB SSD. Good battery life. A few scratches but works perfectly for coding and school work.',
    price: 180000,
    type: 'sell',
    status: 'active',
    location: 'Idia Hall',
    category: 'electronics',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800'],
  },
  {
    title: 'PS4 Controller (DualShock 4)',
    description: 'Original PS4 controller. Analog sticks are in perfect condition.',
    price: 12000,
    swapPreference: 'FIFA 23 Disc',
    type: 'swap',
    status: 'active',
    location: 'Independence Hall',
    category: 'electronics',
    images: ['https://images.unsplash.com/photo-1526509867162-5b0c0d1b4b33?auto=format&fit=crop&q=80&w=800'],
  },
  {
    title: 'Standing Fan (Ox 18 Inches)',
    description: 'Very strong breeze, perfect for dry season in the hostel.',
    price: 18000,
    type: 'sell',
    status: 'active',
    location: 'Tedder Hall',
    category: 'appliances',
    images: ['https://images.unsplash.com/photo-1616788289417-0ec997a9f73f?auto=format&fit=crop&q=80&w=800'],
  },
  {
    title: 'Reading Lamp (Rechargeable)',
    description: 'Lasts for 6 hours after power goes off. Bright LED light for night reading.',
    price: 4500,
    type: 'sell',
    status: 'active',
    location: 'Queen Idia Hall',
    category: 'electronics',
    images: ['https://images.unsplash.com/photo-1507369512168-9b7ed6cfce4a?auto=format&fit=crop&q=80&w=800'],
  },
  {
    title: 'Anatomy Textbooks (BD Chaurasia - All Volumes)',
    description: 'Complete set of BD Chaurasia. Clean pages, barely used.',
    price: 25000,
    type: 'sell',
    status: 'active',
    location: 'Alexander Brown Hall',
    category: 'books',
    images: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800'],
  },
  {
    title: 'Wireless Bluetooth Earbuds',
    description: 'Noise cancellation, great bass. Selling because I bought AirPods.',
    price: 8000,
    type: 'sell',
    status: 'active',
    location: 'Zik Hall',
    category: 'electronics',
    images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800'],
  },
  {
    title: 'Hostel Mattress (Vitafoam)',
    description: 'Student size mattress. Still very firm and clean.',
    price: 12000,
    type: 'sell',
    status: 'active',
    location: 'Bello Hall',
    category: 'furniture',
    images: ['https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&q=80&w=800'],
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    
    // Find an existing user to use as seller
    let user = await User.findOne();
    if (!user) {
       console.log('No users found. Creating a dummy student user...');
       user = await User.create({
         email: 'student@example.com',
         firstName: 'Student',
         lastName: 'Seller',
         password: 'dummy'
       });
    }

    console.log(`Using seller ID: ${user._id}`);
    
    const itemsToInsert = studentItems.map(item => ({
      ...item,
      sellerId: user._id
    }));

    await Item.insertMany(itemsToInsert);
    console.log(`Successfully seeded ${itemsToInsert.length} hostel items!`);
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.disconnect();
  }
}

seed();
