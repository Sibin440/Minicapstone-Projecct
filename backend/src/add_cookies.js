require('dotenv').config();
const connectDB = require('./config/db');
const Category = require('./models/Category');
const Product = require('./models/Product');

async function addCookies() {
  await connectDB();

  let cookiesCat = await Category.findOne({ $or: [{ slug: 'cookies-biscuits' }, { slug: 'cookies' }, { name: /cookies/i }] });
  if (!cookiesCat) {
    cookiesCat = await Category.create({
      name: 'Cookies & Biscuits',
      slug: 'cookies-biscuits',
      description: 'Handcrafted cookies and biscuits',
      image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop',
      icon: '🍪',
      display_order: 5
    });
  }

  const cookiesItems = [
    {
      name: 'Butter Cookies',
      image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=500&fit=crop',
      description: 'Melt-in-mouth pure butter rich tea cookies.',
      base_price: 160,
      weights: [{ weight: '200 gms', price: 160 }, { weight: '500 gms', price: 370 }],
      is_bestseller: 1
    },
    {
      name: 'Chocolate Cookies',
      image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&h=500&fit=crop',
      description: 'Rich dark chocolate chunk crunchy cookies.',
      base_price: 180,
      weights: [{ weight: '200 gms', price: 180 }, { weight: '400 gms', price: 340 }],
      is_bestseller: 1
    },
    {
      name: 'Peanut Cookies',
      image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKv-Lu_LEy1scIG7dEPnGgrxGnCzjn1UHQI3tnRXVzbQ&s=10',
      description: 'Nutty roasted peanut butter crisp biscuits.',
      base_price: 150,
      weights: [{ weight: '200 gms', price: 150 }, { weight: '400 gms', price: 290 }],
      is_offer: 1
    },
    {
      name: 'Cheese Cookies',
      image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSv1E_oJ2N2qIsBv96fhixOWxAsHEINXnhZ4i_ZvElP8q4idXiKudUPVCxE&s=10',
      description: 'Savoury sweet cheddar cheese baked gourmet cookies.',
      base_price: 170,
      weights: [{ weight: '200 gms', price: 170 }, { weight: '400 gms', price: 320 }],
      is_new: 1
    }
  ];

  for (const item of cookiesItems) {
    const slugName = item.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    let existing = await Product.findOne({ name: { $regex: new RegExp('^' + item.name + '$', 'i') } });

    if (existing) {
      existing.image_url = item.image_url;
      existing.category_id = cookiesCat._id;
      existing.description = item.description;
      existing.base_price = item.base_price;
      existing.is_active = 1;
      if (item.weights) existing.weights = item.weights;
      await existing.save();
      console.log(`🔄 Updated existing Cookies product: ${existing.name} (ID: ${existing._id})`);
    } else {
      const created = await Product.create({
        ...item,
        slug: slugName + '-' + Date.now(),
        category_id: cookiesCat._id,
        is_active: 1,
        stock_qty: 30,
        low_stock_threshold: 10
      });
      console.log(`✅ Created new Cookies product: ${created.name} (ID: ${created._id})`);
    }
  }

  process.exit(0);
}

addCookies().catch(err => {
  console.error('Error adding cookies:', err);
  process.exit(1);
});
