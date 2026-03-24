require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Product = require('./models/Product');
const User = require('./models/User');

const products = [
  // Biscuits
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
