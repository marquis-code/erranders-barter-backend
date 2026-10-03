const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: String,
  password: { type: String, select: false },
  firstName: String,
  lastName: String,
});
const User = mongoose.model('User2', userSchema, 'users');

const run = async () => {
  await mongoose.connect('mongodb+srv://abahmarquis_db_user:<db_password>@erranders-barter.gkrvfwj.mongodb.net/?appName=erranders-barter'.replace('<db_password>', 'RnmGsoHqJxPOnoFH'), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('Connected to DB');

  const password = await bcrypt.hash('password123', 12);
  
  await User.deleteMany({ email: { $in: ['admin@barter.com', 'support@barter.com'] } });
  
  await User.create({ email: 'admin@barter.com', password, firstName: 'Admin', lastName: 'User' });
  await User.create({ email: 'support@barter.com', password, firstName: 'Support', lastName: 'User' });

  console.log('Test users created: admin@barter.com and support@barter.com with password: password123');
  mongoose.disconnect();
};
run();
