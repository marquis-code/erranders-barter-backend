const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://abahmarquis_db_user:RnmGsoHqJxPOnoFH@erranders-barter.gkrvfwj.mongodb.net/?appName=erranders-barter';

async function check() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const items = await db.collection('items').find({}).toArray();
  console.log('Total items in DB:', items.length);
  if (items.length > 0) {
    console.log('Sample item:', items[0]);
  }
  process.exit(0);
}
check();
