require('dotenv').config();
const connectDB = require('./config/db');
const Category = require('./models/Category');
const Product = require('./models/Product');

async function addSweets() {
  await connectDB();
  
  let sweetsCat = await Category.findOne({ slug: 'sweets' });
  if (!sweetsCat) {
    sweetsCat = await Category.create({
      name: 'Sweets',
      slug: 'sweets',
      description: 'Traditional Indian sweets made with pure ingredients',
      image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&h=300&fit=crop',
      icon: '🍮',
      display_order: 1
    });
  }

  const sweetsItems = [
    {
      name: 'Ras Malai',
      image_url: 'https://www.cookwithmanali.com/wp-content/uploads/2014/07/Rasmalai-Recipe-500x500.jpg',
      description: 'Soft cottage cheese patties soaked in saffron flavoured sweet milk.',
      base_price: 220,
      weights: [{ weight: '250 gms', price: 220 }, { weight: '500 gms', price: 420 }],
      is_bestseller: 1
    },
    {
      name: 'Gulab Jamun',
      image_url: 'https://t4.ftcdn.net/jpg/10/17/65/75/360_F_1017657553_BFjfgC9jaR5KFxJKfQZxVySUnYZ211bR.jpg',
      description: 'Soft, melt-in-mouth milk solids dumplings soaked in rose sugar syrup.',
      base_price: 196,
      weights: [{ weight: '250 gms', price: 196 }, { weight: '500 gms', price: 380 }],
      is_offer: 1
    },
    {
      name: 'Mysore Pak',
      image_url: 'https://www.shutterstock.com/image-photo/eyecatching-mysore-pak-sweet-cashews-260nw-2450626061.jpg',
      description: 'Rich ghee-roasted chickpea flour traditional South Indian sweet fudge.',
      base_price: 280,
      weights: [{ weight: '250 gms', price: 280 }, { weight: '500 gms', price: 540 }],
      is_bestseller: 1
    },
    {
      name: 'Rasgulla',
      image_url: 'https://media.istockphoto.com/id/1044082912/photo/indian-rasgulla-or-rosogulla-dessert-sweet-served-in-a-bowl-selective-focus.jpg?s=612x612&w=0&k=20&c=ESNkK4FnHDVE2r4-7XwZtPdSqCnZf22QeBKE',
      description: 'Spongy chhena balls cooked in fragrant sugar syrup.',
      base_price: 180,
      weights: [{ weight: '500 gms', price: 180 }, { weight: '1 kg', price: 340 }]
    }
  ];

  for (const item of sweetsItems) {
    const slugName = item.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    let existing = await Product.findOne({ name: { $regex: new RegExp('^' + item.name + '$', 'i') } });

    if (existing) {
      existing.image_url = item.image_url;
      existing.category_id = sweetsCat._id;
      existing.description = item.description;
      existing.base_price = item.base_price;
      existing.is_active = 1;
      if (item.weights) existing.weights = item.weights;
      await existing.save();
      console.log(`🔄 Updated existing Sweets product: ${existing.name} (ID: ${existing._id})`);
    } else {
      const created = await Product.create({
        ...item,
        slug: slugName + '-' + Date.now(),
        category_id: sweetsCat._id,
        is_active: 1,
        stock_qty: 30,
        low_stock_threshold: 10
      });
      console.log(`✅ Created new Sweets product: ${created.name} (ID: ${created._id})`);
    }
  }

  process.exit(0);
}

addSweets().catch(err => {
  console.error('Error adding sweets:', err);
  process.exit(1);
});
