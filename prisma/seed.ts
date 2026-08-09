import { PrismaClient, UserTier, DiscountType, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Seed helpers
// ---------------------------------------------------------------------------

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

// ---------------------------------------------------------------------------
// Main seed
// ---------------------------------------------------------------------------

async function main() {
  console.log('🌙 Seeding OrbitStack database...');

  // ── Users ──────────────────────────────────────────────────────────────────
  const [alice, bob, carol, dave] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'alice@orbitstack.dev' },
      update: {},
      create: { email: 'alice@orbitstack.dev', name: 'Alice Nakamura', tier: UserTier.pro },
    }),
    prisma.user.upsert({
      where: { email: 'bob@orbitstack.dev' },
      update: {},
      create: { email: 'bob@orbitstack.dev', name: 'Bob Chen', tier: UserTier.standard },
    }),
    prisma.user.upsert({
      where: { email: 'carol@orbitstack.dev' },
      update: {},
      create: { email: 'carol@orbitstack.dev', name: 'Carol Singh', tier: UserTier.pro },
    }),
    prisma.user.upsert({
      where: { email: 'dave@orbitstack.dev' },
      update: {},
      create: { email: 'dave@orbitstack.dev', name: 'Dave Okafor', tier: UserTier.standard },
    }),
  ]);
  console.log('✓ Users seeded');

  // ── Discount codes ──────────────────────────────────────────────────────────
  const [, proship15] = await Promise.all([
    prisma.discountCode.upsert({
      where: { code: 'NEWUSER10' },
      update: {},
      create: {
        code: 'NEWUSER10',
        discountType: DiscountType.PERCENTAGE,
        value: 1000, // 10%
        stackableWithFreeShipping: false,
        minOrderAmountCents: 0,
      },
    }),
    prisma.discountCode.upsert({
      where: { code: 'PROSHIP15' },
      update: {},
      create: {
        code: 'PROSHIP15',
        discountType: DiscountType.PERCENTAGE,
        value: 1500, // 15%
        stackableWithFreeShipping: true,
        minOrderAmountCents: 0,
      },
    }),
    prisma.discountCode.upsert({
      where: { code: 'ORBIT25' },
      update: {},
      create: {
        code: 'ORBIT25',
        discountType: DiscountType.PERCENTAGE,
        value: 2500, // 25%
        stackableWithFreeShipping: false,
        minOrderAmountCents: 1000000, // ₹10,000 minimum
      },
    }),
    prisma.discountCode.upsert({
      where: { code: 'FLAT5OFF' },
      update: {},
      create: {
        code: 'FLAT5OFF',
        discountType: DiscountType.FIXED,
        value: 50000, // ₹500
        stackableWithFreeShipping: false,
        minOrderAmountCents: 0,
      },
    }),
    prisma.discountCode.upsert({
      where: { code: 'SAVE20' },
      update: {},
      create: {
        code: 'SAVE20',
        discountType: DiscountType.FIXED,
        value: 200000, // ₹2,000
        stackableWithFreeShipping: false,
        minOrderAmountCents: 500000, // ₹5,000 minimum
      },
    }),
  ]);
  console.log('✓ Discount codes seeded');

  // ── Products ────────────────────────────────────────────────────────────────
  // Note: products in the $25–$35 range are intentional so a Pro user can
  // easily build a $60+ cart within a minute (Task 1 repro path).
  const productData = [
    // Electronics
    { name: 'Lunar Wireless Earbuds', description: 'True wireless earbuds with moon-crater inspired ear tips. 28-hour battery life, active noise cancellation.', priceCents: 349900, category: 'electronics', stock: 42, imageUrl: '/images/products/lunar_wireless_earbuds_1786260260007.png' },
    { name: 'Eclipse Mechanical Keyboard', description: 'Compact TKL layout with tactile switches. Backlit with deep-space color profiles.', priceCents: 299900, category: 'electronics', stock: 27, imageUrl: '/images/products/eclipse_keyboard_1786260273316.png' },
    { name: 'Nova USB-C Hub', description: '7-in-1 hub with 4K HDMI, 100W PD, and SD card reader. Matte silver finish.', priceCents: 249900, category: 'electronics', stock: 63, imageUrl: '/images/products/nova_usb_hub_1786260289982.png' },
    { name: 'Orbit Pro Mouse', description: 'Precision optical mouse, 16000 DPI, ambidextrous design. Ships in void-black or lunar-white.', priceCents: 599900, category: 'electronics', stock: 18, imageUrl: '/images/products/orbit_pro_mouse_1786260304065.png' },
    { name: 'Crescent Monitor Stand', description: 'Adjustable aluminum stand with integrated USB-A pass-through ports.', priceCents: 449900, category: 'electronics', stock: 35, imageUrl: '/images/products/crescent_monitor_stand_1786260321730.png' },
    { name: 'Phase Shift Webcam', description: '4K 60fps webcam with ring light. Auto white-balance tuned for video calls.', priceCents: 899900, category: 'electronics', stock: 11, imageUrl: '/images/products/phase_shift_webcam_1786260337144.png' },
    // Apparel
    { name: 'Full Moon Hoodie', description: 'Heavyweight 400gsm fleece. Front-pocket moon-phase print. Unisex sizing.', priceCents: 649900, category: 'apparel', stock: 85, imageUrl: '/images/products/full_moon_hoodie_1786260368644.png' },
    { name: 'Waxing Crescent Tee', description: 'Ring-spun cotton, pre-shrunk. Subtle embroidered crescent on chest.', priceCents: 299900, category: 'apparel', stock: 112, imageUrl: '/images/products/waxing_crescent_tee_1786260384226.png' }
  ];

  const products = await Promise.all(
    productData.map((p) =>
      prisma.product.upsert({
        where: { id: p.name }, // We'll use name as temp lookup key
        update: { priceCents: p.priceCents, stock: p.stock },
        create: p,
      }).catch(() =>
        // upsert-by-name not supported directly; fall back to create
        prisma.product.create({ data: p })
      )
    )
  );
  console.log(`✓ ${products.length} products seeded`);

  // ── Historical orders (200+ for N+1 performance test) ───────────────────────
  // Spread across users and time. alice and carol are Pro, bob and dave Standard.
  const users = [alice, bob, carol, dave];
  const statuses = [
    OrderStatus.delivered,
    OrderStatus.delivered,
    OrderStatus.delivered,
    OrderStatus.shipped,
    OrderStatus.confirmed,
  ];

  let orderCount = 0;

  for (let i = 0; i < 220; i++) {
    const user = users[i % 4];
    const daysBack = randomBetween(1, 365);
    const orderDate = daysAgo(daysBack);
    const itemCount = randomBetween(1, 4);
    const selectedProducts = Array.from({ length: itemCount }, () => pickRandom(products));

    const items = selectedProducts.map((p) => ({
      productId: p.id,
      quantity: randomBetween(1, 3),
      priceAtPurchase: p.priceCents,
    }));

    const subtotalCents = items.reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0);

    // Simplified pricing for seed data (no discount codes applied)
    const shippingCents = user.tier === UserTier.pro && subtotalCents >= 500000 ? 0 : 89900;
    const totalCents = subtotalCents + shippingCents;

    await prisma.order.create({
      data: {
        userId: user.id,
        status: pickRandom(statuses),
        subtotalCents,
        discountCents: 0,
        shippingCents,
        totalCents,
        createdAt: orderDate,
        updatedAt: orderDate,
        items: {
          create: items,
        },
      },
    });

    orderCount++;
  }

  console.log(`✓ ${orderCount} historical orders seeded`);
  console.log('');
  console.log('🌙 Seed complete. Login accounts:');
  console.log('  alice@orbitstack.dev  (Pro tier)');
  console.log('  bob@orbitstack.dev    (Standard tier)');
  console.log('  carol@orbitstack.dev  (Pro tier)');
  console.log('  dave@orbitstack.dev   (Standard tier)');
  console.log('');
  console.log('Bug 1 repro: log in as alice, add Lunar Earbuds + Eclipse Keyboard to cart, apply PROSHIP15');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
