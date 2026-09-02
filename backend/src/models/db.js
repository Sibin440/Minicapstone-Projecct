const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

let state = {
  users: [],
  categories: [],
  products: [],
  product_weights: [],
  cart: [],
  cart_items: [],
  orders: [],
  order_items: [],
  addresses: [],
  coupons: [],
  wishlist: [],
  reviews: [],
  loyalty_points: [],
  loyalty_config: { earn_rate_per_100: 5 }
};

function loadState() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (fs.existsSync(DB_FILE)) {
    try {
      state = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      // Ensure all required arrays exist
      if (!state.users) state.users = [];
      if (!state.categories) state.categories = [];
      if (!state.products) state.products = [];
      if (!state.product_weights) state.product_weights = [];
      if (!state.cart) state.cart = [];
      if (!state.cart_items) state.cart_items = [];
      if (!state.orders) state.orders = [];
      if (!state.order_items) state.order_items = [];
      if (!state.addresses) state.addresses = [];
      if (!state.coupons) state.coupons = [];
      if (!state.wishlist) state.wishlist = [];
      if (!state.reviews) state.reviews = [];
      if (!state.loyalty_points) state.loyalty_points = [];
      if (!state.loyalty_config) state.loyalty_config = { earn_rate_per_100: 5 };

      // Ensure default stock_qty on products if missing and limit to 5 products per category
      const catCounts = {};
      const trimmedProducts = [];
      const keptIds = new Set();
      (state.products || []).forEach(p => {
        if (typeof p.stock_qty !== 'number') p.stock_qty = 30;
        if (typeof p.low_stock_threshold !== 'number') p.low_stock_threshold = 10;
        const cId = p.category_id;
        catCounts[cId] = (catCounts[cId] || 0) + 1;
        if (catCounts[cId] <= 5) {
          trimmedProducts.push(p);
          keptIds.add(p.id);
        }
      });
      state.products = trimmedProducts;
      state.product_weights = (state.product_weights || []).filter(w => keptIds.has(w.product_id));
      // Clean cart_items that reference products no longer in the catalog
      state.cart_items = (state.cart_items || []).filter(ci => keptIds.has(ci.product_id));

      // Ensure admin user exists
      let admin = (state.users || []).find(u => u.role === 'admin' || u.email === 'admin@svsbakery.com');
      if (!admin) {
        const hashed = bcrypt.hashSync('admin123', 10);
        state.users.push({
          id: 999,
          name: 'Bakery Admin',
          email: 'admin@svsbakery.com',
          phone: '9876543210',
          password: hashed,
          role: 'admin',
          created_at: new Date().toISOString()
        });
      }
      saveState();
    } catch (e) {
      console.error('Failed to load JSON database, re-initializing state');
    }
  }
}

function saveState() {
  fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf8');
}

function getState() {
  loadState();
  return state;
}


class QueryHelper {
  constructor(table) {
    this.table = table;
  }

  get(...args) {
    const list = this.all(...args);
    return list.length > 0 ? list[0] : null;
  }

  all(...params) {
    // Custom handling based on typical SQL patterns used in the controllers
    let items = state[this.table] ? [...state[this.table]] : [];
    return items;
  }

  run(...params) {
    return { lastInsertRowid: Date.now() };
  }
}

