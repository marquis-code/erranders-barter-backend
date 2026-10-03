const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema, 'users');

async function run() {
  try {
    await mongoose.connect('mongodb+srv://abahmarquis_db_user:5HVCaoXQ92Kjcq9c@intentional.lvyfogc.mongodb.net/?appName=intentional');
    
    let user = await User.findOne({ email: /mariamomotayo915/i });
    if (user) {
      console.log('Found user:', user.email);
      const newPassword = 'TemporaryLogin123!';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });
      console.log(`Password reset for ${user.email} to: ${newPassword}`);
    } else {
      console.log('User not found.');
    }
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}
run();
