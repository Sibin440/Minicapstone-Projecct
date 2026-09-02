const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../data/db.json');
const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

// Category IDs
const catId = {
  sweets:   db.categories.find(c => c.slug === 'sweets').id,
  savouries: db.categories.find(c => c.slug === 'savouries').id,
  cakes:    db.categories.find(c => c.slug === 'cakes').id,
  snacks:   db.categories.find(c => c.slug === 'snacks').id,
  cookies:  db.categories.find(c => c.slug === 'cookies-biscuits').id,
  breads:   db.categories.find(c => c.slug === 'breads').id,
  beverages: db.categories.find(c => c.slug === 'beverages').id,
};

let idCounter = 1788600001000;
const newProducts = [];
const newWeights = [];

function addProduct(cat, name, slug, desc, img, price, disc, best, isnew, offer, rat, rcount, weights) {
  const pid = ++idCounter;
  newProducts.push({
    id: pid,
    category_id: cat,
    name, slug, description: desc, image_url: img,
    base_price: price,
    discount_percent: disc,
    is_bestseller: best,
    is_new: isnew,
    is_offer: offer,
    rating: rat,
    rating_count: rcount,
    is_pure_veg: 1,
    is_active: 1,
    created_at: new Date().toISOString()
  });
  for (const [w, p] of weights) {
    newWeights.push({ id: ++idCounter, product_id: pid, weight: w, price: p });
  }
}

const W = (p) => [['250 gms', p], ['500 gms', +(p*1.9).toFixed(2)], ['1000 gms', +(p*3.7).toFixed(2)]];
const WC = (p) => [['500 gms', p], ['1000 gms', +(p*1.8).toFixed(2)], ['2000 gms', +(p*3.4).toFixed(2)]];
const WB = (p) => [['400 gms', p], ['800 gms', +(p*1.8).toFixed(2)]];
const WBev = (p) => [['200 gms', p], ['500 gms', +(p*2.3).toFixed(2)], ['1000 gms', +(p*4.2).toFixed(2)]];