// In-memory / JSON store wrapper mimicking the simple API needed by controllers
const dbWrapper = {
  prepare: (sql) => {
    return {
      get: (...params) => {
        const str = sql.toLowerCase();
        if (str.includes('from users where id =')) return state.users.find(u => u.id === params[0]) || null;
        if (str.includes('from users where email =')) return state.users.find(u => u.email === params[0]) || null;
        if (str.includes('from categories where slug =')) return state.categories.find(c => c.slug === params[0] && c.is_active === 1) || null;
        if (str.includes('select count(*) as c from categories')) return { c: state.categories.length };
        if (str.includes('select count(*) as c from products where category_id')) {
          const count = state.products.filter(p => p.category_id === params[0] && p.is_active === 1).length;
          return { c: count };
        }
        if (str.includes('select count(*) as total from products')) {
          let list = state.products.filter(p => p.is_active === 1);
          return { total: list.length };
        }
        if (str.includes('from products p join categories')) {
          if (str.includes('where p.id =')) {
            const p = state.products.find(prod => prod.id === params[0] && prod.is_active === 1);
            if (!p) return null;
            const c = state.categories.find(cat => cat.id === p.category_id);
            return { ...p, category_name: c?.name, category_slug: c?.slug };
          }
          if (str.includes('where p.slug =')) {
            const p = state.products.find(prod => prod.slug === params[0] && prod.is_active === 1);
            if (!p) return null;
            const c = state.categories.find(cat => cat.id === p.category_id);
            return { ...p, category_name: c?.name, category_slug: c?.slug };
          }
        }
        if (str.includes('from products where id =')) return state.products.find(p => p.id === params[0]) || null;
        if (str.includes('from product_weights where id =')) return state.product_weights.find(w => w.id === params[0]) || null;
        if (str.includes('from cart where user_id =')) return state.cart.find(c => c.user_id === params[0]) || null;
        if (str.includes('from cart where id =')) return state.cart.find(c => c.id === params[0]) || null;
        if (str.includes('from coupons where code =')) return state.coupons.find(cp => cp.code.toUpperCase() === String(params[0]).toUpperCase() && cp.is_active === 1) || null;
        if (str.includes('from orders where id =')) return state.orders.find(o => o.id === params[0]) || null;
        if (str.includes('from addresses where id =')) return state.addresses.find(a => a.id === params[0]) || null;
        if (str.includes('from wishlist where user_id =')) return state.wishlist.find(w => w.user_id === params[0] && w.product_id === params[1]) || null;
        if (str.includes('from reviews where product_id =')) {
          const revs = state.reviews.filter(r => r.product_id === params[0]);
          const avg = revs.length ? revs.reduce((a,b) => a + b.rating, 0) / revs.length : 0;
          return { avg_rating: avg, avg, total: revs.length };
        }
        return null;
      },
      all: (...params) => {
        const str = sql.toLowerCase();
        if (str.includes('from categories')) {
          return state.categories.filter(c => c.is_active === 1).map(c => {
            const count = state.products.filter(p => p.category_id === c.id && p.is_active === 1).length;
            return { ...c, product_count: count };
          });
        }
        if (str.includes('from product_weights where product_id =')) {
          return state.product_weights.filter(w => w.product_id === params[0]).sort((a,b) => a.price - b.price);
        }
        if (str.includes('from products p join categories')) {
          let list = state.products.filter(p => p.is_active === 1).map(p => {
            const c = state.categories.find(cat => cat.id === p.category_id);
            return { ...p, category_name: c?.name, category_slug: c?.slug };
          });
          // search filter
          if (params.length > 0 && typeof params[0] === 'string' && params[0].startsWith('%')) {
            const q = params[0].replace(/%/g, '').toLowerCase();
            list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category_name?.toLowerCase().includes(q));
          }
          if (str.includes('is_bestseller = 1')) list = list.filter(p => p.is_bestseller === 1);
          if (str.includes('is_offer = 1')) list = list.filter(p => p.is_offer === 1);
          if (str.includes('is_new = 1')) list = list.filter(p => p.is_new === 1);
          return list;
        }
        if (str.includes('from cart_items')) {
          return state.cart_items.filter(ci => ci.cart_id === params[0]).map(ci => {
            const p = state.products.find(prod => prod.id === ci.product_id) || {};
            const pw = state.product_weights.find(w => w.id === ci.weight_id) || {};
            return {
              ...ci,
              name: p.name,
              image_url: p.image_url,
              is_pure_veg: p.is_pure_veg,
              discount_percent: p.discount_percent,
              weight: pw.weight,
              unit_price: pw.price || p.base_price,
              total_price: (pw.price || p.base_price) * ci.quantity
            };
          });
        }
        if (str.includes('from orders where user_id =')) {
          return state.orders.filter(o => o.user_id === params[0]).map(o => ({
            ...o,
            items: state.order_items.filter(oi => oi.order_id === o.id)
          })).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
        }
        if (str.includes('from order_items where order_id =')) {
          return state.order_items.filter(oi => oi.order_id === params[0]);
        }
        if (str.includes('from wishlist')) {
          return state.wishlist.filter(w => w.user_id === params[0]).map(w => {
            const p = state.products.find(prod => prod.id === w.product_id);
            const c = state.categories.find(cat => cat.id === p?.category_id);
            return { ...w, ...p, category_name: c?.name };
          });
        }
        if (str.includes('from addresses where user_id =')) {
          return state.addresses.filter(a => a.user_id === params[0]);
        }
        if (str.includes('from coupons')) {
          return state.coupons.filter(c => c.is_active === 1);
        }
        if (str.includes('from reviews')) {
          return state.reviews.filter(r => r.product_id === params[0]).map(r => {
            const u = state.users.find(usr => usr.id === r.user_id);
            return { ...r, user_name: u?.name || 'Anonymous' };
          });
        }
        return [];
      },
      run: (...params) => {
        const str = sql.toLowerCase();
        const id = Date.now() + Math.floor(Math.random() * 1000);
        if (str.includes('insert into users')) {
          state.users.push({ id, name: params[0], email: params[1], phone: params[2], password: params[3], role: 'customer', created_at: new Date().toISOString() });
        } else if (str.includes('insert into categories')) {
          state.categories.push({ id, name: params[0], slug: params[1], description: params[2], image_url: params[3], icon: params[4], display_order: params[5], is_active: 1 });
        } else if (str.includes('insert into products')) {
          state.products.push({ id, category_id: params[0], name: params[1], slug: params[2], description: params[3], image_url: params[4], base_price: params[5], discount_percent: params[6], is_bestseller: params[7], is_new: params[8], is_offer: params[9], rating: params[10], rating_count: params[11], is_pure_veg: 1, is_active: 1, created_at: new Date().toISOString() });
        } else if (str.includes('insert into product_weights')) {
          state.product_weights.push({ id, product_id: params[0], weight: params[1], price: params[2] });
        } else if (str.includes('insert into cart (user_id)')) {
          state.cart.push({ id, user_id: params[0], created_at: new Date().toISOString() });
        } else if (str.includes('insert into cart_items')) {
          state.cart_items.push({ id, cart_id: params[0], product_id: params[1], weight_id: params[2], quantity: params[3] });
        } else if (str.includes('update cart_items set quantity')) {
          const item = state.cart_items.find(ci => ci.id === params[1]);
          if (item) item.quantity = str.includes('quantity +') ? item.quantity + params[0] : params[0];
        } else if (str.includes('delete from cart_items')) {
          if (str.includes('where id =')) state.cart_items = state.cart_items.filter(ci => ci.id !== params[0]);
          else if (str.includes('where cart_id =')) state.cart_items = state.cart_items.filter(ci => ci.cart_id !== params[0]);
        } else if (str.includes('insert into orders')) {
          state.orders.push({ id, user_id: params[0], address_id: params[1], coupon_code: params[2], subtotal: params[3], discount_amount: params[4], delivery_charge: params[5], total: params[6], payment_method: params[7], delivery_slot: params[8], notes: params[9], order_status: 'placed', created_at: new Date().toISOString() });
        } else if (str.includes('insert into order_items')) {
          state.order_items.push({ id, order_id: params[0], product_id: params[1], product_name: params[2], weight: params[3], quantity: params[4], unit_price: params[5], total_price: params[6] });
        } else if (str.includes('insert into wishlist')) {
          const exists = state.wishlist.find(w => w.user_id === params[0] && w.product_id === params[1]);
          if (!exists) state.wishlist.push({ id, user_id: params[0], product_id: params[1], created_at: new Date().toISOString() });
        } else if (str.includes('delete from wishlist')) {
          state.wishlist = state.wishlist.filter(w => !(w.user_id === params[0] && w.product_id === params[1]));
        } else if (str.includes('insert into addresses')) {
          state.addresses.push({ id, user_id: params[0], name: params[1], phone: params[2], address_line1: params[3], address_line2: params[4], city: params[5], state: params[6], pincode: params[7], type: params[8], is_default: params[9] });
        } else if (str.includes('insert into reviews')) {
          state.reviews.push({ id, user_id: params[0], product_id: params[1], rating: params[2], title: params[3], body: params[4], created_at: new Date().toISOString() });
        } else if (str.includes('update users set name')) {
          const u = state.users.find(usr => usr.id === params[2]);
          if (u) { u.name = params[0]; u.phone = params[1]; }
        }
        saveState();
        return { lastInsertRowid: id };
      }
    };
  },
  transaction: (fn) => {
    return (...args) => fn(...args);
  }
};

