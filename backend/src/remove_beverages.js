require('dotenv').config();
const connectDB = require('./config/db');
const Category = require('./models/Category');
const Product = require('./models/Product');

async function removeBeverages() {
  await connectDB();

  const bevCat = await Category.findOne({ $or: [{ slug: 'beverages' }, { name: /beverages/i }] });

  if (!bevCat) {
    console.log('⚠️ Beverages category not found in database.');
    process.exit(0);
  }

  const catId = bevCat._id;

  // Delete all products under Beverages
  const deletedProducts = await Product.deleteMany({ category_id: catId });
  console.log(`🗑️ Deleted ${deletedProducts.deletedCount} products under Beverages category.`);

  // Delete the category itself
  await Category.findByIdAndDelete(catId);
  console.log(`🗑️ Deleted Beverages category (${catId}).`);

  process.exit(0);
}

removeBeverages().catch(err => {
  console.error('Error removing Beverages:', err);
  process.exit(1);
});
