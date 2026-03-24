require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Product = require('./models/Product');
const User = require('./models/User');

const products = [
  // Biscuits & Cookies
  { name:'Oreo Vanilla Cream Biscuits', brand:'Mondelez', barcode:'8901233020115', category:'Biscuits', servingSize:'100g', sugarG:38, calories:480, carbs:69, fat:20, protein:4, hiddenSugars:['High fructose corn syrup','Invert sugar'] },
  { name:'Unibic Choco Chip Cookies', brand:'Unibic', barcode:'8906009071025', category:'Biscuits', servingSize:'100g', sugarG:31, calories:505, carbs:65, fat:25, protein:5, hiddenSugars:['Dextrose','Liquid glucose'] },
  { name:'NutriChoice 5 Grain Digestive', brand:'Britannia', barcode:'8901063012017', category:'Biscuits', servingSize:'100g', sugarG:14, calories:485, carbs:68, fat:21, protein:8, hiddenSugars:['Honey','Invert syrup'] },
  { name:'Sunfeast Mom’s Magic Cashew', brand:'ITC', barcode:'8901554020086', category:'Biscuits', servingSize:'100g', sugarG:26, calories:502, carbs:64, fat:24, protein:7, hiddenSugars:['Invert sugar syrup','Liquid glucose'] },
  { name:'Parle Krackjack', brand:'Parle', barcode:'8901719111304', category:'Biscuits', servingSize:'100g', sugarG:15, calories:490, carbs:68, fat:22, protein:6, hiddenSugars:['Invert sugar syrup'] },
  { name:'Britannia Little Hearts', brand:'Britannia', barcode:'8901063013342', category:'Biscuits', servingSize:'100g', sugarG:25, calories:502, carbs:66, fat:24, protein:6, hiddenSugars:['Liquid glucose'] },
  { name:'McVities Digestive Biscuits', brand:'United Biscuits', barcode:'8906033740011', category:'Biscuits', servingSize:'100g', sugarG:16, calories:475, carbs:63, fat:21, protein:7, hiddenSugars:['Partially inverted sugar syrup'] },
  { name:'Patanjali Doodh Biscuits', brand:'Patanjali', barcode:'8906040101233', category:'Biscuits', servingSize:'100g', sugarG:22, calories:455, carbs:74, fat:15, protein:7, hiddenSugars:['Invert syrup'] },
  { name:'Sunfeast Marie Light', brand:'ITC', barcode:'8901554001016', category:'Biscuits', servingSize:'100g', sugarG:18, calories:445, carbs:76, fat:13, protein:8, hiddenSugars:['Invert sugar'] },
  { name:'Unibic Oatmeal Digestive', brand:'Unibic', barcode:'8906009071087', category:'Biscuits', servingSize:'100g', sugarG:17, calories:478, carbs:66, fat:20, protein:8, hiddenSugars:['Honey','Golden syrup'] },

  // Beverages & Mixes
  { name:'Horlicks Classic Malt', brand:'HUL', barcode:'8901030671233', category:'Beverages', servingSize:'100g', sugarG:13, calories:377, carbs:79, fat:2, protein:11, hiddenSugars:['Malted barley','Wheat flour'] },
  { name:'Complan Chocolate', brand:'Zydus Wellness', barcode:'8901548100121', category:'Beverages', servingSize:'100g', sugarG:24, calories:430, carbs:64, fat:11, protein:18, hiddenSugars:['Sucrose','Caramel'] },
  { name:'Boost Health Drink', brand:'HUL', barcode:'8901030671509', category:'Beverages', servingSize:'100g', sugarG:19, calories:385, carbs:80, fat:2, protein:7, hiddenSugars:['Malted barley','Liquid glucose'] },
  { name:'Red Bull Energy Drink', brand:'Red Bull', barcode:'9002490100070', category:'Beverages', servingSize:'250ml', sugarG:27, calories:115, carbs:28, fat:0, protein:0, hiddenSugars:['Sucrose','Glucose'] },
  { name:'Sting Energy Drink Blue', brand:'PepsiCo', barcode:'8902083004121', category:'Beverages', servingSize:'250ml', sugarG:31, calories:125, carbs:31, fat:0, protein:0, hiddenSugars:['High fructose corn syrup'] },
  { name:'Thums Up Soda 300ml', brand:'Coca-Cola', barcode:'8901764012235', category:'Beverages', servingSize:'300ml', sugarG:39, calories:150, carbs:39, fat:0, protein:0, hiddenSugars:['Sugar'] },
  { name:'Sprite Lemon Lime 300ml', brand:'Coca-Cola', barcode:'8901764031120', category:'Beverages', servingSize:'300ml', sugarG:36, calories:144, carbs:36, fat:0, protein:0, hiddenSugars:['Sugar'] },
  { name:'Tropicana Orange Delight', brand:'PepsiCo', barcode:'8902083001236', category:'Beverages', servingSize:'200ml', sugarG:18, calories:90, carbs:22, fat:0, protein:0, hiddenSugars:['Fructose','Reconstituted juice'] },
  { name:'Hersheys Chocolate Syrup', brand:'Hershey India', barcode:'8901071720015', category:'Beverages', servingSize:'100g', sugarG:50, calories:260, carbs:62, fat:1, protein:2, hiddenSugars:['High fructose corn syrup','Corn syrup'] },
  { name:'Rasna Fruit Plus Orange', brand:'Rasna', barcode:'8901991100125', category:'Beverages', servingSize:'100g', sugarG:94, calories:380, carbs:95, fat:0, protein:0, hiddenSugars:['Sucrose','Glucose'] },
  { name:'Nescafe Classic Coffee', brand:'Nestle', barcode:'8901058000126', category:'Beverages', servingSize:'2g', sugarG:0, calories:2, carbs:0, fat:0, protein:0, hiddenSugars:[] },
  { name:'Bru Instant Coffee Mix', brand:'HUL', barcode:'8901030541215', category:'Beverages', servingSize:'2g', sugarG:0, calories:2, carbs:0, fat:0, protein:0, hiddenSugars:['Chicory'] },
  { name:'Paperboat Jaljeera', brand:'Hector Beverages', barcode:'8906038700058', category:'Beverages', servingSize:'200ml', sugarG:14, calories:60, carbs:15, fat:0, protein:0, hiddenSugars:['Sugar'] },
  { name:'7Up Lemonade', brand:'PepsiCo', barcode:'8902083000123', category:'Beverages', servingSize:'300ml', sugarG:33, calories:132, carbs:33, fat:0, protein:0, hiddenSugars:['Sugar'] },

  // Chocolates & Confectionery
  { name:'Cadbury Dairy Milk Silk', brand:'Mondelez', barcode:'8901233022126', category:'Chocolates', servingSize:'100g', sugarG:57, calories:530, carbs:60, fat:30, protein:6, hiddenSugars:['Sucrose','Lactose'] },
  { name:'Nestle KitKat Finger', brand:'Nestle', barcode:'8901058860010', category:'Chocolates', servingSize:'100g', sugarG:46, calories:515, carbs:62, fat:28, protein:5, hiddenSugars:['Sucrose'] },
  { name:'Cadbury 5 Star Bar', brand:'Mondelez', barcode:'8901233012110', category:'Chocolates', servingSize:'100g', sugarG:55, calories:480, carbs:68, fat:22, protein:3, hiddenSugars:['Liquid glucose','Invert sugar'] },
  { name:'Snickers Peanut Bar', brand:'Mars India', barcode:'8902433001215', category:'Chocolates', servingSize:'100g', sugarG:48, calories:490, carbs:56, fat:25, protein:9, hiddenSugars:['Corn syrup','Lactose'] },
  { name:'Munch Chocolate Bar', brand:'Nestle', barcode:'8901058140013', category:'Chocolates', servingSize:'100g', sugarG:44, calories:510, carbs:65, fat:25, protein:4, hiddenSugars:['Sucrose'] },
  { name:'Ferrero Rocher T3', brand:'Ferrero', barcode:'8000500120124', category:'Chocolates', servingSize:'100g', sugarG:40, calories:603, carbs:44, fat:43, protein:8, hiddenSugars:['Sucrose'] },
  { name:'Amul Dark Chocolate 55%', brand:'Amul', barcode:'8901088121111', category:'Chocolates', servingSize:'100g', sugarG:44, calories:557, carbs:57, fat:34, protein:5, hiddenSugars:['Sucrose'] },
  { name:'Cadbury Gems', brand:'Mondelez', barcode:'8901233031029', category:'Chocolates', servingSize:'100g', sugarG:70, calories:460, carbs:76, fat:16, protein:3, hiddenSugars:['Sucrose','Liquid glucose'] },
  { name:'Kinder Joy with Surprise', brand:'Ferrero', barcode:'8000500181217', category:'Chocolates', servingSize:'20g', sugarG:10, calories:110, carbs:11, fat:7, protein:1, hiddenSugars:['Sucrose'] },

  // Breakfast Cereals
  { name:'Kelloggs Corn Flakes Honey', brand:'Kelloggs', barcode:'8901262010125', category:'Breakfast Cereals', servingSize:'100g', sugarG:28, calories:385, carbs:88, fat:1, protein:5, hiddenSugars:['Honey','Barley malt extract','Sugar'] },
  { name:'Bagrrys Muesli Mixed Fruit', brand:'Bagrrys', barcode:'8906014021213', category:'Breakfast Cereals', servingSize:'100g', sugarG:22, calories:395, carbs:72, fat:8, protein:9, hiddenSugars:['Invert syrup','Honey'] },
  { name:'Saffola Masala Oats Classic', brand:'Marico', barcode:'8901088140129', category:'Breakfast Cereals', servingSize:'38g', sugarG:1, calories:150, carbs:25, fat:3, protein:4, hiddenSugars:['Maltodextrin'] },
  { name:'Yoga Bar Muesli Fruits Nuts', brand:'Yoga Bar', barcode:'8908007130124', category:'Breakfast Cereals', servingSize:'100g', sugarG:12, calories:410, carbs:65, fat:12, protein:9, hiddenSugars:['Honey','Dates'] },
  { name:'Quaker Oats (Unflavoured)', brand:'PepsiCo', barcode:'8902083002127', category:'Breakfast Cereals', servingSize:'100g', sugarG:0, calories:390, carbs:66, fat:8, protein:12, hiddenSugars:[] },
  { name:'Kelloggs All Bran Wheat', brand:'Kelloggs', barcode:'8901262021121', category:'Breakfast Cereals', servingSize:'100g', sugarG:16, calories:340, carbs:68, fat:3, protein:12, hiddenSugars:['Barley malt extract'] },

  // Snacks & Namkeen
  { name:'Haldirams Moong Dal', brand:'Haldirams', barcode:'8906004321125', category:'Snacks', servingSize:'100g', sugarG:0, calories:470, carbs:45, fat:22, protein:23, hiddenSugars:[] },
  { name:'Bikaji Bikaneri Bhujia', brand:'Bikaji', barcode:'8901502012124', category:'Snacks', servingSize:'100g', sugarG:0, calories:580, carbs:38, fat:44, protein:11, hiddenSugars:[] },
  { name:'Cornitos Nachos Cheese', brand:'Greendot', barcode:'8906012211241', category:'Snacks', servingSize:'100g', sugarG:2, calories:505, carbs:64, fat:25, protein:7, hiddenSugars:['Maltodextrin'] },
  { name:'Pringles Sour Cream Onion', brand:'Kelloggs', barcode:'8886467101217', category:'Snacks', servingSize:'100g', sugarG:3, calories:520, carbs:53, fat:31, protein:4, hiddenSugars:['Dextrose','Rice flour'] },
  { name:'Act II Butter Popcorn', brand:'Conagra', barcode:'8901512101215', category:'Snacks', servingSize:'100g', sugarG:0, calories:510, carbs:55, fat:28, protein:9, hiddenSugars:[] },
  { name:'Too Yumm Multigrain Chips', brand:'Guiltfree Industries', barcode:'8904250600128', category:'Snacks', servingSize:'100g', sugarG:4, calories:460, carbs:65, fat:18, protein:8, hiddenSugars:['Sugar','Maltodextrin'] },
  { name:'Bingo! Tedhe Medhe Masala', brand:'ITC', barcode:'8901554012128', category:'Snacks', servingSize:'100g', sugarG:2, calories:540, carbs:58, fat:32, protein:6, hiddenSugars:['Sugar'] },

  // Dairy & Spreads
  { name:'Amul Butter (Salted)', brand:'Amul', barcode:'8901088001017', category:'Dairy', servingSize:'100g', sugarG:0, calories:720, carbs:0, fat:80, protein:1, hiddenSugars:[] },
  { name:'Mother Dairy Paneer', brand:'Mother Dairy', barcode:'8906002841121', category:'Dairy', servingSize:'100g', sugarG:2, calories:260, carbs:4, fat:20, protein:18, hiddenSugars:[] },
  { name:'Nutella Hazelnut Spread', brand:'Ferrero', barcode:'8000500171218', category:'Dairy Spreads', servingSize:'100g', sugarG:56, calories:539, carbs:57, fat:31, protein:6, hiddenSugars:['Sucrose'] },
  { name:'Kissan Mixed Fruit Jam', brand:'HUL', barcode:'8901030310124', category:'Sauces', servingSize:'100g', sugarG:64, calories:280, carbs:68, fat:0, protein:0, hiddenSugars:['Invert sugar','Pectin'] },
  { name:'Dr Oetker FunFoods Mayonnaise', brand:'Dr Oetker', barcode:'8906024141214', category:'Sauces', servingSize:'100g', sugarG:6, calories:600, carbs:10, fat:62, protein:1, hiddenSugars:['Sugar'] },
  { name:'Amul Cheese Slices', brand:'Amul', barcode:'8901088006124', category:'Dairy', servingSize:'100g', sugarG:2, calories:310, carbs:3, fat:24, protein:20, hiddenSugars:[] },
  { name:'Epigamia BlueBerry Yogurt', brand:'Drums Food', barcode:'8908005312126', category:'Dairy', servingSize:'100g', sugarG:12, calories:115, carbs:16, fat:3, protein:6, hiddenSugars:['Fruit pulp','Cane sugar'] },

  // Pantry & Instant Foods
  { name:'Tata Sampann Khichdi Mix', brand:'Tata', barcode:'8901443121212', category:'Packaged Foods', servingSize:'100g', sugarG:1, calories:350, carbs:65, fat:4, protein:14, hiddenSugars:[] },
  { name:'Chings Schezwan Chutney', brand:'Capital Foods', barcode:'8901595851212', category:'Sauces', servingSize:'100g', sugarG:15, calories:210, carbs:22, fat:13, protein:2, hiddenSugars:['Liquid glucose','Caramel'] },
  { name:'MTR Instant Poha Mix', brand:'MTR', barcode:'8901242001211', category:'Packaged Foods', servingSize:'80g', sugarG:4, calories:320, carbs:56, fat:8, protein:6, hiddenSugars:['Sugar'] },
  { name:'Veeba Pasta Pizza Sauce', brand:'Veeba', barcode:'8906069401213', category:'Sauces', servingSize:'100g', sugarG:12, calories:140, carbs:18, fat:7, protein:2, hiddenSugars:['Liquid glucose'] },
  { name:'Samyang Buldak Ramen (2x)', brand:'Samyang India', barcode:'8801073110125', category:'Noodles', servingSize:'140g', sugarG:9, calories:550, carbs:84, fat:18, protein:13, hiddenSugars:['Sucrose','Dextrin'] },
  { name:'Patanjali Honey', brand:'Patanjali', barcode:'8906040101219', category:'Pantry', servingSize:'100g', sugarG:80, calories:320, carbs:80, fat:0, protein:0, hiddenSugars:['Fructose','Glucose'] },
  { name:'Dabur Chyawanprash', brand:'Dabur', barcode:'8901207001215', category:'Health', servingSize:'100g', sugarG:65, calories:300, carbs:70, fat:1, protein:2, hiddenSugars:['Sharkara (Cane Sugar)'] },
  { name:'Nestle Cerelac Wheat Apple', brand:'Nestle', barcode:'8901058000128', category:'Baby Food', servingSize:'100g', sugarG:28, calories:412, carbs:68, fat:10, protein:15, hiddenSugars:['Sucrose','Glucose syrup'] },
  { name:'Amulya Dairy Whitener', brand:'Amul', barcode:'8901088012112', category:'Dairy', servingSize:'100g', sugarG:15, calories:460, carbs:40, fat:20, protein:20, hiddenSugars:['Sucrose'] },
  { name:'Everest Turmeric Powder', brand:'Everest', barcode:'8901344012121', category:'Spices', servingSize:'100g', sugarG:0, calories:350, carbs:60, fat:10, protein:8, hiddenSugars:[] },
  { name:'Maggi Hot and Sweet Sauce', brand:'Nestle', barcode:'8901058004117', category:'Sauces', servingSize:'100g', sugarG:42, calories:180, carbs:44, fat:0, protein:1, hiddenSugars:['Liquid glucose'] },
  { name:'Wingreens Farms Hummus', brand:'Wingreens', barcode:'8906065121212', category:'Sauces', servingSize:'100g', sugarG:2, calories:240, carbs:14, fat:18, protein:6, hiddenSugars:[] },
  { name:'Del Monte Canned Pineapple', brand:'Del Monte', barcode:'8901502121215', category:'Packaged Foods', servingSize:'100g', sugarG:20, calories:80, carbs:20, fat:0, protein:0, hiddenSugars:['Cane sugar syrup'] },
  { name:'Safal Frozen Peas', brand:'Mother Dairy', barcode:'8906002801217', category:'Packaged Foods', servingSize:'100g', sugarG:4, calories:80, carbs:14, fat:0, protein:5, hiddenSugars:[] },
  { name:'Protinex Chocolate', brand:'Danone', barcode:'8901049121214', category:'Health', servingSize:'100g', sugarG:28, calories:370, carbs:50, fat:1, protein:34, hiddenSugars:['Sucrose','Malt extract'] },
  { name:'Aashirvaad Whole Wheat Atta', brand:'ITC', barcode:'8901554121219', category:'Pantry', servingSize:'100g', sugarG:2, calories:360, carbs:73, fat:2, protein:12, hiddenSugars:[] },
  { name:'Daawat Basmati Rice', brand:'LT Foods', barcode:'8901537001214', category:'Pantry', servingSize:'100g', sugarG:0, calories:350, carbs:78, fat:1, protein:8, hiddenSugars:[] },
  { name:'Nutrela Soya Chunks', brand:'Patanjali', barcode:'8906040101240', category:'Pantry', servingSize:'100g', sugarG:0, calories:345, carbs:33, fat:1, protein:52, hiddenSugars:[] },
  { name:'Smith & Jones Pasta Masala', brand:'Capital Foods', barcode:'8901595851236', category:'Spices', servingSize:'10g', sugarG:2, calories:30, carbs:5, fat:1, protein:1, hiddenSugars:['Maltodextrin'] },
  { name:'Happilo Almonds Raw', brand:'Happilo', barcode:'8906081212120', category:'Snacks', servingSize:'100g', sugarG:4, calories:580, carbs:22, fat:50, protein:21, hiddenSugars:[] },
  { name:'Parle-G Original Gluco Biscuits', brand:'Parle Products', barcode:'8901719110024', category:'Biscuits', servingSize:'100g', sugarG:28, calories:462, carbs:76, fat:11, protein:7, hiddenSugars:['Dextrose','Refined wheat flour'] },
  { name:'Good Day Cashew Biscuits', brand:'Britannia', barcode:'8901063000038', category:'Biscuits', servingSize:'75g', sugarG:18, calories:370, carbs:55, fat:15, protein:5, hiddenSugars:[] },
  { name:'Bourbon Chocolate Biscuits', brand:'Britannia', barcode:'8901063001172', category:'Biscuits', servingSize:'80g', sugarG:22, calories:390, carbs:60, fat:14, protein:5, hiddenSugars:['Cocoa powder','Dextrose'] },
  { name:'Hide & Seek Fab Biscuits', brand:'Parle', barcode:'8901719011025', category:'Biscuits', servingSize:'80g', sugarG:20, calories:400, carbs:60, fat:14, protein:5, hiddenSugars:['Maltose'] },
  { name:'Marie Gold Biscuits', brand:'Britannia', barcode:'8901063001165', category:'Biscuits', servingSize:'100g', sugarG:16, calories:420, carbs:74, fat:9, protein:8, hiddenSugars:[] },
  { name:'Digestive Nutri Choice', brand:'Britannia', barcode:'8901063001189', category:'Biscuits', servingSize:'75g', sugarG:12, calories:330, carbs:52, fat:11, protein:6, hiddenSugars:[] },
  // Beverages
  { name:'Frooti Mango Drink 200ml', brand:'Parle Agro', barcode:'8901054000121', category:'Beverages', servingSize:'200ml', sugarG:22, calories:96, carbs:24, fat:0, protein:0, hiddenSugars:['Fructose','Concentrated mango pulp'] },
  { name:'Maaza Mango Drink 250ml', brand:'Coca-Cola India', barcode:'8901072010047', category:'Beverages', servingSize:'250ml', sugarG:25, calories:110, carbs:28, fat:0, protein:0, hiddenSugars:['High-fructose corn syrup'] },
  { name:'Amul Kool Café 200ml', brand:'Amul', barcode:'8901088000041', category:'Beverages', servingSize:'200ml', sugarG:20, calories:122, carbs:22, fat:3, protein:4, hiddenSugars:['Sucrose','Fructose corn syrup'] },
  { name:'Paperboat Aamras 200ml', brand:'Hector Beverages', barcode:'8906038700010', category:'Beverages', servingSize:'200ml', sugarG:19, calories:88, carbs:22, fat:0, protein:0, hiddenSugars:['Cane sugar'] },
  { name:'Real Fruit Power Orange', brand:'Dabur', barcode:'8901207075155', category:'Beverages', servingSize:'200ml', sugarG:18, calories:85, carbs:21, fat:0, protein:0, hiddenSugars:['Maltodextrin'] },
  // Snacks
  { name:'Kurkure Masala Munch 50g', brand:'PepsiCo India', barcode:'8901491100016', category:'Snacks', servingSize:'50g', sugarG:2, calories:264, carbs:32, fat:14, protein:4, hiddenSugars:[] },
  { name:"Haldiram's Aloo Bhujia 200g", brand:"Haldiram's", barcode:'8906004320012', category:'Snacks', servingSize:'50g', sugarG:1, calories:267, carbs:30, fat:15, protein:5, hiddenSugars:[] },
  { name:'Bingo! Mad Angles Achaari Masti', brand:'ITC', barcode:'8901554010049', category:'Snacks', servingSize:'50g', sugarG:3, calories:255, carbs:34, fat:12, protein:4, hiddenSugars:[] },
  { name:'Lays Classic Salted 50g', brand:'PepsiCo India', barcode:'8901491400013', category:'Snacks', servingSize:'50g', sugarG:1, calories:270, carbs:28, fat:17, protein:3, hiddenSugars:[] },
  { name:'Uncle Chipps Spicy Treat', brand:'PepsiCo India', barcode:'8901491600011', category:'Snacks', servingSize:'50g', sugarG:2, calories:265, carbs:30, fat:15, protein:3, hiddenSugars:[] },
  // Noodles
  { name:'Maggi 2-Minute Masala Noodles 70g', brand:'Nestlé India', barcode:'8901058000058', category:'Noodles', servingSize:'70g', sugarG:3, calories:316, carbs:45, fat:12, protein:7, hiddenSugars:['Maltodextrin'] },
  { name:'Yippee! Magic Masala Noodles', brand:'ITC', barcode:'8901554500143', category:'Noodles', servingSize:'70g', sugarG:2, calories:300, carbs:44, fat:11, protein:7, hiddenSugars:[] },
  { name:'Top Ramen Curry Noodles', brand:'Nissin India', barcode:'8901765000033', category:'Noodles', servingSize:'70g', sugarG:4, calories:310, carbs:46, fat:11, protein:7, hiddenSugars:['Caramel colour'] },
  { name:'Patanjali Atta Noodles', brand:'Patanjali', barcode:'8906040100014', category:'Noodles', servingSize:'70g', sugarG:2, calories:280, carbs:48, fat:7, protein:9, hiddenSugars:[] },
  // Dairy
  { name:'Amul Dahi 200g', brand:'Amul', barcode:'8901088900037', category:'Dairy', servingSize:'200g', sugarG:6, calories:120, carbs:10, fat:5, protein:8, hiddenSugars:[] },
  { name:'Mother Dairy Sweet Lassi 200ml', brand:'Mother Dairy', barcode:'8906002800012', category:'Dairy', servingSize:'200ml', sugarG:18, calories:130, carbs:22, fat:3, protein:5, hiddenSugars:['Sucrose'] },
  { name:'Yakult Probiotic Drink 65ml', brand:'Yakult Danone', barcode:'8901049000013', category:'Dairy', servingSize:'65ml', sugarG:11, calories:50, carbs:12, fat:0, protein:1, hiddenSugars:['Dextrose'] },
  { name:'Amul Flavoured Milk Kesar 200ml', brand:'Amul', barcode:'8901088900099', category:'Dairy', servingSize:'200ml', sugarG:22, calories:148, carbs:24, fat:4, protein:6, hiddenSugars:['Sucrose','Flavouring agents'] },
  // Sauces
  { name:'Maggi Tomato Ketchup 500g', brand:'Nestlé India', barcode:'8901058000545', category:'Sauces', servingSize:'30g', sugarG:6, calories:28, carbs:7, fat:0, protein:0, hiddenSugars:['Corn syrup','Dextrose'] },
  { name:'Kissan Tomato Ketchup 500g', brand:'HUL', barcode:'8901030010055', category:'Sauces', servingSize:'30g', sugarG:7, calories:30, carbs:7, fat:0, protein:0, hiddenSugars:['Inverted sugar syrup'] },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Seed products
    await Product.deleteMany({});
    const created = await Product.insertMany(products);
    console.log(`✅ Seeded ${created.length} products`);

    // Create demo user
    await User.deleteMany({ email: 'demo@sugarwatch.in' });
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash('demo123', salt);
    await User.create({
      name: 'Demo User',
      email: 'demo@sugarwatch.in',
      password: hashed,
      dailyLimit: 25
    });
    console.log('✅ Demo user created — demo@sugarwatch.in / demo123');

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
