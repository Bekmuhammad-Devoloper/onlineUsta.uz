import { PrismaClient, UserRole, UserStatus, SubscriptionType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // ===== Clean existing data =====
  await prisma.notification.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.geoLog.deleteMany();
  await prisma.deviceChangeRequest.deleteMany();
  await prisma.master.deleteMany();
  await prisma.otpCode.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
  await prisma.platformSettings.deleteMany();

  console.log('Cleaned existing data');

  // ===== Seed categories (35 categories) =====
  const catData = [
    { name: 'Santexnika', nameUz: 'Santexnika', nameRu: 'Сантехника', icon: '🚰', description: 'Truba ta\'mirlash, kran o\'rnatish, kanalizatsiya tozalash, suv ta\'minoti tizimlarini o\'rnatish va ta\'mirlash xizmatlari.' },
    { name: 'Elektrik', nameUz: 'Elektrik', nameRu: 'Электрика', icon: '⚡', description: 'Simlarni tortish, rozetka va vykluchatel o\'rnatish, elektr panellarni ta\'mirlash, LED yoritgichlar o\'rnatish.' },
    { name: 'Duradgor', nameUz: 'Duradgor', nameRu: 'Столяр', icon: '🪚', description: 'Mebel yasash va ta\'mirlash, eshik o\'rnatish, deraza ta\'mirlash, yog\'och ishlar bo\'yicha barcha xizmatlar.' },
    { name: 'Konditsioner', nameUz: 'Konditsioner', nameRu: 'Кондиционер', icon: '❄️', description: 'Konditsioner o\'rnatish, tozalash, freon to\'ldirish, ta\'mirlash va texnik xizmat ko\'rsatish.' },
    { name: 'Qurilish', nameUz: 'Qurilish', nameRu: 'Строительство', icon: '🏗️', description: 'Uy qurish, ta\'mirlash ishlari, g\'isht terish, suvoq ishlari, tom yopish va boshqa qurilish xizmatlari.' },
    { name: 'Bo\'yoqchi', nameUz: 'Bo\'yoqchi', nameRu: 'Маляр', icon: '🎨', description: 'Devor bo\'yash, shpaklyovka, oboi yopish, dekorativ bo\'yoq ishlari va fasad bo\'yash xizmatlari.' },
    { name: 'Maishiy texnika', nameUz: 'Maishiy texnika', nameRu: 'Бытовая техника', icon: '📺', description: 'Kir yuvish mashinasi, muzlatgich, pech, televizor va boshqa maishiy texnikalarni ta\'mirlash.' },
    { name: 'Tozalash', nameUz: 'Tozalash', nameRu: 'Уборка', icon: '🧹', description: 'Uy tozalash, ofis tozalash, oyna yuvish, gilamlarni tozalash va boshqa tozalash xizmatlari.' },
    { name: 'Kalit usta', nameUz: 'Kalit usta', nameRu: 'Слесарь', icon: '🔑', description: 'Eshik qulflarini ochish, kalit yasash, qulf almashtirish, seyflarni ochish xizmatlari.' },
    { name: 'Gazchi', nameUz: 'Gazchi', nameRu: 'Газовщик', icon: '🔥', description: 'Gaz plitasi o\'rnatish, gaz quvurlari ta\'mirlash, kotel o\'rnatish va gaz uskunalarini texnik xizmat.' },
    { name: 'Uy ta\'mirlash', nameUz: 'Uy ta\'mirlash', nameRu: 'Ремонт квартир', icon: '🏠', description: 'To\'liq uy ta\'mirlash, kosmetik ta\'mirlash, yevro remont, dizayn loyihalar bo\'yicha ta\'mirlash.' },
    { name: 'Deraza o\'rnatish', nameUz: 'Deraza o\'rnatish', nameRu: 'Установка окон', icon: '🪟', description: 'Plastik derazalar o\'rnatish, shisha almashtirish, deraza ta\'mirlash, balkon oynalash.' },
    { name: 'Tom yopish', nameUz: 'Tom yopish', nameRu: 'Кровля', icon: '🏚️', description: 'Tom yopish, tom ta\'mirlash, gidroizolyatsiya, suv oqishini to\'xtatish xizmatlari.' },
    { name: 'Plitka yotqizish', nameUz: 'Plitka yotqizish', nameRu: 'Укладка плитки', icon: '🧱', description: 'Pol va devorga plitka yotqizish, mozaika ishlari, granit va marmar o\'rnatish.' },
    { name: 'Gipsokarton', nameUz: 'Gipsokarton', nameRu: 'Гипсокартон', icon: '📐', description: 'Gipsokarton devorlar, shiftlar, archa va nishalar yasash, dekorativ gips ishlari.' },
    { name: 'Suvoq ishlari', nameUz: 'Suvoq ishlari', nameRu: 'Штукатурка', icon: '🪣', description: 'Devorlarni suvoqlash, dekorativ suvoq, fasad suvoqi, mexanizatsiyalashgan suvoq.' },
    { name: 'Pol yotqizish', nameUz: 'Pol yotqizish', nameRu: 'Укладка пола', icon: '🪵', description: 'Laminat, parket, linoleum, kovrolin yotqizish, pol tekislash (styajka) ishlari.' },
    { name: 'Mebel yig\'ish', nameUz: 'Mebel yig\'ish', nameRu: 'Сборка мебели', icon: '🛋️', description: 'Yangi mebel yig\'ish, mebel buzish va ko\'chirish, mebel ta\'mirlash xizmatlari.' },
    { name: 'Ko\'chirish', nameUz: 'Ko\'chirish', nameRu: 'Переезд', icon: '🚚', description: 'Uy va ofis ko\'chirish, mebel tashish, yuklarni xavfsiz ko\'chirish xizmatlari.' },
    { name: 'Issiqlik tizimi', nameUz: 'Issiqlik tizimi', nameRu: 'Отопление', icon: '♨️', description: 'Isitish tizimlari o\'rnatish, radiatorlar almashtirish, pol isitish, kotel ta\'mirlash.' },
    { name: 'Eshik o\'rnatish', nameUz: 'Eshik o\'rnatish', nameRu: 'Установка дверей', icon: '🚪', description: 'Kirish va ichki eshiklar o\'rnatish, eshik ta\'mirlash, darvoza o\'rnatish.' },
    { name: 'Suv tozalash', nameUz: 'Suv tozalash', nameRu: 'Очистка воды', icon: '💧', description: 'Suv filtrlarini o\'rnatish, suv tozalash tizimlarini o\'rnatish va texnik xizmat.' },
    { name: 'Kamera o\'rnatish', nameUz: 'Kamera o\'rnatish', nameRu: 'Видеонаблюдение', icon: '📹', description: 'Kuzatuv kameralari o\'rnatish, domofon o\'rnatish, xavfsizlik tizimlari sozlash.' },
    { name: 'Internet va tarmoq', nameUz: 'Internet va tarmoq', nameRu: 'Интернет и сети', icon: '🌐', description: 'Internet ulanish, Wi-Fi o\'rnatish, tarmoq kabellash, server sozlash.' },
    { name: 'Kompyuter ta\'mirlash', nameUz: 'Kompyuter ta\'mirlash', nameRu: 'Ремонт компьютеров', icon: '💻', description: 'Kompyuter va noutbuk ta\'mirlash, dastur o\'rnatish, virus tozalash.' },
    { name: 'Telefon ta\'mirlash', nameUz: 'Telefon ta\'mirlash', nameRu: 'Ремонт телефонов', icon: '📱', description: 'Smartfon ta\'mirlash, ekran almashtirish, batareya almashtirish xizmatlari.' },
    { name: 'Avtomobil ta\'mirlash', nameUz: 'Avtomobil ta\'mirlash', nameRu: 'Автосервис', icon: '🚗', description: 'Avto ta\'mirlash, moy almashtirish, diagnostika, shinomontaj xizmatlari.' },
    { name: 'Bog\' ishlari', nameUz: 'Bog\' ishlari', nameRu: 'Садовые работы', icon: '🌿', description: 'Bog\' parvarishlash, landshaft dizayn, o\'t o\'rish, daraxt kesish.' },
    { name: 'Hovuz qurilishi', nameUz: 'Hovuz qurilishi', nameRu: 'Строительство бассейнов', icon: '🏊', description: 'Hovuz qurish, hovuz ta\'mirlash, suv tozalash tizimlari, hammom ishlari.' },
    { name: 'Lift ta\'mirlash', nameUz: 'Lift ta\'mirlash', nameRu: 'Ремонт лифтов', icon: '🛗', description: 'Lift o\'rnatish, lift ta\'mirlash, lift texnik xizmat ko\'rsatish.' },
    { name: 'Devor qog\'ozi', nameUz: 'Devor qog\'ozi', nameRu: 'Поклейка обоев', icon: '🖼️', description: 'Oboi yopishtirish, devor qog\'ozi tanlash, eski oboini olib tashlash.' },
    { name: 'Parda o\'rnatish', nameUz: 'Parda o\'rnatish', nameRu: 'Шторы и карнизы', icon: '🪄', description: 'Parda karnizlari o\'rnatish, parda tikish, parda o\'rnatish xizmatlari.' },
    { name: 'Payvandlash', nameUz: 'Payvandlash', nameRu: 'Сварочные работы', icon: '⚒️', description: 'Payvandlash, metall kesish, to\'r yasash, darvoza, panjara yasash.' },
    { name: 'Loyiha va smeta', nameUz: 'Loyiha va smeta', nameRu: 'Замеры и сметы', icon: '📏', description: 'Uy o\'lchovlarini olish, loyiha tuzish, smeta hisoblash, 3D vizualizatsiya.' },
    { name: 'Dezinfeksiya', nameUz: 'Dezinfeksiya', nameRu: 'Дезинсекция', icon: '�', description: 'Hasharotlarni yo\'qotish, sichqon va kalamushlarni yo\'qotish, dezinfeksiya.' },
  ];

  const categories = await Promise.all(
    catData.map((cat, i) =>
      prisma.category.create({
        data: { ...cat, order: i + 1 },
      })
    )
  );

  console.log('Categories created:', categories.length);

  // ===== Seed platform settings =====
  const settings = await Promise.all([
    prisma.platformSettings.create({
      data: {
        key: 'platform_commission',
        value: '12',
        description: 'Platform commission percentage',
      },
    }),
    prisma.platformSettings.create({
      data: {
        key: 'daily_subscription_price',
        value: '10000',
        description: 'Daily subscription price in UZS',
      },
    }),
    prisma.platformSettings.create({
      data: {
        key: 'weekly_subscription_price',
        value: '50000',
        description: 'Weekly subscription price in UZS',
      },
    }),
    prisma.platformSettings.create({
      data: {
        key: 'monthly_subscription_price',
        value: '150000',
        description: 'Monthly subscription price in UZS',
      },
    }),
    prisma.platformSettings.create({
      data: {
        key: 'penalty_amount',
        value: '50000',
        description: 'Penalty amount for excessive cancellations in UZS',
      },
    }),
    prisma.platformSettings.create({
      data: {
        key: 'weekly_cancellation_limit',
        value: '4',
        description: 'Maximum cancellations per week before penalty',
      },
    }),
    prisma.platformSettings.create({
      data: {
        key: 'monthly_cancellation_limit',
        value: '12',
        description: 'Maximum cancellations per month before block',
      },
    }),
  ]);

  console.log('Platform settings created:', settings.length);

  // ===== Create ADMIN user =====
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin',
      phone: '+998900000001',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      location: 'Toshkent',
    },
  });
  console.log('✅ Admin user created:', adminUser.phone);

  // ===== Create MASTER user =====
  const masterUser = await prisma.user.create({
    data: {
      name: 'Usta Karim',
      phone: '+998900000002',
      role: UserRole.MASTER,
      status: UserStatus.ACTIVE,
      location: 'Toshkent, Chilonzor',
    },
  });

  // Create Master profile
  await prisma.master.create({
    data: {
      userId: masterUser.id,
      categoryId: categories[0].id, // Santexnika
      bio: 'Tajribali santexnik usta. 10 yillik tajriba.',
      services: ['Truba ta\'mirlash', 'Kran o\'rnatish', 'Kanalizatsiya tozalash'],
      rating: 4.8,
      totalReviews: 25,
      totalOrders: 50,
      isVerified: true,
      isOnline: true,
      subscriptionType: SubscriptionType.MONTHLY,
      passportSeries: 'AA',
      passportNumber: '1234567',
      passportJSHIR: '12345678901234',
      bankCardNumber: '8600123456789012',
      bankCardHolder: 'KARIM KARIMOV',
      totalEarnings: 5000000,
      monthlyEarnings: 1200000,
    },
  });
  console.log('✅ Master user created:', masterUser.phone);

  // ===== Create regular USER =====
  const regularUser = await prisma.user.create({
    data: {
      name: 'Foydalanuvchi Ali',
      phone: '+998900000003',
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      location: 'Toshkent, Yunusobod',
    },
  });
  console.log('✅ Regular user created:', regularUser.phone);

  // ===== Summary =====
  console.log('\n========================================');
  console.log('  SEED COMPLETED SUCCESSFULLY!');
  console.log('========================================');
  console.log('');
  console.log('  TEST LOGIN CREDENTIALS:');
  console.log('  ─────────────────────────────────────');
  console.log('  👑 ADMIN panel:');
  console.log('     Phone: +998900000001');
  console.log('');
  console.log('  🔧 MASTER (Usta) panel:');
  console.log('     Phone: +998900000002');
  console.log('');
  console.log('  👤 USER (Foydalanuvchi) panel:');
  console.log('     Phone: +998900000003');
  console.log('  ─────────────────────────────────────');
  console.log('  SMS orqali OTP kod yuboriladi');
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
