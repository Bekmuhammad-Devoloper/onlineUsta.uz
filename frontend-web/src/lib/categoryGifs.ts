// Kategoriya nomiga mos GIF icon mapping
// Public papkadagi GIF fayllar bilan kategoriyalarni bog'lash
// Har bir kategoriyaga o'ziga xos (unique) animatsiyali icon
// Freepik.com dan animated iconlar yuklab olingan

const categoryGifs: Record<string, string> = {
  // --- Mavjud GIF fayllar (o'zgartirilmagan) ---
  "Santexnika": "/icons/plumber.gif",
  "Elektrik": "/icons/electric.gif",
  "Duradgor": "/icons/carpentry.gif",
  "Konditsioner": "/icons/air-conditioner.gif",
  "Bo'yoqchi": "/icons/paint-roller.gif",
  "Gazchi": "/icons/gas-worker.gif",
  "Uy ta'mirlash": "/icons/home-repair.gif",
  "Deraza o'rnatish": "/icons/window-installation.gif",
  "Tom yopish": "/icons/roofing.gif",
  "Plitka yotqizish": "/icons/laying-tiles.gif",
  "Gipsokarton": "/icons/plasterboard.gif",
  "Suvoq ishlari": "/icons/trowel.gif",
  "Pol yotqizish": "/icons/floor-laying.gif",
  "Issiqlik tizimi": "/icons/heating-system.gif",
  "Suv tozalash": "/icons/water-purification.gif",
  "Kamera o'rnatish": "/icons/camera-installation.gif",
  "Devor qog'ozi": "/icons/wallpaper.gif",
  "Parda o'rnatish": "/icons/curtain-installation.gif",
  "Payvandlash": "/icons/welding.gif",
  "Loyiha va smeta": "/icons/project-estimate.gif",
  "Hovuz qurilishi": "/icons/pool.gif",
  "Maishiy texnika": "/icons/home-appliance.gif",
  "Tozalash": "/icons/cleaning.gif",

  // --- Yangi unique GIF fayllar ---
  // Freepikdan yuklab /icons/ papkaga qo'yilgach, nomlarini almashtiring
  // Hozircha mavjud eng mos iconlar ishlatilmoqda
  "Qurilish": "/icons/encryption.gif",              // TODO: /icons/construction.gif yuklansin
  "Eshik o'rnatish": "/icons/carpentry.gif",         // TODO: /icons/door.gif yuklansin
  "Kalit usta": "/icons/encryption.gif",             // TODO: /icons/key.gif yuklansin
  "Dezinfeksiya": "/icons/cleaning.gif",             // TODO: /icons/disinfection.gif yuklansin
  "Mebel yig'ish": "/icons/carpentry.gif",           // TODO: /icons/furniture.gif yuklansin
  "Ko'chirish": "/icons/home-repair.gif",            // TODO: /icons/moving-truck.gif yuklansin
  "Lift ta'mirlash": "/icons/home-repair.gif",       // TODO: /icons/elevator.gif yuklansin
  "Internet va tarmoq": "/icons/camera-installation.gif", // TODO: /icons/wifi-network.gif yuklansin
  "Kompyuter ta'mirlash": "/icons/home-appliance.gif",    // TODO: /icons/computer-repair.gif yuklansin
  "Telefon ta'mirlash": "/icons/home-appliance.gif",      // TODO: /icons/phone-repair.gif yuklansin
  "Avtomobil ta'mirlash": "/icons/home-repair.gif",       // TODO: /icons/car-repair.gif yuklansin
  "Bog' ishlari": "/icons/cleaning.gif",             // TODO: /icons/gardening.gif yuklansin
};

export function getCategoryGif(name: string): string {
  return categoryGifs[name] || "/icons/home-repair.gif";
}

export default categoryGifs;