function getDb() {
  loadState();
  return dbWrapper;
}

function seedDatabase() {
  if (state.categories.length > 0) return;
  console.log('🌱 Seeding database store...');

  const db = dbWrapper;
  const insertCat = db.prepare('INSERT INTO categories');
  const cats = [
    ['Sweets', 'sweets', 'Traditional Indian sweets made with pure ingredients', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&h=300&fit=crop', '🍮', 1],
    ['Savouries', 'savouries', 'Crispy and flavourful Indian savouries', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop', '🧆', 2],
    ['Cakes', 'cakes', 'Premium bakery cakes with traditional flavours', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop', '🎂', 3],
    ['Snacks', 'snacks', 'Authentic traditional Indian snacks', 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=300&fit=crop', '🥨', 4],
    ['Cookies & Biscuits', 'cookies-biscuits', 'Handcrafted cookies and biscuits', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop', '🍪', 5],
    ['Breads', 'breads', 'Freshly baked artisan breads', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop', '🍞', 6],
    ['Beverages', 'beverages', 'Premium drink mixes and blends', 'https://images.unsplash.com/photo-1561043433-aaf687c4cf04?w=400&h=300&fit=crop', '☕', 7],
  ];

  const catIds = {};
  for (const cat of cats) {
    const r = insertCat.run(...cat);
    catIds[cat[0]] = r.lastInsertRowid;
  }

  const insertProd = db.prepare('INSERT INTO products');
  const insertWeight = db.prepare('INSERT INTO product_weights');

  const products = [
    { cat: 'Sweets', name: 'Kaju Katli', slug: 'kaju-katli', desc: 'Smooth cashew fudge with ghee.', img: 'https://images.unsplash.com/photo-1624454002302-36b824d7bd0a?w=600&h=500&fit=crop', price: 321.43, disc: 0, best: 1, isnew: 0, offer: 0, rat: 4.8, rcount: 1240, weights: [['250 gms', 321.43], ['500 gms', 628.57], ['1000 gms', 1228.57]] },
    { cat: 'Sweets', name: 'Premium Kaju Kathily', slug: 'premium-kaju-kathily', desc: 'Premium diamond cashew sweet.', img: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&h=500&fit=crop', price: 380.95, disc: 5, best: 1, isnew: 0, offer: 0, rat: 4.9, rcount: 890, weights: [['250 gms', 380.95], ['500 gms', 742.86], ['1000 gms', 1457.14]] },
    { cat: 'Sweets', name: 'Mysore Pak', slug: 'mysore-pak', desc: 'Soft ghee Mysore Pak.', img: 'https://images.unsplash.com/photo-1563805042-7684c019e3cb?w=600&h=500&fit=crop', price: 228.57, disc: 0, best: 1, isnew: 0, offer: 0, rat: 4.7, rcount: 980, weights: [['250 gms', 228.57], ['500 gms', 447.62], ['1000 gms', 876.19]] },
    { cat: 'Sweets', name: 'Gulab Jamun', slug: 'gulab-jamun', desc: 'Soft jamuns in rose syrup.', img: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&h=500&fit=crop', price: 196.19, disc: 10, best: 0, isnew: 0, offer: 1, rat: 4.6, rcount: 1560, weights: [['250 gms', 196.19], ['500 gms', 380.95], ['1000 gms', 742.86]] },
    { cat: 'Cakes', name: 'Ajmeer Cake', slug: 'ajmeer-cake', desc: 'Traditional dense cake.', img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=500&fit=crop', price: 204.76, disc: 0, best: 1, isnew: 0, offer: 0, rat: 4.7, rcount: 760, weights: [['250 gms', 204.76], ['500 gms', 400.00], ['1000 gms', 780.95]] },
    { cat: 'Snacks', name: 'Athirasam', slug: 'athirasam', desc: 'Jaggery rice flour snack.', img: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=600&h=500&fit=crop', price: 204.76, disc: 0, best: 1, isnew: 0, offer: 0, rat: 4.6, rcount: 870, weights: [['250 gms', 204.76], ['500 gms', 400.00], ['1000 gms', 780.95]] }
  ];

  for (const p of products) {
    const catId = catIds[p.cat] || 1;
    const r = insertProd.run(catId, p.name, p.slug, p.desc, p.img, p.price, p.disc, p.best, p.isnew, p.offer, p.rat, p.rcount);
    for (const [w, price] of p.weights) {
      insertWeight.run(r.lastInsertRowid, w, price);
    }
  }

  state.coupons = [
    { id: 1, code: 'WELCOME10', description: '10% off first order', discount_type: 'percent', discount_value: 10, min_order_amount: 0, max_discount: 100, is_active: 1 },
    { id: 2, code: 'SWEET20', description: '20% off above Rs.500', discount_type: 'percent', discount_value: 20, min_order_amount: 500, max_discount: 200, is_active: 1 }
  ];

  const hashed = bcrypt.hashSync('password123', 10);
  state.users.push({ id: 1, name: 'Demo User', email: 'demo@mithaimandir.com', phone: '9876543210', password: hashed, role: 'customer', created_at: new Date().toISOString() });

  saveState();
  console.log('✅ Seeded JSON database store');
}

function initializeDatabase() {
  loadState();
  seedDatabase();
}

module.exports = { getDb, initializeDatabase, getState };

