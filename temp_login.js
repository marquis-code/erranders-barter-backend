const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema, 'users');

async function run() {
  await mongoose.connect('mongodb+srv://abahmarquis_db_user:RnmGsoHqJxPOnoFH@erranders-barter.gkrvfwj.mongodb.net/?appName=erranders-barter');
  let user = await User.findOne({ email: /mariamomotayo915/i });
  console.log("Found user:", user);
  process.exit(0);
}
run();
