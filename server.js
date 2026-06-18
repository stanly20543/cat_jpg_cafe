const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const initSqlJs = require('sql.js');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'data', 'catcafe.db');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.static(path.join(__dirname, 'public')));

let db;

async function initDB() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }
  db.save = () => fs.writeFileSync(DB_PATH, Buffer.from(db.export()));

  db.run(`CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY, category TEXT NOT NULL,
    name_zh TEXT NOT NULL, name_en TEXT, price INTEGER NOT NULL,
    description TEXT, image_url TEXT, badges TEXT DEFAULT '[]',
    is_available INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS gallery (
    id TEXT PRIMARY KEY, url TEXT NOT NULL, alt TEXT, section TEXT DEFAULT 'hero', sort_order INTEGER DEFAULT 0
  )`);
  db.save();
  seedIfEmpty();
}

function seedIfEmpty() {
  // Use INSERT OR IGNORE so data is always filled in even after redeployment
  const items = [
    ['c1','COFFEE','義式黑咖啡','Espresso',85,'純粹義式濃縮，感受咖啡豆最原始的風味層次，苦中帶有焦糖回甘。','','[]',1,1],
    ['c2','COFFEE','蜂蜜柚子黑咖啡','Honey Yuzu Espresso',105,'清爽柚子香氣與天然蜂蜜甜味，搭配義式濃縮別有一番風味。','','[]',1,2],
    ['c3','COFFEE','卡布奇諾','Cappuccino',105,'經典義式比例，濃縮搭配厚實綿密奶泡，每一口都是享受。','','[]',1,3],
    ['c4','COFFEE','拿鐵','Caffè Latte',100,'順口牛奶與濃縮咖啡完美融合，日常的滿足感。','','[]',1,4],
    ['c5','COFFEE','香草拿鐵','Vanilla Latte',110,'經典香草糖漿，甜而不膩，適合咖啡初心者。','','[]',1,5],
    ['c6','COFFEE','榛果拿鐵','Hazelnut Latte',110,'義大利榛果風味，香氣四溢，堅果甜香令人著迷。','','[]',1,6],
    ['c7','COFFEE','焦糖拿鐵','Caramel Latte',110,'焦糖的甜苦交織層次，最受歡迎的選擇之一。','','[]',1,7],
    ['c8','COFFEE','黑糖拿鐵','Brown Sugar Latte',115,'台灣黑糖風味，溫潤甜蜜，暖心之選。','','[]',1,8],
    ['c9','COFFEE','桂花拿鐵','Osmanthus Latte',125,'台灣桂花清雅香氣融入拿鐵，細緻典雅的台式風情。','','[]',1,9],
    ['c10','COFFEE','杏仁拿鐵','Almond Latte',125,'杏仁香氣溫潤深沉，適合喜歡不太甜的你。','','[]',1,10],
    ['c11','COFFEE','摩卡咖啡','Mocha',130,'榛果巧克力風味，濃郁迷人，巧克力與咖啡的完美協奏。','["*榛果巧克力風味"]',1,11],
    ['c12','COFFEE','鹽焦糖拿鐵','Salted Caramel Latte',140,'鹹甜交織，海鹽提升焦糖的複雜層次，令人上癮。','','[]',1,12],
    ['c13','COFFEE','香蕉拿鐵','Banana Latte',150,'新鮮香蕉融入咖啡，獨特果香，限冰飲供應。','["限冰飲"]',1,13],
    ['c14','COFFEE','貝禮詩拿鐵','Baileys Latte',155,'加入貝禮詩愛爾蘭奶酒，微醺奢華的咖啡體驗。','["*含酒精"]',1,14],
    ['t1','TEA','蜂蜜檸檬','Honey Lemon',85,'天然蜂蜜與新鮮檸檬，清爽解渴，限冰飲。','["限冰飲"]',1,1],
    ['t2','TEA','熱帶果香烏龍茶','Tropical Oolong',85,'熱帶水果香氣融入清香烏龍，清新帶果香。','','[]',1,2],
    ['t3','TEA','覆盆子萊姆茶','Raspberry Lime Tea',90,'酸甜覆盆子搭配萊姆清香，清新爽口。','','[]',1,3],
    ['t4','TEA','伯爵茶','Earl Grey',80,'經典伯爵，細緻佛手柑香氣，茶香悠長。','','[]',1,4],
    ['t5','TEA','伯爵鮮奶茶','Earl Grey Milk Tea',95,'伯爵茶香與新鮮牛奶完美融合，英式下午茶風情。','','[]',1,5],
    ['t6','TEA','玫瑰鐵觀音鮮奶茶','Rose Tieguanyin Milk Tea',105,'玫瑰花香提升鐵觀音的醇厚，浪漫優雅的一杯。','','[]',1,6],
    ['t7','TEA','阿薩姆柚子紅茶','Assam Yuzu Black Tea',100,'柚子清香完美提亮阿薩姆的醇厚茶感。','','[]',1,7],
    ['t8','TEA','白蘭地蘋果汁','Brandy Apple Juice',100,'新鮮蘋果汁加入白蘭地，微醺果香，限冰飲。','["限冰飲","*含酒精"]',1,8],
    ['t9','TEA','日式抹茶','Japanese Matcha',105,'含牛奶，濃郁抹茶香，日式風情。','["*含牛奶"]',1,9],
    ['t10','TEA','日式焙茶','Japanese Houjicha',110,'含牛奶，炭焙茶香令人安心，適合傍晚來一杯。','["*含牛奶"]',1,10],
    ['s1','SMOOTHIE','芒果貓咬冰','Mango Cat Slushie',110,'新鮮芒果打製，酸甜濃郁，夏日必點。','','[]',1,1],
    ['s2','SMOOTHIE','草莓鮮奶貓咬冰','Strawberry Milk Slushie',120,'草莓與鮮奶的夢幻組合，粉嫩可愛。','','[]',1,2],
    ['s3','SMOOTHIE','巧克力碎片貓咬冰','Choco Chip Slushie',130,'巧克力碎片與冰沙，口感豐富有層次。','','[]',1,3],
    ['s4','SMOOTHIE','抹茶OREO貓咬冰','Matcha OREO Slushie',135,'抹茶苦香搭配OREO，人氣首選。','','[]',1,4],
    ['m1','MILK','黑糖鮮奶','Brown Sugar Milk',90,'台灣黑糖搭配新鮮牛奶，甜蜜濃郁暖心。','','[]',1,1],
    ['m2','MILK','香草肉桂鮮奶','Vanilla Cinnamon Milk',100,'香草與肉桂的溫暖組合，只供熱飲。','["限熱飲"]',1,2],
    ['m3','MILK','貝禮詩鮮奶','Baileys Milk',130,'貝禮詩奶酒融入鮮奶，微醺奢華享受。','["*含酒精"]',1,3],
    ['ch1','CHOCOLATE','原味巧克力','Classic Chocolate',115,'比利時巧克力，濃郁純粹，可可香氣馥郁。','','[]',1,1],
    ['ch2','CHOCOLATE','薄荷巧克力','Mint Chocolate',130,'薄荷清涼完美搭配巧克力，清爽限冰飲。','["限冰飲"]',1,2],
    ['ch3','CHOCOLATE','香蕉巧克力','Banana Chocolate',145,'新鮮香蕉融入濃郁巧克力，限冰飲。','["限冰飲"]',1,3],
    ['b1','BREAD','鮮奶厚片','Milk Thick Toast',55,'鬆軟鮮奶吐司，可選各式抹醬：鹹奶油、榛果巧克力、顆粒花生、香蕉巧克力(+15)、草莓乳酪(+10)。','','[]',1,1],
    ['b2','BREAD','葡萄乾雜糧','Raisin Multigrain Toast',65,'健康雜糧加入葡萄乾，天然甜香，嚼勁十足。','','[]',1,2],
    ['b3','BREAD','軟法堡','Soft Baguette',65,'外脆內軟的法式軟法麵包，百搭抹醬。','','[]',1,3],
    ['sub1','SUB_SANDWICH','胡麻醬鮮蔬起士','Sesame Veggie Cheese Sub',90,'清爽胡麻醬搭配新鮮蔬菜與起士，素食友善。','["素"]',1,1],
    ['sub2','SUB_SANDWICH','鮪魚蔬菜','Tuna Veggie Sub',95,'日式鮪魚沙拉搭配新鮮蔬菜，清爽不膩。','','[]',1,2],
    ['sub3','SUB_SANDWICH','迷迭香雞肉','Rosemary Chicken Sub',100,'迷迭香烤雞肉，草本香氣迷人。','','[]',1,3],
    ['sw1','SANDWICH','老派雞蛋肉鬆','Classic Egg Floss Sandwich',95,'台式經典組合，雞蛋美乃滋與肉鬆的懷舊滋味。','','[]',1,1],
    ['sw2','SANDWICH','黑胡椒腿肉','Black Pepper Pork Sandwich',100,'黑胡椒豬腿肉，辛香有勁，口感豐富。','["*豬肉"]',1,2],
    ['sw3','SANDWICH','花生醬培根','Peanut Butter Bacon Sandwich',105,'花生醬搭配酥脆培根，美式風格令人滿足。','','[]',1,3],
    ['sw4','SANDWICH','半熟蛋培根','Soft Egg Bacon Sandwich',105,'流心半熟蛋搭配培根，早午餐的完美選擇。','','[]',1,4],
    ['sw5','SANDWICH','雞肉培根','Chicken Bacon Sandwich',130,'嫩煎雞肉與培根雙重享受，飽足感滿分。','','[]',1,5],
  ];
  const stmt = db.prepare(`INSERT OR IGNORE INTO menu_items (id,category,name_zh,name_en,price,description,image_url,badges,is_available,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?)`);
  items.forEach(i => stmt.run(i));
  stmt.free();

  const settings = [
    ['site_name','貓圖咖啡'],['site_subtitle','CAT.jpg cafe'],
    ['hero_tagline','有貝貝在的地方，就有家的溫度。'],
    ['hero_sub','不限時、有插座、有 Wi-Fi，一杯咖啡，待上一整個午後。'],
    ['address','106 台北市大安區潮州街 154 號'],['phone','(02) 3365-2865'],
    ['hours_weekday','08:30 – 17:00'],['hours_weekend','08:00 – 17:00'],
    ['facebook_url','#'],['instagram_url','#'],['line_url','#'],
    ['admin_password','catcafe2024'],
  ];
  const ss = db.prepare("INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)");
  settings.forEach(([k,v]) => ss.run([k,v]));
  ss.free();
  db.save();
  console.log('✅ Seed data synced');
}

