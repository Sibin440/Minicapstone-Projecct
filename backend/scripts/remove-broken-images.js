const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const DB_FILE = path.join(__dirname, '../data/db.json');
const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

function checkImage(url) {
  return new Promise((resolve) => {
    try {
      const lib = url.startsWith('https') ? https : http;
      const req = lib.get(url, { timeout: 5000 }, (res) => {
        resolve(res.statusCode >= 200 && res.statusCode < 400);
        res.resume();
      });
      req.on('error', () => resolve(false));
      req.on('timeout', () => { req.destroy(); resolve(false); });
    } catch (_) {
      resolve(false);
    }
  });
}

async function main() {
  console.log(`Checking ${db.products.length} products...`);
  const badIds = [];

  for (const product of db.products) {
    const ok = await checkImage(product.image_url);
    if (!ok) {
      console.log(`❌ BROKEN: ${product.name} → ${product.image_url}`);
      badIds.push(product.id);
    } else {
      console.log(`✅ OK: ${product.name}`);
    }
  }

  if (badIds.length === 0) {
    console.log('\n✅ All images are working! No products removed.');
    return;
  }

  console.log(`\n🗑️  Removing ${badIds.length} products with broken images...`);
  db.products = db.products.filter(p => !badIds.includes(p.id));
  db.product_weights = db.product_weights.filter(w => !badIds.includes(w.product_id));

  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  console.log(`✅ Done. ${db.products.length} products remaining.`);
}

main();