// ── SWEETS (need 6 more, already have 4) ─────────────────────────
const existingSweets = db.products.filter(p => p.category_id === catId.sweets).length;
if (existingSweets < 10) {
  const sweetsToAdd = [
    ['Rasgulla', 'rasgulla', 'Soft spongy cottage cheese balls soaked in light sugar syrup. A classic Bengali delight.', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=500&fit=crop', 185, 0, 1, 0, 0, 4.7, 1820, W(185)],
    ['Motichoor Ladoo', 'motichoor-ladoo', 'Soft melt-in-mouth ladoos made from tiny fried gram flour pearls with aromatic cardamom.', 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&h=500&fit=crop', 245, 5, 1, 0, 1, 4.8, 1340, W(245)],
    ['Gajar Halwa', 'gajar-halwa', 'Rich carrot pudding slow-cooked in ghee and milk, garnished with dry fruits and khoya.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=500&fit=crop', 210, 0, 0, 1, 0, 4.6, 890, W(210)],
    ['Kaju Barfi', 'kaju-barfi', 'Diamond-cut cashew fudge with a delicate silver vark topping — festive and irresistible.', 'https://images.unsplash.com/photo-1624454002302-36b824d7bd0a?w=600&h=500&fit=crop', 360, 10, 1, 0, 1, 4.9, 2100, W(360)],
    ['Milk Peda', 'milk-peda', 'Soft khoya pedas flavoured with cardamom and saffron, rolled in pistachios.', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&h=500&fit=crop', 280, 0, 0, 1, 0, 4.7, 760, W(280)],
    ['Jalebi', 'jalebi', 'Crispy spiral jalebis soaked in warm sugar syrup — a beloved festive street sweet.', 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&h=500&fit=crop', 165, 0, 1, 0, 0, 4.5, 1450, W(165)],
  ];
  for (const s of sweetsToAdd) addProduct(catId.sweets, ...s);
}

// ── SAVOURIES (need 10) ───────────────────────────────────────────
const savouries = [
  ['Murukku', 'murukku', 'Crispy spiral rice flour savoury, deep-fried with cumin and sesame seeds.', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&h=500&fit=crop', 175, 0, 1, 0, 0, 4.7, 980, W(175)],
  ['Chivda Mix', 'chivda-mix', 'Light flattened rice mix with peanuts, curry leaves, green chillies and turmeric.', 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&h=500&fit=crop', 145, 5, 1, 0, 1, 4.5, 870, W(145)],
  ['Ribbon Pakoda', 'ribbon-pakoda', 'Thin ribbon-shaped rice flour crisps seasoned with chilli and carom seeds.', 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=600&h=500&fit=crop', 160, 0, 0, 1, 0, 4.6, 640, W(160)],
  ['Chakli', 'chakli', 'Crunchy spiral savoury made from rice and urad dal flour with ajwain and sesame.', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=500&fit=crop', 190, 0, 1, 0, 0, 4.8, 1120, W(190)],
  ['Thattai', 'thattai', 'Thin, crispy rice flour discs with chana dal and chillies — a Tamil Nadu classic.', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&h=500&fit=crop', 155, 0, 0, 0, 0, 4.5, 560, W(155)],
  ['Masala Sev', 'masala-sev', 'Thin chickpea flour noodles fried until crunchy, spiced with chilli and black pepper.', 'https://images.unsplash.com/photo-1562440499-64d9a986b43a?w=600&h=500&fit=crop', 140, 10, 1, 0, 1, 4.6, 1380, W(140)],
  ['Kodubale', 'kodubale', 'Karnataka-style crunchy ring snack made from rice flour and fresh coconut spices.', 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&h=500&fit=crop', 170, 0, 0, 1, 0, 4.4, 420, W(170)],
  ['Namkeen Mix', 'namkeen-mix', 'Festive assorted namkeen blend with sev, peanuts, flattened rice, and fried dal.', 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600&h=500&fit=crop', 185, 5, 1, 0, 1, 4.7, 1560, W(185)],
  ['Boondi', 'boondi', 'Tiny fried chickpea flour pearls — available in spiced and sweet versions.', 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&h=500&fit=crop', 130, 0, 0, 0, 0, 4.4, 740, W(130)],
  ['Kara Sev', 'kara-sev', 'Thick peppery chickpea flour sticks fried to a golden crunch with garlic and pepper.', 'https://images.unsplash.com/photo-1624454002302-36b824d7bd0a?w=600&h=500&fit=crop', 150, 0, 1, 0, 0, 4.6, 830, W(150)],
];
for (const s of savouries) addProduct(catId.savouries, ...s);

// ── CAKES (need 4 more, already have 6) ──────────────────────────
const cakes = [
  ['Pineapple Cream Cake', 'pineapple-cream-cake', 'Moist vanilla sponge layered with fresh pineapple chunks and whipped cream frosting.', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=500&fit=crop', 499, 0, 0, 1, 0, 4.6, 342, WC(499)],
  ['Red Velvet Cake', 'red-velvet-cake', 'Classic American red velvet cake with cream cheese frosting and a striking crimson crumb.', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=500&fit=crop', 699, 10, 1, 0, 1, 4.9, 512, WC(699)],
  ['Butterscotch Cake', 'butterscotch-cake', 'Moist butter sponge with butterscotch sauce layers, crunchy caramel bits and cream topping.', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&h=500&fit=crop', 549, 5, 1, 0, 0, 4.7, 288, WC(549)],
  ['Mango Delight Cake', 'mango-delight-cake', 'Seasonal Alphonso mango mousse cake with fresh mango glaze — a summer favourite.', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&h=500&fit=crop', 649, 0, 0, 1, 0, 4.8, 196, WC(649)],
];
for (const c of cakes) addProduct(catId.cakes, ...c);

// ── SNACKS (need 9 more, already have 1) ─────────────────────────
const snacks = [
  ['Banana Chips', 'banana-chips', 'Crispy raw banana slices fried in coconut oil and seasoned with salt and spices.', 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600&h=500&fit=crop', 120, 0, 1, 0, 0, 4.5, 1640, W(120)],
  ['Tapioca Chips', 'tapioca-chips', 'Thin translucent Kerala-style tapioca wafers with a light crunch and subtle seasoning.', 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&h=500&fit=crop', 110, 5, 0, 0, 1, 4.4, 760, W(110)],
  ['Masala Peanuts', 'masala-peanuts', 'Crunchy peanuts coated in besan batter with chilli, chaat masala and aamchur.', 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&h=500&fit=crop', 130, 0, 1, 0, 0, 4.6, 1120, W(130)],
  ['Roasted Cashews', 'roasted-cashews', 'Premium whole cashews lightly roasted and salted — a healthy and delicious snack.', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=500&fit=crop', 380, 0, 1, 0, 0, 4.8, 940, W(380)],
  ['Jackfruit Chips', 'jackfruit-chips', 'Crispy raw jackfruit slices fried in coconut oil — a unique tropical savory snack.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=500&fit=crop', 140, 0, 0, 1, 0, 4.3, 380, W(140)],
  ['Bhujia Sev', 'bhujia-sev', 'Thin spiced moth bean flour noodles fried to golden — the Bikaner speciality.', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&h=500&fit=crop', 150, 10, 1, 0, 1, 4.7, 2100, W(150)],
  ['Aloo Sev', 'aloo-sev', 'Potato-based crispy sev with a mild spiced flavour — perfect as a chaat topping.', 'https://images.unsplash.com/photo-1562440499-64d9a986b43a?w=600&h=500&fit=crop', 135, 0, 0, 0, 0, 4.4, 620, W(135)],
  ['Cornmeal Puffs', 'cornmeal-puffs', 'Airy corn puffs tossed in chaat masala — a light and addictive snack for all ages.', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&h=500&fit=crop', 95, 0, 0, 1, 0, 4.2, 480, W(95)],
  ['Trail Mix', 'trail-mix', 'Energy-packed mix of nuts, seeds, dried fruits and dark chocolate chips.', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&h=500&fit=crop', 220, 5, 1, 0, 1, 4.6, 840, W(220)],
];
for (const s of snacks) addProduct(catId.snacks, ...s);

// ── COOKIES & BISCUITS (need 10) ─────────────────────────────────
const cookies = [
  ['Butter Cookies', 'butter-cookies', 'Melt-in-mouth shortbread butter cookies baked to a golden crisp with vanilla essence.', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&h=500&fit=crop', 185, 0, 1, 0, 0, 4.7, 1280, W(185)],
  ['Chocolate Chip Cookies', 'chocolate-chip-cookies', 'Soft-baked American-style cookies loaded with dark and milk chocolate chips.', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=500&fit=crop', 220, 10, 1, 0, 1, 4.9, 1640, W(220)],
  ['Coconut Cookies', 'coconut-cookies', 'Crunchy cookies packed with desiccated coconut and lightly flavoured with cardamom.', 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600&h=500&fit=crop', 165, 0, 0, 0, 0, 4.5, 760, W(165)],
  ['Almond Cookies', 'almond-cookies', 'Delicate almond flour cookies with a nuttly aroma and melt-in-mouth texture.', 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&h=500&fit=crop', 280, 5, 1, 1, 0, 4.8, 540, W(280)],
  ['Atta Biscuits', 'atta-biscuits', 'Wholesome whole wheat biscuits with jaggery — a healthy traditional everyday biscuit.', 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600&h=500&fit=crop', 140, 0, 0, 0, 0, 4.4, 1020, W(140)],
  ['Rusk', 'rusk', 'Twice-baked golden tea rusk — lightly sweetened and perfect for dunking in chai.', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=500&fit=crop', 125, 0, 1, 0, 0, 4.5, 2340, W(125)],
  ['Khari Biscuit', 'khari-biscuit', 'Flaky puff pastry biscuits with a buttery melt — the classic Indian tea-time companion.', 'https://images.unsplash.com/photo-1562440499-64d9a986b43a?w=600&h=500&fit=crop', 115, 0, 0, 0, 0, 4.3, 1870, W(115)],
  ['Oatmeal Raisin Cookies', 'oatmeal-raisin-cookies', 'Hearty oatmeal cookies with plump raisins, cinnamon and a chewy wholesome texture.', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&h=500&fit=crop', 210, 0, 0, 1, 0, 4.6, 440, W(210)],
  ['Peanut Butter Cookies', 'peanut-butter-cookies', 'Thick and chewy peanut butter cookies with a fork-pressed top and rich nutty flavour.', 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&h=500&fit=crop', 240, 5, 1, 0, 1, 4.7, 620, W(240)],
  ['Digestive Biscuits', 'digestive-biscuits', 'Wholesome semi-sweet wheat biscuits with a pleasant crunch — great for any time of day.', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=500&fit=crop', 160, 0, 0, 0, 0, 4.4, 1450, W(160)],
];
for (const c of cookies) addProduct(catId.cookies, ...c);

// ── BREADS (need 10) ─────────────────────────────────────────────
const breads = [
  ['Whole Wheat Bread', 'whole-wheat-bread', 'Freshly baked whole wheat sandwich loaf — soft, nutritious and perfect for daily use.', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=500&fit=crop', 55, 0, 1, 0, 0, 4.5, 3200, WB(55)],
  ['Multigrain Bread', 'multigrain-bread', 'Fibre-rich loaf packed with seeds and grains — healthy, hearty and delicious.', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=500&fit=crop', 75, 5, 1, 0, 1, 4.7, 1840, WB(75)],
  ['Sourdough Loaf', 'sourdough-loaf', 'Artisan long-fermented sourdough with a crisp crust and open, tangy crumb.', 'https://images.unsplash.com/photo-1486887396153-fa416526c108?w=600&h=500&fit=crop', 120, 0, 0, 1, 0, 4.8, 780, WB(120)],
  ['Garlic Herb Bread', 'garlic-herb-bread', 'Soft baguette-style bread infused with garlic butter and mixed Italian herbs.', 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=600&h=500&fit=crop', 90, 0, 1, 0, 0, 4.6, 1120, WB(90)],
  ['Dinner Rolls', 'dinner-rolls', 'Fluffy soft milk dinner rolls — perfect alongside soups, curries, or as slider buns.', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=500&fit=crop', 65, 0, 0, 0, 0, 4.4, 1560, WB(65)],
  ['Pav Buns', 'pav-buns', 'Soft, pillowy Mumbai-style pav — the authentic partner for bhaji, vada and keema.', 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&h=500&fit=crop', 40, 0, 1, 0, 0, 4.6, 4200, WB(40)],
  ['Ciabatta', 'ciabatta', 'Italian flat bread with airy holes, chewy crumb and a crisp crust for bruschetta.', 'https://images.unsplash.com/photo-1486887396153-fa416526c108?w=600&h=500&fit=crop', 110, 10, 0, 1, 1, 4.5, 340, WB(110)],
  ['Focaccia', 'focaccia', 'Flat oven-baked focaccia drizzled with olive oil, sea salt, rosemary and olives.', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=500&fit=crop', 130, 0, 0, 1, 0, 4.7, 290, WB(130)],
  ['Banana Bread', 'banana-bread', 'Moist loaf cake made with ripe bananas and walnuts — a comforting baked classic.', 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&h=500&fit=crop', 145, 0, 1, 0, 0, 4.8, 860, WB(145)],
  ['Raisin Bread', 'raisin-bread', 'Soft sweet loaf studded with plump raisins and cinnamon — great toasted with butter.', 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=600&h=500&fit=crop', 85, 5, 0, 0, 1, 4.5, 640, WB(85)],
];
for (const b of breads) addProduct(catId.breads, ...b);

// ── BEVERAGES (need 10) ───────────────────────────────────────────
const beverages = [
  ['Masala Chai Mix', 'masala-chai-mix', 'Aromatic spiced tea premix with ginger, cardamom, clove, cinnamon and black pepper.', 'https://images.unsplash.com/photo-1561043433-aaf687c4cf04?w=600&h=500&fit=crop', 180, 0, 1, 0, 0, 4.8, 2100, WBev(180)],
  ['Filter Coffee Powder', 'filter-coffee-powder', 'South Indian blend of dark-roasted coffee and chicory — for the perfect decoction.', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=500&fit=crop', 220, 5, 1, 0, 1, 4.9, 1840, WBev(220)],
  ['Badam Drink Mix', 'badam-drink-mix', 'Premium almond-saffron instant beverage mix for a rich and nourishing hot or cold drink.', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&h=500&fit=crop', 280, 0, 1, 0, 0, 4.7, 960, WBev(280)],
  ['Rose Milk Syrup', 'rose-milk-syrup', 'Fragrant rose essence syrup — just add chilled milk for an instant pink rose milk.', 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600&h=500&fit=crop', 160, 0, 0, 1, 0, 4.5, 720, WBev(160)],
  ['Mango Lassi Mix', 'mango-lassi-mix', 'Instant Alphonso mango lassi powder — blend with yogurt and chilled water for a creamy drink.', 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=600&h=500&fit=crop', 200, 10, 1, 0, 1, 4.7, 1120, WBev(200)],
  ['Turmeric Latte Mix', 'turmeric-latte-mix', 'Golden milk premix with turmeric, ashwagandha, black pepper and coconut sugar.', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&h=500&fit=crop', 240, 0, 0, 1, 0, 4.6, 540, WBev(240)],
  ['Cardamom Tea Powder', 'cardamom-tea-powder', 'Delicate green cardamom-infused loose-leaf tea blend for a refreshing aromatic brew.', 'https://images.unsplash.com/photo-1523920945abb-cd68dfb3b7ba?w=600&h=500&fit=crop', 165, 0, 1, 0, 0, 4.7, 880, WBev(165)],
  ['Saffron Milk Mix', 'saffron-milk-mix', 'Luxurious kesar-doodh powder with pure Kashmiri saffron strands and almond pieces.', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&h=500&fit=crop', 390, 0, 1, 0, 0, 4.9, 620, WBev(390)],
  ['Kokum Sharbat', 'kokum-sharbat', 'Tangy Goan kokum concentrate — dilute with water or soda for a cooling summer drink.', 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600&h=500&fit=crop', 140, 5, 0, 1, 1, 4.4, 440, WBev(140)],
  ['Thandai Mix', 'thandai-mix', 'Traditional Holi special thandai powder with almonds, fennel, rose petals and spices.', 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=600&h=500&fit=crop', 310, 0, 1, 0, 0, 4.8, 780, WBev(310)],
];
for (const b of beverages) addProduct(catId.beverages, ...b);

// Merge into db
db.products.push(...newProducts);
db.product_weights.push(...newWeights);

fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
console.log(`✅ Added ${newProducts.length} products and ${newWeights.length} weight entries.`);

// Summary
const cats = db.categories;
for (const cat of cats) {
  const count = db.products.filter(p => p.category_id === cat.id && p.is_active === 1).length;
  console.log(`  ${cat.name}: ${count} products`);
}