function queryAll(sql, params=[]) {
  const res = db.exec(sql, params);
  if (!res.length) return [];
  const { columns, values } = res[0];
  return values.map(row => Object.fromEntries(columns.map((c,i) => [c, row[i]])));
}
function queryOne(sql, params=[]) { return queryAll(sql, params)[0] || null; }

// ── API ROUTES ──
app.get('/api/settings', (req, res) => {
  const rows = queryAll("SELECT key, value FROM site_settings");
  const obj = {};
  rows.forEach(r => obj[r.key] = r.value);
  delete obj.admin_password;
  res.json(obj);
});
app.put('/api/settings/batch', (req, res) => {
  const updates = req.body;
  delete updates.admin_password;
  Object.entries(updates).forEach(([k,v]) => db.run("INSERT OR REPLACE INTO site_settings (key, value) VALUES (?,?)",[k,v]));
  db.save();
  res.json({ ok: true });
});
app.post('/api/auth/login', (req, res) => {
  const row = queryOne("SELECT value FROM site_settings WHERE key='admin_password'");
  if (row && row.value === req.body.password) {
    res.json({ ok: true, token: 'admin-' + Date.now() });
  } else res.status(401).json({ error: '密碼錯誤' });
});
app.get('/api/menu', (req, res) => {
  const { category } = req.query;
  let sql = "SELECT * FROM menu_items";
  const params = [];
  if (category) { sql += " WHERE category=?"; params.push(category); }
  sql += " ORDER BY category, sort_order";
  const items = queryAll(sql, params);
  items.forEach(item => { try { item.badges = JSON.parse(item.badges||'[]'); } catch { item.badges=[]; } });
  res.json(items);
});
app.get('/api/menu/:id', (req, res) => {
  const item = queryOne("SELECT * FROM menu_items WHERE id=?",[req.params.id]);
  if (!item) return res.status(404).json({ error: 'Not found' });
  try { item.badges = JSON.parse(item.badges); } catch { item.badges=[]; }
  res.json(item);
});
app.post('/api/menu', (req, res) => {
  const { category, name_zh, name_en, price, description, image_url, badges, is_available, sort_order } = req.body;
  const id = uuidv4();
  db.run(`INSERT INTO menu_items (id,category,name_zh,name_en,price,description,image_url,badges,is_available,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [id,category,name_zh,name_en||'',price,description||'',image_url||'',JSON.stringify(badges||[]),is_available??1,sort_order||0]);
  db.save();
  res.json({ ok: true, id });
});
app.put('/api/menu/:id', (req, res) => {
  const { category, name_zh, name_en, price, description, image_url, badges, is_available, sort_order } = req.body;
  db.run(`UPDATE menu_items SET category=?,name_zh=?,name_en=?,price=?,description=?,image_url=?,badges=?,is_available=?,sort_order=?,updated_at=datetime('now') WHERE id=?`,
    [category,name_zh,name_en||'',price,description||'',image_url||'',JSON.stringify(badges||[]),is_available??1,sort_order||0,req.params.id]);
  db.save();
  res.json({ ok: true });
});
app.delete('/api/menu/:id', (req, res) => {
  db.run("DELETE FROM menu_items WHERE id=?",[req.params.id]);
  db.save();
  res.json({ ok: true });
});
app.post('/api/upload', (req, res) => {
  const { dataUrl } = req.body;
  if (!dataUrl) return res.status(400).json({ error: 'No image' });
  const m = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!m) return res.status(400).json({ error: 'Invalid data URL' });
  const ext = m[1].split('/')[1]||'jpg';
  const fname = `${uuidv4()}.${ext}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, fname), Buffer.from(m[2],'base64'));
  res.json({ url: `/uploads/${fname}` });
});
app.get('/api/gallery', (req,res) => res.json(queryAll("SELECT * FROM gallery ORDER BY section, sort_order")));
app.post('/api/gallery', (req, res) => {
  const { url, alt, section, sort_order } = req.body;
  const id = uuidv4();
  db.run("INSERT INTO gallery (id,url,alt,section,sort_order) VALUES (?,?,?,?,?)",[id,url,alt||'',section||'hero',sort_order||0]);
  db.save();
  res.json({ ok: true, id });
});
app.delete('/api/gallery/:id', (req,res) => {
  db.run("DELETE FROM gallery WHERE id=?",[req.params.id]);
  db.save();
  res.json({ ok: true });
});

initDB().then(() => app.listen(PORT, () => console.log(`🐱 Server running at http://localhost:${PORT}`)));
