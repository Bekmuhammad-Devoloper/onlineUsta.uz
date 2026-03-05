// Kategoriya nomiga mos GIF icon mapping
// Public papkadagi GIF fayllar bilan kategoriyalarni bog'lash

const categoryGifs: Record<string, string> = {
  "Santexnika": "/plumber.gif",
  "Elektrik": "/electric.gif",
  "Duradgor": "/carpentry.gif",
  "Konditsioner": "/air-conditioner.gif",
  "Qurilish": "/encryption.gif",
  "Bo'yoqchi": "/paint-roller.gif",
  "Gazchi": "/gas worker.gif",
  "Uy ta'mirlash": "/home repair.gif",
  "Deraza o'rnatish": "/window installation.gif",
  "Tom yopish": "/roofing.gif",
  "Plitka yotqizish": "/laying tiles.gif",
  "Gipsokarton": "/plasterboard.gif",
  "Suvoq ishlari": "/trowel.gif",
  "Pol yotqizish": "/floor laying.gif",
  "Issiqlik tizimi": "/heating system.gif",
  "Eshik o'rnatish": "/carpentry.gif",
  "Suv tozalash": "/water purification.gif",
  "Kamera o'rnatish": "/camera installation.gif",
  "Devor qog'ozi": "/wallpaper.gif",
  "Parda o'rnatish": "/curtain installation.gif",
  "Payvandlash": "/welding.gif",
  "Loyiha va smeta": "/project and estimate.gif",
  "Hovuz qurilishi": "/pool pennies.gif",
  "Maishiy texnika": "/home-appliance.gif",
  "Tozalash": "/cleaning.gif",
  "Kalit usta": "/encryption.gif",
  "Dezinfeksiya": "/cleaning.gif",
  "Mebel yig'ish": "/carpentry.gif",
  "Ko'chirish": "/home repair.gif",
  "Lift ta'mirlash": "/home repair.gif",
  "Internet va tarmoq": "/camera installation.gif",
  "Kompyuter ta'mirlash": "/home-appliance.gif",
  "Telefon ta'mirlash": "/home-appliance.gif",
  "Avtomobil ta'mirlash": "/home repair.gif",
  "Bog' ishlari": "/cleaning.gif",
};

export function getCategoryGif(name: string): string {
  return categoryGifs[name] || "/home repair.gif";
}

export default categoryGifs;
