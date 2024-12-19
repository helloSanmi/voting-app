const bcrypt = require('bcryptjs');

const password = 'password123'; // or your chosen admin password
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) throw err;
  console.log('Hashed password:', hash);
});
