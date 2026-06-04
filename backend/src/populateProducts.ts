import { prisma } from './lib/prisma';

const products = [
  {
    name: "Nike Air Max Limited Edition",
    description: "Exclusive limited edition Air Max sneakers with premium materials",
    price: 249.99,
    totalStock: 50,
    availableStock: 50
  },
  {
    name: "Adidas Yeezy Boost 350",
    description: "Highly sought-after Yeezy Boost 350 in exclusive colorway",
    price: 299.99,
    totalStock: 25,
    availableStock: 25
  },
  {
    name: "Jordan Retro 4 Limited",
    description: "Classic Jordan Retro 4 in limited edition colorway",
    price: 219.99,
    totalStock: 35,
    availableStock: 35
  },
  {
    name: "New Balance 990v5",
    description: "Premium made in USA New Balance sneakers",
    price: 189.99,
    totalStock: 40,
    availableStock: 40
  },

  {
    name: "Rolex Submariner Limited",
    description: "Limited edition Rolex Submariner with ceramic bezel",
    price: 12500.00,
    totalStock: 5,
    availableStock: 5
  },
  {
    name: "Omega Speedmaster Professional",
    description: "Moonwatch professional chronograph",
    price: 6800.00,
    totalStock: 10,
    availableStock: 10
  },
  {
    name: "Apple Watch Ultra 2",
    description: "Limited edition titanium smartwatch",
    price: 799.99,
    totalStock: 100,
    availableStock: 100
  },
  {
    name: "G-Shock x Mastermind",
    description: "Collaboration limited edition G-Shock",
    price: 450.00,
    totalStock: 75,
    availableStock: 75
  },

  {
    name: "Sony PlayStation 5 Limited",
    description: "Limited edition PS5 with exclusive controller",
    price: 699.99,
    totalStock: 30,
    availableStock: 30
  },
  {
    name: "Xbox Series X Halo Edition",
    description: "Limited Halo Infinite edition console",
    price: 649.99,
    totalStock: 25,
    availableStock: 25
  },
  {
    name: "Apple iPhone 15 Pro Max",
    description: "Limited edition titanium iPhone",
    price: 1499.99,
    totalStock: 100,
    availableStock: 100
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description: "Premium Android flagship with AI features",
    price: 1299.99,
    totalStock: 80,
    availableStock: 80
  },
  {
    name: "Sony WH-1000XM5 Headphones",
    description: "Industry-leading noise cancellation headphones",
    price: 399.99,
    totalStock: 150,
    availableStock: 150
  },
  {
    name: "Bose QuietComfort Ultra",
    description: "Premium noise cancelling headphones with spatial audio",
    price: 429.99,
    totalStock: 120,
    availableStock: 120
  },

  {
    name: "Banksy Limited Print",
    description: "Signed limited edition Banksy artwork",
    price: 5500.00,
    totalStock: 3,
    availableStock: 3
  },
  {
    name: "KAWS Companion Figure",
    description: "Limited edition KAWS companion collectible",
    price: 1250.00,
    totalStock: 20,
    availableStock: 20
  },
  {
    name: "Supreme x Louis Vuitton Hoodie",
    description: "Rare collaboration streetwear piece",
    price: 2800.00,
    totalStock: 15,
    availableStock: 15
  },
  {
    name: "Magic: The Gathering Beta Booster",
    description: "Sealed Beta booster pack - highly collectible",
    price: 12500.00,
    totalStock: 2,
    availableStock: 2
  },

  {
    name: "RTX 4090 Limited Edition",
    description: "Limited edition graphics card with unique design",
    price: 1999.99,
    totalStock: 50,
    availableStock: 50
  },
  {
    name: "Steam Deck OLED Limited",
    description: "Limited edition handheld gaming PC",
    price: 649.99,
    totalStock: 60,
    availableStock: 60
  },

  {
    name: "Gucci x Adidas Sneakers",
    description: "Luxury collaboration sneakers",
    price: 1250.00,
    totalStock: 30,
    availableStock: 30
  },
  {
    name: "Louis Vuitton Keepall Bag",
    description: "Limited edition travel bag",
    price: 2850.00,
    totalStock: 10,
    availableStock: 10
  },
  {
    name: "Chanel Classic Flap Bag",
    description: "Limited edition classic handbag",
    price: 8800.00,
    totalStock: 8,
    availableStock: 8
  },
  {
    name: "Supreme Box Logo Hoodie",
    description: "Highly sought-after streetwear hoodie",
    price: 450.00,
    totalStock: 50,
    availableStock: 50
  },

  {
    name: "Tiffany & Co. Necklace",
    description: "Limited edition diamond necklace",
    price: 4500.00,
    totalStock: 15,
    availableStock: 15
  },
  {
    name: "Cartier Love Bracelet",
    description: "Iconic love bracelet in limited edition",
    price: 7200.00,
    totalStock: 12,
    availableStock: 12
  }
];

async function populateProducts() {
  console.log('=== Starting product population ===');
  console.log(`Total products to create: ${products.length}`);
  
  let created = 0;
  let skipped = 0;

  for (const product of products) {
    try {
      const existing = await prisma.product.findFirst({
        where: { name: product.name }
      });

      if (existing) {
        console.log(`⏭️ Skipping existing product: ${product.name}`);
        skipped++;
        continue;
      }

      await prisma.product.create({
        data: product
      });
      
      console.log(`✅ Created product: ${product.name} - $${product.price} - Stock: ${product.totalStock}`);
      created++;
    } catch (error) {
      console.error(`❌ Failed to create product: ${product.name}`, error);
    }
  }

  console.log('\n=== Population Summary ===');
  console.log(`✅ Created: ${created} products`);
  console.log(`⏭️ Skipped: ${skipped} products (already exist)`);
  console.log(`📊 Total products in database: ${await prisma.product.count()}`);
  
  const priceStats = await prisma.product.aggregate({
    _min: { price: true },
    _max: { price: true },
    _avg: { price: true }
  });
  
  console.log('\n💰 Price Statistics:');
  console.log(`   Min Price: $${priceStats._min.price?.toFixed(2)}`);
  console.log(`   Max Price: $${priceStats._max.price?.toFixed(2)}`);
  console.log(`   Avg Price: $${priceStats._avg.price?.toFixed(2)}`);
  
  const stockStats = await prisma.product.aggregate({
    _sum: { totalStock: true },
    _avg: { totalStock: true }
  });
  
  console.log('\n📦 Stock Statistics:');
  console.log(`   Total Units: ${stockStats._sum.totalStock}`);
  console.log(`   Avg Stock per Product: ${Math.round(stockStats._avg.totalStock || 0)}`);
  
  const cheapProducts = await prisma.product.count({
    where: { price: { lt: 200 } }
  });
  const mediumProducts = await prisma.product.count({
    where: { price: { gte: 200, lt: 500 } }
  });
  const expensiveProducts = await prisma.product.count({
    where: { price: { gte: 500, lt: 1000 } }
  });
  const luxuryProducts = await prisma.product.count({
    where: { price: { gte: 1000 } }
  });
  
  console.log('\n📊 Price Distribution:');
  console.log(`   Budget (<$200): ${cheapProducts} products`);
  console.log(`   Mid ($200-$500): ${mediumProducts} products`);
  console.log(`   Premium ($500-$1000): ${expensiveProducts} products`);
  console.log(`   Luxury (>$1000): ${luxuryProducts} products`);
}

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
    
    await populateProducts();
    
  } catch (error) {
    console.error('Error populating products:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n✅ Database disconnected');
  }
}

main();