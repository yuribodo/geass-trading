/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Starting seed...');

  console.log('👤 Creating sample users...');

  const hashedPassword = await bcrypt.hash('admin123', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@geass.dev' },
    update: {},
    create: {
      email: 'admin@geass.dev',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
    },
  });

  console.log(`✅ Created user: ${adminUser.email}`);

  console.log('📈 Creating sample market data...');

  const marketDataSamples = [
    {
      time: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      symbol: 'BTCUSDT',
      open: 50000.0,
      high: 50100.0,
      low: 49900.0,
      close: 50050.0,
      volume: 1.5,
    },
    {
      time: new Date(Date.now() - 59 * 60 * 1000), // 59 minutes ago
      symbol: 'BTCUSDT',
      open: 50050.0,
      high: 50200.0,
      low: 50000.0,
      close: 50150.0,
      volume: 2.1,
    },
    {
      time: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      symbol: 'ETHUSDT',
      open: 3000.0,
      high: 3020.0,
      low: 2990.0,
      close: 3010.0,
      volume: 5.5,
    },
  ];

  for (const data of marketDataSamples) {
    await prisma.marketData.upsert({
      where: {
        time_symbol: {
          time: data.time,
          symbol: data.symbol,
        },
      },
      update: {},
      create: data,
    });
  }

  console.log(`✅ Created ${marketDataSamples.length} market data entries`);

  console.log('💰 Creating sample price updates...');

  const priceUpdates = [
    { symbol: 'BTCUSDT', price: 50175.5 },
    { symbol: 'ETHUSDT', price: 3015.25 },
    { symbol: 'ADAUSDT', price: 0.45 },
  ];

  for (const update of priceUpdates) {
    await prisma.priceUpdate.create({
      data: update,
    });
  }

  console.log(`✅ Created ${priceUpdates.length} price updates`);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
