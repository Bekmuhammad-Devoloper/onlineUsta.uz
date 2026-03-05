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

  // --- Yangi unique GIF fayllar (dublikat bo'lganlar o'rniga) ---
  "Qurilish": "/icons/construction.gif",           // Avval: encryption.gif (dublikat)
  "Eshik o'rnatish": "/icons/door.gif",             // Avval: carpentry.gif (dublikat)
  "Kalit usta": "/icons/key.gif",                   // Avval: encryption.gif (dublikat)
  "Dezinfeksiya": "/icons/disinfection.gif",         // Avval: cleaning.gif (dublikat)
  "Mebel yig'ish": "/icons/furniture.gif",           // Avval: carpentry.gif (dublikat)
  "Ko'chirish": "/icons/moving-truck.gif",           // Avval: home repair.gif (dublikat)
  "Lift ta'mirlash": "/icons/elevator.gif",          // Avval: home repair.gif (dublikat)
  "Internet va tarmoq": "/icons/wifi-network.gif",   // Avval: camera installation.gif (dublikat)
  "Kompyuter ta'mirlash": "/icons/computer-repair.gif", // Avval: home-appliance.gif (dublikat)
  "Telefon ta'mirlash": "/icons/phone-repair.gif",   // Avval: home-appliance.gif (dublikat)
  "Avtomobil ta'mirlash": "/icons/car-repair.gif",   // Avval: home repair.gif (dublikat)
  "Bog' ishlari": "/icons/gardening.gif",            // Avval: cleaning.gif (dublikat)
};

export function getCategoryGif(name: string): string {
  return categoryGifs[name] || "/icons/home-repair.gif";
}

export default categoryGifs;
