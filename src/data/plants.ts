import type { Plant } from '../types/plants'

// Türkiye'deki endemik bitkiler (gerçek verilerden derlenmiştir)
// Türkiye yaklaşık 3.000 endemik bitki türüne ev sahipliği yapmaktadır

export const plants: Plant[] = [
  // MARMARA BÖLGESİ
  {
    id: 'kazdagi-goknari',
    name: 'Kazdağı Göknarı',
    latinName: 'Abies nordmanniana subsp. equi-trojani',
    description: 'Sadece Kazdağları ve çevresinde yetişen, nesli tehlikede olan endemik bir göknar türü.',
    dominantRegions: ['marmara'],
    dominantProvinces: ['balikesir', 'canakkale'],
  },
  {
    id: 'galanthus-trojanus',
    name: 'Truva Kar Lalesi',
    latinName: 'Galanthus trojanus',
    description: 'Balıkesir ve Çanakkale\'de yetişen, ilkbaharda çiçeklenen nadir bir tür.',
    dominantRegions: ['marmara'],
    dominantProvinces: ['balikesir', 'canakkale'],
  },
  {
    id: 'crocus-pestalozzae',
    name: 'İstanbul Çiğdemi',
    latinName: 'Crocus pestalozzae',
    description: 'İstanbul, Kırklareli ve Tekirdağ\'da yetişen endemik çiğdem türü.',
    dominantRegions: ['marmara'],
    dominantProvinces: ['istanbul', 'kirklareli', 'tekirdag'],
  },

  // EGE BÖLGESİ
  {
    id: 'sigla-agaci',
    name: 'Sığla Ağacı',
    latinName: 'Liquidambar orientalis',
    description: 'Muğla ve Fethiye civarında yetişen, değerli reçinesi olan endemik ağaç.',
    dominantRegions: ['ege'],
    dominantProvinces: ['muğla', 'aydin'],
  },
  {
    id: 'datca-hurmasi',
    name: 'Datça Hurması',
    latinName: 'Diospyros mespiliformis',
    description: 'Sadece Datça yarımadasında yetişen endemik bir hurma türü.',
    dominantRegions: ['ege'],
    dominantProvinces: ['muğla'],
  },
  {
    id: 'crocus-mathewii',
    name: 'Mathew Çiğdemi',
    latinName: 'Crocus mathewii',
    description: 'Antalya, Denizli ve Muğla\'da yetişen nadir bir çiğdem türü.',
    dominantRegions: ['ege', 'akdeniz'],
    dominantProvinces: ['antalya', 'denizli', 'muğla'],
  },

  // AKDENİZ BÖLGESİ
  {
    id: 'antalya-cigdemi',
    name: 'Antalya Çiğdemi',
    latinName: 'Crocus wattiorum',
    description: 'Sadece Antalya\'da yetişen, çok nadir bir endemik çiğdem.',
    dominantRegions: ['akdeniz'],
    dominantProvinces: ['antalya'],
  },
  {
    id: 'iris-pamphylica',
    name: 'Pamfilya Süseni',
    latinName: 'Iris pamphylica',
    description: 'Antalya\'da yetişen, gösterişli çiçekleri olan endemik süsen.',
    dominantRegions: ['akdeniz'],
    dominantProvinces: ['antalya'],
  },
  {
    id: 'crocus-olivieri-istanbulensis',
    name: 'Olivier Çiğdemi',
    latinName: 'Crocus olivieri istanbulensis',
    description: 'İstanbul\'da yetişen, nesli tehlike altındaki endemik tür.',
    dominantRegions: ['marmara'],
    dominantProvinces: ['istanbul'],
  },

  // İÇ ANADOLU BÖLGESİ
  {
    id: 'kasnak-mesi',
    name: 'Kasnak Meşesi',
    latinName: 'Quercus vulcanica',
    description: 'Konya, Afyon, Isparta ve Kütahya\'da yetişen endemik meşe türü.',
    dominantRegions: ['icanadolu', 'ege'],
    dominantProvinces: ['konya', 'afyon', 'isparta', 'kutahya'],
  },
  {
    id: 'centaurea-tchihatcheffii',
    name: 'Tchihatcheff Papatyası',
    latinName: 'Centaurea tchihatcheffii',
    description: 'Ankara\'da yetişen, çok nadir ve koruma altındaki endemik papatya.',
    dominantRegions: ['icanadolu'],
    dominantProvinces: ['ankara'],
  },
  {
    id: 'thermopsis-turcica',
    name: 'Türk Thermopsis\'u',
    latinName: 'Thermopsis turcica',
    description: 'Sadece Konya\'da yetişen endemik baklagil türü.',
    dominantRegions: ['icanadolu'],
    dominantProvinces: ['konya'],
  },

  // KARADENİZ BÖLGESİ
  {
    id: 'kral-eğreltisi',
    name: 'Kral Eğreltisi',
    latinName: 'Osmunda regalis',
    description: 'Karadeniz bölgesinin nemli ormanlarında yetişen endemik eğrelti.',
    dominantRegions: ['karadeniz'],
    dominantProvinces: ['rize', 'trabzon', 'artvin'],
  },
  {
    id: 'crocus-ancyrensis',
    name: 'Ankara Çiğdemi',
    latinName: 'Crocus ancyrensis',
    description: 'Amasya, Ankara, Bolu, Çorum, Kastamonu, Kayseri, Kahramanmaraş, Samsun, Sivas, Yozgat\'ta yetişir.',
    dominantRegions: ['karadeniz', 'icanadolu'],
    dominantProvinces: ['amasya', 'ankara', 'bolu', 'corum', 'kastamonu', 'kayseri', 'kahramanmaras', 'samsun', 'sivas', 'yozgat'],
  },
  {
    id: 'quercus-macranthera',
    name: 'Sapsarı Meşe',
    latinName: 'Quercus macranthera syspirensis',
    description: 'Amasya, Ankara, Bolu, Çorum, Erzurum, Gümüşhane, Kastamonu, Sivas, Tunceli, Yozgat\'ta yetişir.',
    dominantRegions: ['karadeniz', 'icanadolu', 'doguanadolu'],
    dominantProvinces: ['amasya', 'ankara', 'bolu', 'corum', 'erzurum', 'gumushane', 'kastamonu', 'sivas', 'tunceli', 'yozgat'],
  },

  // DOĞU ANADOLU BÖLGESİ
  {
    id: 'ters-lale',
    name: 'Ters Lale',
    latinName: 'Fritillaria imperialis',
    description: 'Hakkâri ve Van bölgelerinde yetişen, gösterişli çiçekleri olan endemik lale.',
    dominantRegions: ['doguanadolu'],
    dominantProvinces: ['hakkari', 'van'],
  },
  {
    id: 'mus-lalesi',
    name: 'Muş Lalesi',
    latinName: 'Tulipa sylvestris',
    description: 'Muş\'ta yetişen, turistik değeri yüksek endemik lale türü.',
    dominantRegions: ['doguanadolu'],
    dominantProvinces: ['mus'],
  },
  {
    id: 'psephellus-aucherianus',
    name: 'Aucher Papatyası',
    latinName: 'Psephellus aucherianus',
    description: 'Erzincan ve Tunceli\'de yetişen endemik papatya türü.',
    dominantRegions: ['doguanadolu'],
    dominantProvinces: ['erzincan', 'tunceli'],
  },

  // GÜNEYDOĞU ANADOLU BÖLGESİ
  {
    id: 'allium-tuncelianum',
    name: 'Tunceli Sarımsağı',
    latinName: 'Allium tuncelianum',
    description: 'Tunceli\'de yetişen, genetik değeri yüksek endemik sarımsak türü.',
    dominantRegions: ['doguanadolu', 'guneydogu'],
    dominantProvinces: ['tunceli'],
  },
  {
    id: 'plantago-euphratica',
    name: 'Fırat Plantagonu',
    latinName: 'Plantago euphratica',
    description: 'Elazığ, Malatya, Sivas, Tunceli\'de yetişen endemik bitki.',
    dominantRegions: ['doguanadolu', 'guneydogu'],
    dominantProvinces: ['elazig', 'malatya', 'sivas', 'tunceli'],
  },
  {
    id: 'salvia-marashica',
    name: 'Maraş Adaçayı',
    latinName: 'Salvia marashica',
    description: 'Kahramanmaraş\'ta yetişen endemik adaçayı türü.',
    dominantRegions: ['guneydogu'],
    dominantProvinces: ['kahramanmaras'],
  },

  // ÇOK BÖLGELİ BİTKİLER
  {
    id: 'scorzonera-hieraciifolia',
    name: 'Sakallı Enginar',
    latinName: 'Scorzonera hieraciifolia',
    description: 'Aksaray, Ankara, Konya\'da yetişen endemik bitki.',
    dominantRegions: ['icanadolu'],
    dominantProvinces: ['aksaray', 'ankara', 'konya'],
  },
  {
    id: 'salvia-halophila',
    name: 'Tuzlu Adaçayı',
    latinName: 'Salvia halophila',
    description: 'Ankara, Konya, Aksaray\'da yetişen tuzlu topraklara adapte olmuş endemik.',
    dominantRegions: ['icanadolu'],
    dominantProvinces: ['ankara', 'konya', 'aksaray'],
  },
  {
    id: 'gladiolus-halophilus',
    name: 'Tuzlu Kılıçotu',
    latinName: 'Gladiolus halophilus',
    description: 'Aksaray, Ankara, Konya\'da yetişen tuzlu çayırlara özgü endemik.',
    dominantRegions: ['icanadolu'],
    dominantProvinces: ['aksaray', 'ankara', 'konya'],
  },
]
