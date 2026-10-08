require('dotenv').config();
const connectDB = require('./config/db');
const Product = require('./models/Product');

async function updateRasgulla() {
  await connectDB();

  const newImageUrl = 'https://t4.ftcdn.net/jpg/07/73/90/29/360_F_773902918_jHscalEMos3NGkVDF05IhadxNf0nI1Ic.jpg';

  const res = await Product.updateMany(
    { name: { $regex: /rasgulla/i } },
    { $set: { image_url: newImageUrl } }
  );

  console.log(`✅ Updated ${res.modifiedCount} Rasgulla product(s) with new image URL.`);
  process.exit(0);
}

updateRasgulla().catch(err => {
  console.error('Error updating Rasgulla:', err);
  process.exit(1);
});
