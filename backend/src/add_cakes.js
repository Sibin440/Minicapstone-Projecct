require('dotenv').config();
const connectDB = require('./config/db');
const Category = require('./models/Category');
const Product = require('./models/Product');

async function addCakes() {
  await connectDB();

  let cakesCat = await Category.findOne({ slug: 'cakes' });
  if (!cakesCat) {
    cakesCat = await Category.create({
      name: 'Cakes',
      slug: 'cakes',
      description: 'Premium bakery cakes with traditional flavours',
      image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
      icon: '🎂',
      display_order: 3
    });
  }

  const cakesItems = [
    {
      name: 'Black Piece Cake',
      image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop',
      description: 'Rich dark chocolate slice cake loaded with cocoa fudge.',
      base_price: 350,
      weights: [{ weight: '500 gms', price: 350 }, { weight: '1 kg', price: 680 }],
      is_bestseller: 1
    },
    {
      name: 'Chocolate Cake',
      image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
      description: 'Classic rich moist chocolate cake iced with silky ganache.',
      base_price: 450,
      weights: [{ weight: '500 gms', price: 450 }, { weight: '1 kg', price: 850 }],
      is_bestseller: 1
    },
    {
      name: 'Black Forest Cake',
      image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaeKAN4S5VyGoi_MebdwZgDNXOF6g8m7FZdI3V7T6oPA&s=10',
      description: 'Traditional German Black Forest cake with fresh cream and cherries.',
      base_price: 499,
      weights: [{ weight: '500 gms', price: 499 }, { weight: '1 kg', price: 950 }],
      is_offer: 1
    },
    {
      name: 'Strawberry Truffle Cake',
      image_url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&h=500&fit=crop',
      description: 'Luscious strawberry truffle cake with fresh berry glaze.',
      base_price: 520,
      weights: [{ weight: '500 gms', price: 520 }, { weight: '1 kg', price: 990 }],
      is_new: 1
    }
  ];

  for (const item of cakesItems) {
    const slugName = item.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    let existing = await Product.findOne({ name: { $regex: new RegExp('^' + item.name + '$', 'i') } });

    if (existing) {
      existing.image_url = item.image_url;
      existing.category_id = cakesCat._id;
      existing.description = item.description;
      existing.base_price = item.base_price;
      existing.is_active = 1;
      if (item.weights) existing.weights = item.weights;
      await existing.save();
      console.log(`🔄 Updated existing Cakes product: ${existing.name} (ID: ${existing._id})`);
    } else {
      const created = await Product.create({
        ...item,
        slug: slugName + '-' + Date.now(),
        category_id: cakesCat._id,
        is_active: 1,
        stock_qty: 30,
        low_stock_threshold: 10
      });
      console.log(`✅ Created new Cakes product: ${created.name} (ID: ${created._id})`);
    }
  }

  process.exit(0);
}

addCakes().catch(err => {
  console.error('Error adding cakes:', err);
  process.exit(1);
});
