import { Destination } from '../types';

export const INTERESTS = [
  'Beaches',
  'Mountains',
  'Culture',
  'Food',
  'Adventure',
  'Nature',
  'Spiritual',
  'Nightlife',
  'History',
  'Shopping',
];

export const destinations: Destination[] = [
  {
    "id": "goa",
    "name": "Goa",
    "region": "Goa",
    "country": "India",
    "lat": 15.2993,
    "lon": 74.124,
    "emoji": "🏖️",
    "imageUrl": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#14B8C4",
      "#0E7C86"
    ],
    "rating": 4.8,
    "tags": [
      "Beaches",
      "Nightlife",
      "Food",
      "Culture"
    ],
    "bestSeason": "Nov - Feb",
    "avgDailyCost": 3500,
    "description": "Sun, golden sand and Portuguese-era heritage. Mixes lively beach shacks in the north with calm palm-fringed bays in the south.",
    "highlights": [
      "Baga & Calangute beaches",
      "Old Goa churches",
      "Dudhsagar Falls",
      "Fontainhas Latin Quarter"
    ],
    "climate": "Warm"
  },
  {
    "id": "manali",
    "name": "Manali",
    "region": "Himachal Pradesh",
    "country": "India",
    "lat": 32.2396,
    "lon": 77.1887,
    "emoji": "🏔️",
    "imageUrl": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#6C8EBF",
      "#3A5A8C"
    ],
    "rating": 4.7,
    "tags": [
      "Mountains",
      "Adventure",
      "Nature"
    ],
    "bestSeason": "Mar - Jun, Dec - Jan",
    "avgDailyCost": 3000,
    "description": "A Himalayan valley town known for snow peaks, pine forests, white-water river rafting and scenic mountain passes.",
    "highlights": [
      "Solang Valley",
      "Hadimba Temple",
      "Old Manali cafes",
      "Rohtang Pass (seasonal)"
    ],
    "climate": "Snow"
  },
  {
    "id": "jaipur",
    "name": "Jaipur",
    "region": "Rajasthan",
    "country": "India",
    "lat": 26.9124,
    "lon": 75.7873,
    "emoji": "🏰",
    "imageUrl": "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#F2994A",
      "#D9622B"
    ],
    "rating": 4.8,
    "tags": [
      "Culture",
      "Food",
      "History",
      "Shopping"
    ],
    "bestSeason": "Oct - Mar",
    "avgDailyCost": 3200,
    "description": "The Pink City of royalty: majestic hilltop forts, ornate palaces, colourful bazaars and rich traditional Rajasthani cuisine.",
    "highlights": [
      "Amber Fort",
      "City Palace",
      "Hawa Mahal",
      "Johari Bazaar"
    ],
    "climate": "Warm"
  },
  {
    "id": "kerala",
    "name": "Alleppey & Backwaters",
    "region": "Kerala",
    "country": "India",
    "lat": 9.4981,
    "lon": 76.3388,
    "emoji": "🌴",
    "imageUrl": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#3FB67C",
      "#1F7A52"
    ],
    "rating": 4.9,
    "tags": [
      "Nature",
      "Food",
      "Culture"
    ],
    "bestSeason": "Sep - Mar",
    "avgDailyCost": 3800,
    "description": "Glide on traditional thatched houseboats through emerald lagoons, coir villages and serene coconut-shaded backwaters.",
    "highlights": [
      "Alleppey houseboat cruise",
      "Vembanad Lake",
      "Marari Beach",
      "Ayurvedic wellness"
    ],
    "climate": "Warm"
  },
  {
    "id": "varanasi",
    "name": "Varanasi",
    "region": "Uttar Pradesh",
    "country": "India",
    "lat": 25.3176,
    "lon": 82.9739,
    "emoji": "🪔",
    "imageUrl": "https://images.unsplash.com/photo-1561359313-0639aad49ca6?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#E56B8A",
      "#B23A5E"
    ],
    "rating": 4.8,
    "tags": [
      "Spiritual",
      "Culture",
      "History"
    ],
    "bestSeason": "Oct - Mar",
    "avgDailyCost": 2200,
    "description": "One of the world’s oldest continuously inhabited cities, renowned for morning boat rides and evening Ganga Aarti along the ghats.",
    "highlights": [
      "Dashashwamedh Ghat",
      "Kashi Vishwanath Temple",
      "Sarnath",
      "Assi Ghat sunrise"
    ],
    "climate": "Warm"
  },
  {
    "id": "ladakh",
    "name": "Leh Ladakh",
    "region": "Ladakh",
    "country": "India",
    "lat": 34.1526,
    "lon": 77.5771,
    "emoji": "🗻",
    "imageUrl": "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#8E7CC3",
      "#5A4A9C"
    ],
    "rating": 4.9,
    "tags": [
      "Adventure",
      "Mountains",
      "Culture",
      "Nature"
    ],
    "bestSeason": "Jun - Sep",
    "avgDailyCost": 4200,
    "description": "High-altitude cold mountain desert with stark Moonland panoramas, ancient Buddhist monasteries, and crystal blue lakes.",
    "highlights": [
      "Pangong Tso",
      "Nubra Valley sand dunes",
      "Khardung La Pass",
      "Thiksey Monastery"
    ],
    "climate": "Snow"
  },
  {
    "id": "udaipur",
    "name": "Udaipur",
    "region": "Rajasthan",
    "country": "India",
    "lat": 24.5854,
    "lon": 73.7125,
    "emoji": "⛵",
    "imageUrl": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#3A7BD5",
      "#00D2FF"
    ],
    "rating": 4.8,
    "tags": [
      "Culture",
      "History",
      "Shopping",
      "Food"
    ],
    "bestSeason": "Oct - Mar",
    "avgDailyCost": 3600,
    "description": "The City of Lakes and Venice of the East, surrounded by the Aravali hills with floating island palaces and romantic sunsets.",
    "highlights": [
      "Lake Pichola boat ride",
      "City Palace",
      "Jag Mandir",
      "Saheliyon-ki-Bari"
    ],
    "climate": "Warm"
  },
  {
    "id": "agra",
    "name": "Agra",
    "region": "Uttar Pradesh",
    "country": "India",
    "lat": 27.1767,
    "lon": 78.0081,
    "emoji": "🏛️",
    "imageUrl": "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#E65C00",
      "#F9D423"
    ],
    "rating": 4.7,
    "tags": [
      "History",
      "Culture",
      "Shopping"
    ],
    "bestSeason": "Oct - Mar",
    "avgDailyCost": 2600,
    "description": "Home to the immortal white marble wonder Taj Mahal, alongside imposing red sandstone Mughal fortresses and artisan markets.",
    "highlights": [
      "Taj Mahal sunrise",
      "Agra Fort",
      "Fatehpur Sikri",
      "Mehtab Bagh"
    ],
    "climate": "Warm"
  },
  {
    "id": "rishikesh",
    "name": "Rishikesh",
    "region": "Uttarakhand",
    "country": "India",
    "lat": 30.0869,
    "lon": 78.2676,
    "emoji": "🧘",
    "imageUrl": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#11998E",
      "#38EF7D"
    ],
    "rating": 4.7,
    "tags": [
      "Adventure",
      "Spiritual",
      "Nature"
    ],
    "bestSeason": "Sep - Nov, Mar - May",
    "avgDailyCost": 2500,
    "description": "Yoga capital of the world located where holy Ganga emerges from the Himalayas, pairing peaceful ashrams with thrilling white-water rafting.",
    "highlights": [
      "River rafting & cliff jump",
      "Triveni Ghat Aarti",
      "Beatles Ashram",
      "Neelkanth Mahadev"
    ],
    "climate": "Cool"
  },
  {
    "id": "darjeeling",
    "name": "Darjeeling",
    "region": "West Bengal",
    "country": "India",
    "lat": 27.041,
    "lon": 88.2663,
    "emoji": "🚂",
    "imageUrl": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#2B5876",
      "#4E4376"
    ],
    "rating": 4.6,
    "tags": [
      "Mountains",
      "Nature",
      "Food"
    ],
    "bestSeason": "Mar - May, Oct - Dec",
    "avgDailyCost": 2800,
    "description": "Queen of the Hills nestled among emerald tea estates, famous for the UNESCO Toy Train and panoramic sunrises over Mount Kanchenjunga.",
    "highlights": [
      "Tiger Hill sunrise",
      "Darjeeling Himalayan Railway",
      "Happy Valley Tea Estate",
      "Batasia Loop"
    ],
    "climate": "Cool"
  },
  {
    "id": "hampi",
    "name": "Hampi",
    "region": "Karnataka",
    "country": "India",
    "lat": 15.335,
    "lon": 76.46,
    "emoji": "🪨",
    "imageUrl": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#F37335",
      "#FDC830"
    ],
    "rating": 4.8,
    "tags": [
      "History",
      "Culture",
      "Adventure"
    ],
    "bestSeason": "Oct - Mar",
    "avgDailyCost": 2400,
    "description": "Surreal boulder-strewn open-air museum preserving the grand ruins of the 14th-century Vijayanagara Empire along the Tungabhadra River.",
    "highlights": [
      "Virupaksha Temple",
      "Stone Chariot at Vittala Temple",
      "Matanga Hill sunset",
      "Coracle ride"
    ],
    "climate": "Warm"
  },
  {
    "id": "munnar",
    "name": "Munnar",
    "region": "Kerala",
    "country": "India",
    "lat": 10.0889,
    "lon": 77.0595,
    "emoji": "🍃",
    "imageUrl": "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#00B4DB",
      "#0083B0"
    ],
    "rating": 4.8,
    "tags": [
      "Mountains",
      "Nature",
      "Adventure"
    ],
    "bestSeason": "Sep - Mar",
    "avgDailyCost": 3100,
    "description": "Rolling hills draped in manicured green tea blankets, misty valleys, and cool mountain breezes in the heart of the Western Ghats.",
    "highlights": [
      "Eravikulam National Park",
      "Mattupetty Dam",
      "Top Station viewpoint",
      "Tea Museum"
    ],
    "climate": "Cool"
  },
  {
    "id": "ooty",
    "name": "Ooty",
    "region": "Tamil Nadu",
    "country": "India",
    "lat": 11.4102,
    "lon": 76.695,
    "emoji": "🌸",
    "imageUrl": "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#799F0C",
      "#FFE000"
    ],
    "rating": 4.5,
    "tags": [
      "Mountains",
      "Nature",
      "Food"
    ],
    "bestSeason": "Oct - Jun",
    "avgDailyCost": 2700,
    "description": "Charming hill retreat nestled in the Nilgiri Blue Mountains with botanical gardens, pine forests, and heritage steam train rides.",
    "highlights": [
      "Nilgiri Mountain Railway",
      "Ooty Lake",
      "Doddabetta Peak",
      "Botanical Gardens"
    ],
    "climate": "Cool"
  },
  {
    "id": "shimla",
    "name": "Shimla",
    "region": "Himachal Pradesh",
    "country": "India",
    "lat": 31.1048,
    "lon": 77.1734,
    "emoji": "🏔️",
    "imageUrl": "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#3A6073",
      "#3A7BD5"
    ],
    "rating": 4.6,
    "tags": [
      "Mountains",
      "History",
      "Shopping"
    ],
    "bestSeason": "Mar - Jun, Dec - Feb",
    "avgDailyCost": 3000,
    "description": "The erstwhile British summer capital featuring Tudor-Victorian architecture, bustling pedestrian Mall Road, and snowy winter views.",
    "highlights": [
      "The Ridge & Mall Road",
      "Jakhoo Temple",
      "Kalka-Shimla Toy Train",
      "Kufri snow park"
    ],
    "climate": "Cool"
  },
  {
    "id": "jaisalmer",
    "name": "Jaisalmer",
    "region": "Rajasthan",
    "country": "India",
    "lat": 26.9157,
    "lon": 70.9083,
    "emoji": "🐪",
    "imageUrl": "https://images.unsplash.com/photo-1572445271230-a78b5944a659?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#E65C00",
      "#F9D423"
    ],
    "rating": 4.7,
    "tags": [
      "Culture",
      "Adventure",
      "History"
    ],
    "bestSeason": "Oct - Mar",
    "avgDailyCost": 3100,
    "description": "The Golden City rising out of the Great Thar Desert, famed for its living golden fort, camel safaris, and stargazing in dunes.",
    "highlights": [
      "Jaisalmer Fort (Sonar Qila)",
      "Sam Sand Dunes safari",
      "Patwon Ki Haveli",
      "Desert camping under stars"
    ],
    "climate": "Warm"
  },
  {
    "id": "pondicherry",
    "name": "Pondicherry",
    "region": "Puducherry",
    "country": "India",
    "lat": 11.9416,
    "lon": 79.8083,
    "emoji": "🥐",
    "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#56CCF2",
      "#2F80ED"
    ],
    "rating": 4.6,
    "tags": [
      "Beaches",
      "Culture",
      "Food"
    ],
    "bestSeason": "Oct - Mar",
    "avgDailyCost": 2800,
    "description": "French colonial elegance meets coastal tranquility with pastel villas, bougainvillea streets, beachside promenades, and chic cafes.",
    "highlights": [
      "White Town French Quarter",
      "Promenade Beach",
      "Auroville & Matrimandir",
      "Paradise Beach"
    ],
    "climate": "Warm"
  },
  {
    "id": "andaman",
    "name": "Andaman & Havelock",
    "region": "Andaman & Nicobar",
    "country": "India",
    "lat": 11.9761,
    "lon": 92.9876,
    "emoji": "🤿",
    "imageUrl": "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#00C9FF",
      "#92FE9D"
    ],
    "rating": 4.9,
    "tags": [
      "Beaches",
      "Adventure",
      "Nature"
    ],
    "bestSeason": "Oct - May",
    "avgDailyCost": 4800,
    "description": "Tropical island paradise with turquoise waters, world-renowned white beaches, pristine coral reefs, and prime scuba diving.",
    "highlights": [
      "Radhanagar Beach",
      "Elephant Beach snorkeling",
      "Cellular Jail Port Blair",
      "Scuba diving & bioluminescence"
    ],
    "climate": "Warm"
  },
  {
    "id": "amritsar",
    "name": "Amritsar",
    "region": "Punjab",
    "country": "India",
    "lat": 31.634,
    "lon": 74.8723,
    "emoji": "✨",
    "imageUrl": "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#F7971E",
      "#FFD200"
    ],
    "rating": 4.9,
    "tags": [
      "Spiritual",
      "Food",
      "Culture",
      "History"
    ],
    "bestSeason": "Oct - Mar",
    "avgDailyCost": 2200,
    "description": "Spiritual heart of Sikhism home to the shimmering Golden Temple, world-famous Punjabi food, and patriotic Wagah border ceremony.",
    "highlights": [
      "Sri Harmandir Sahib (Golden Temple)",
      "Wagah Border ceremony",
      "Jallianwala Bagh",
      "Amritsari Kulcha trail"
    ],
    "climate": "Warm"
  },
  {
    "id": "coorg",
    "name": "Coorg (Madikeri)",
    "region": "Karnataka",
    "country": "India",
    "lat": 12.4244,
    "lon": 75.7382,
    "emoji": "☕",
    "imageUrl": "https://images.unsplash.com/photo-1586521995568-39abaa0c2311?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#134E5E",
      "#71B280"
    ],
    "rating": 4.7,
    "tags": [
      "Nature",
      "Mountains",
      "Food"
    ],
    "bestSeason": "Oct - Apr",
    "avgDailyCost": 2900,
    "description": "The Scotland of India: lush coffee plantations, spice hills, misty waterfalls, and warm Kodava hospitality.",
    "highlights": [
      "Abbey Falls",
      "Raja’s Seat sunset",
      "Dubare Elephant Camp",
      "Coffee plantation tour"
    ],
    "climate": "Cool"
  },
  {
    "id": "kodaikanal",
    "name": "Kodaikanal",
    "region": "Tamil Nadu",
    "country": "India",
    "lat": 10.2381,
    "lon": 77.4892,
    "emoji": "🌲",
    "imageUrl": "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#2C3E50",
      "#4CA1AF"
    ],
    "rating": 4.6,
    "tags": [
      "Mountains",
      "Nature"
    ],
    "bestSeason": "Sep - May",
    "avgDailyCost": 2600,
    "description": "Princess of Hill Stations set on the Palani Hills, featuring a star-shaped lake, dense shola pine forests, and scenic viewpoints.",
    "highlights": [
      "Kodai Lake boating",
      "Coaker’s Walk",
      "Pillar Rocks",
      "Pine Forest walks"
    ],
    "climate": "Cool"
  },
  {
    "id": "shillong",
    "name": "Shillong & Meghalaya",
    "region": "Meghalaya",
    "country": "India",
    "lat": 25.5788,
    "lon": 91.8933,
    "emoji": "🌧️",
    "imageUrl": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#0575E6",
      "#00F260"
    ],
    "rating": 4.8,
    "tags": [
      "Nature",
      "Adventure",
      "Culture"
    ],
    "bestSeason": "Sep - May",
    "avgDailyCost": 3300,
    "description": "Abode of clouds with living root bridges, crystal-clear river waters in Dawki, roaring waterfalls, and vibrant indie music culture.",
    "highlights": [
      "Cherrapunji & Nohkalikai Falls",
      "Dawki crystal river",
      "Living Root Bridges",
      "Umiam Lake"
    ],
    "climate": "Cool"
  },
  {
    "id": "kasol",
    "name": "Kasol & Parvati Valley",
    "region": "Himachal Pradesh",
    "country": "India",
    "lat": 32.01,
    "lon": 77.315,
    "emoji": "🏕️",
    "imageUrl": "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#1D976C",
      "#93F9B9"
    ],
    "rating": 4.6,
    "tags": [
      "Adventure",
      "Mountains",
      "Nightlife"
    ],
    "bestSeason": "Mar - Jun, Oct - Nov",
    "avgDailyCost": 2000,
    "description": "Laid-back riverside haven on the roaring Parvati River, beloved by trekkers for hot springs, mountain trails, and Israeli cafes.",
    "highlights": [
      "Kheerganga trek & hot spring",
      "Tosh & Malana village",
      "Parvati River trail",
      "Manikaran Sahib"
    ],
    "climate": "Cool"
  },
  {
    "id": "mysore",
    "name": "Mysore (Mysuru)",
    "region": "Karnataka",
    "country": "India",
    "lat": 12.2958,
    "lon": 76.6394,
    "emoji": "👑",
    "imageUrl": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#E65C00",
      "#F9D423"
    ],
    "rating": 4.7,
    "tags": [
      "Culture",
      "History",
      "Shopping",
      "Food"
    ],
    "bestSeason": "Oct - Mar",
    "avgDailyCost": 2500,
    "description": "Heritage city of grand palaces, fragrant sandalwood, rich silk sarees, and dazzling night illumination of the Royal Palace.",
    "highlights": [
      "Mysore Palace illumination",
      "Chamundi Hills",
      "Brindavan Gardens",
      "Devaraja Market"
    ],
    "climate": "Warm"
  },
  {
    "id": "ranthambore",
    "name": "Ranthambore",
    "region": "Rajasthan",
    "country": "India",
    "lat": 26.0173,
    "lon": 76.5026,
    "emoji": "🐅",
    "imageUrl": "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#BA8B02",
      "#181818"
    ],
    "rating": 4.7,
    "tags": [
      "Nature",
      "Adventure",
      "History"
    ],
    "bestSeason": "Oct - Apr",
    "avgDailyCost": 4500,
    "description": "One of India’s premier national parks for spotting Royal Bengal Tigers in the wild against the backdrop of an ancient ruined jungle fort.",
    "highlights": [
      "Tiger safari in open Gypsy",
      "10th-century Ranthambore Fort",
      "Padam Talao lake",
      "Birdwatching"
    ],
    "climate": "Warm"
  },
  {
    "id": "kaziranga",
    "name": "Kaziranga",
    "region": "Assam",
    "country": "India",
    "lat": 26.5775,
    "lon": 93.1711,
    "emoji": "🦏",
    "imageUrl": "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#56ab2f",
      "#a8e063"
    ],
    "rating": 4.8,
    "tags": [
      "Nature",
      "Adventure"
    ],
    "bestSeason": "Nov - Apr",
    "avgDailyCost": 3800,
    "description": "UNESCO World Heritage forest along the mighty Brahmaputra river, sheltering the world’s largest population of great one-horned rhinos.",
    "highlights": [
      "One-horned rhino safari",
      "Elephant grass plains",
      "Orchid Park",
      "Tea garden visits"
    ],
    "climate": "Warm"
  },
  {
    "id": "corbett",
    "name": "Jim Corbett",
    "region": "Uttarakhand",
    "country": "India",
    "lat": 29.53,
    "lon": 78.7747,
    "emoji": "🌲",
    "imageUrl": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#134E5E",
      "#71B280"
    ],
    "rating": 4.6,
    "tags": [
      "Nature",
      "Adventure"
    ],
    "bestSeason": "Nov - May",
    "avgDailyCost": 4200,
    "description": "India’s oldest national park on Himalayan foothills, renowned for rich wildlife, deep sal forests, and riverside luxury lodges.",
    "highlights": [
      "Dhikala zone safari",
      "Kosi river lodges",
      "Corbett waterfall",
      "Garjiya Devi Temple"
    ],
    "climate": "Warm"
  },
  {
    "id": "gokarna",
    "name": "Gokarna",
    "region": "Karnataka",
    "country": "India",
    "lat": 14.5479,
    "lon": 74.3188,
    "emoji": "🏖️",
    "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#00c6ff",
      "#0072ff"
    ],
    "rating": 4.7,
    "tags": [
      "Beaches",
      "Spiritual",
      "Adventure"
    ],
    "bestSeason": "Oct - Mar",
    "avgDailyCost": 2200,
    "description": "A serene beach town where sacred Mahabaleshwar temple meets five crescent-shaped beaches linked by panoramic cliff trails.",
    "highlights": [
      "Om Beach & Kudle Beach",
      "Beach trek from Paradise to Half Moon",
      "Mahabaleshwar Temple",
      "Sunset cliff shacks"
    ],
    "climate": "Warm"
  },
  {
    "id": "spiti",
    "name": "Spiti Valley",
    "region": "Himachal Pradesh",
    "country": "India",
    "lat": 32.2461,
    "lon": 78.0349,
    "emoji": "🏔️",
    "imageUrl": "https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#4b6cb7",
      "#182848"
    ],
    "rating": 4.9,
    "tags": [
      "Adventure",
      "Mountains",
      "Culture"
    ],
    "bestSeason": "Jun - Oct",
    "avgDailyCost": 3500,
    "description": "The Middle Land between India and Tibet: thousand-year-old cliffside monasteries, fossil villages, and raw Himalayan grandeur.",
    "highlights": [
      "Key Gompa Monastery",
      "Chandratal Lake camping",
      "Hikkim highest post office",
      "Kaza market"
    ],
    "climate": "Snow"
  },
  {
    "id": "mahabaleshwar",
    "name": "Mahabaleshwar",
    "region": "Maharashtra",
    "country": "India",
    "lat": 17.9237,
    "lon": 73.6586,
    "emoji": "🍓",
    "imageUrl": "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#e52d27",
      "#b31217"
    ],
    "rating": 4.5,
    "tags": [
      "Nature",
      "Mountains",
      "Food"
    ],
    "bestSeason": "Oct - Jun",
    "avgDailyCost": 2800,
    "description": "Famous Western Ghats hill station celebrated for sweet strawberry farms, evergreen forest plateaus, and spectacular cliff viewpoints.",
    "highlights": [
      "Venna Lake boating",
      "Arthur’s Seat cliff",
      "Mapro Garden strawberry cream",
      "Pratapgad Fort"
    ],
    "climate": "Cool"
  },
  {
    "id": "lonavala",
    "name": "Lonavala & Khandala",
    "region": "Maharashtra",
    "country": "India",
    "lat": 18.7557,
    "lon": 73.4091,
    "emoji": "🌧️",
    "imageUrl": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#11998e",
      "#38ef7d"
    ],
    "rating": 4.4,
    "tags": [
      "Nature",
      "Adventure",
      "Food"
    ],
    "bestSeason": "Jul - Sep, Nov - Feb",
    "avgDailyCost": 2500,
    "description": "Beloved weekend escape near Mumbai & Pune, coming alive in monsoons with roaring waterfalls, misty valley points, and chikki confectioneries.",
    "highlights": [
      "Tiger’s Leap viewpoint",
      "Bhushi Dam",
      "Karla & Bhaja Buddhist Caves",
      "Lohagad Fort trek"
    ],
    "climate": "Cool"
  },
  {
    "id": "alibaug",
    "name": "Alibaug",
    "region": "Maharashtra",
    "country": "India",
    "lat": 18.6414,
    "lon": 72.8722,
    "emoji": "⛵",
    "imageUrl": "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#2980b9",
      "#2c3e50"
    ],
    "rating": 4.4,
    "tags": [
      "Beaches",
      "Food",
      "Adventure"
    ],
    "bestSeason": "Oct - May",
    "avgDailyCost": 3200,
    "description": "Coastal seaside haven reachable by speedboat from Mumbai, dotted with coconut groves, historic sea forts, and fresh Konkani seafood.",
    "highlights": [
      "Kolaba Sea Fort",
      "Varsoli & Nagaon water sports",
      "Kashid white sand beach",
      "Seafood thali experience"
    ],
    "climate": "Warm"
  },
  {
    "id": "khajuraho",
    "name": "Khajuraho",
    "region": "Madhya Pradesh",
    "country": "India",
    "lat": 24.8318,
    "lon": 79.9199,
    "emoji": "🛕",
    "imageUrl": "https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#e65c00",
      "#f9d423"
    ],
    "rating": 4.7,
    "tags": [
      "History",
      "Culture"
    ],
    "bestSeason": "Oct - Mar",
    "avgDailyCost": 2600,
    "description": "UNESCO World Heritage complex of medieval Hindu and Jain temples world-renowned for exquisite stone carvings and architectural beauty.",
    "highlights": [
      "Kandariya Mahadeva Temple",
      "Western group of temples",
      "Light & Sound show",
      "Raneh Falls canyon"
    ],
    "climate": "Warm"
  },
  {
    "id": "gulmarg",
    "name": "Gulmarg",
    "region": "Jammu and Kashmir",
    "country": "India",
    "lat": 34.0484,
    "lon": 74.3805,
    "emoji": "⛷️",
    "imageUrl": "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#00c6ff",
      "#0072ff"
    ],
    "rating": 4.9,
    "tags": [
      "Mountains",
      "Adventure",
      "Nature"
    ],
    "bestSeason": "Dec - Mar for snow, May - Sep for meadows",
    "avgDailyCost": 4500,
    "description": "Meadow of Flowers transformed into India’s winter sports capital with the world’s second-highest cable car and powdery snow slopes.",
    "highlights": [
      "Gulmarg Gondola ride",
      "Skiing & snowboarding",
      "Apharwat Peak",
      "Alpather frozen lake"
    ],
    "climate": "Snow"
  },
  {
    "id": "srinagar",
    "name": "Srinagar",
    "region": "Jammu and Kashmir",
    "country": "India",
    "lat": 34.0837,
    "lon": 74.7973,
    "emoji": "🌸",
    "imageUrl": "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#2b5876",
      "#4e4376"
    ],
    "rating": 4.8,
    "tags": [
      "Culture",
      "Nature",
      "Shopping"
    ],
    "bestSeason": "Apr - Oct",
    "avgDailyCost": 3800,
    "description": "Paradise on Earth with wooden houseboats on Dal Lake, colourful Shikaras, terraced Mughal gardens, and aromatic Kashmiri cuisine.",
    "highlights": [
      "Dal Lake Shikara ride",
      "Mughal Gardens (Shalimar & Nishat)",
      "Floating vegetable market",
      "Pashmina & walnut carving"
    ],
    "climate": "Cool"
  },
  {
    "id": "pahalgam",
    "name": "Pahalgam",
    "region": "Jammu and Kashmir",
    "country": "India",
    "lat": 34.0166,
    "lon": 75.3166,
    "emoji": "🌲",
    "imageUrl": "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#134e5e",
      "#71b280"
    ],
    "rating": 4.8,
    "tags": [
      "Nature",
      "Mountains",
      "Adventure"
    ],
    "bestSeason": "Apr - Oct",
    "avgDailyCost": 3400,
    "description": "The Valley of Shepherds on the banks of Lidder River, surrounded by pine-covered hills, alpine meadows, and starting point for treks.",
    "highlights": [
      "Betaab Valley",
      "Aru Valley horse ride",
      "Chandanwari snow bridge",
      "Lidder river trout fishing"
    ],
    "climate": "Cool"
  },
  {
    "id": "nainital",
    "name": "Nainital",
    "region": "Uttarakhand",
    "country": "India",
    "lat": 29.3919,
    "lon": 79.4542,
    "emoji": "⛵",
    "imageUrl": "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#3a7bd5",
      "#3a6073"
    ],
    "rating": 4.6,
    "tags": [
      "Mountains",
      "Nature",
      "Shopping"
    ],
    "bestSeason": "Mar - Jun, Oct - Dec",
    "avgDailyCost": 2800,
    "description": "Picturesque lake city set around an eye-shaped emerald water basin in Kumaon hills, lined with promenades, yachts, and cable cars.",
    "highlights": [
      "Naini Lake boating",
      "Naina Devi Temple",
      "Snow View aerial ropeway",
      "Mall Road evening stroll"
    ],
    "climate": "Cool"
  },
  {
    "id": "mussoorie",
    "name": "Mussoorie",
    "region": "Uttarakhand",
    "country": "India",
    "lat": 30.4598,
    "lon": 78.0644,
    "emoji": "⛰️",
    "imageUrl": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#4b6cb7",
      "#182848"
    ],
    "rating": 4.5,
    "tags": [
      "Mountains",
      "Nature",
      "Shopping"
    ],
    "bestSeason": "Apr - Jun, Sep - Nov",
    "avgDailyCost": 2900,
    "description": "The Queen of the Hills overlooking the Doon Valley, famous for waterfalls, colonial promenades, and the winter line sunset phenomenon.",
    "highlights": [
      "Kempty Falls",
      "Gun Hill cable car",
      "Camel’s Back Road",
      "Landour bakeries & Char Dukan"
    ],
    "climate": "Cool"
  },
  {
    "id": "pushkar",
    "name": "Pushkar",
    "region": "Rajasthan",
    "country": "India",
    "lat": 26.4899,
    "lon": 74.5511,
    "emoji": "🪷",
    "imageUrl": "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#f2994a",
      "#f2c94c"
    ],
    "rating": 4.6,
    "tags": [
      "Culture",
      "Spiritual",
      "Shopping"
    ],
    "bestSeason": "Oct - Mar",
    "avgDailyCost": 2000,
    "description": "Sacred lakeside desert town home to the world’s rare Lord Brahma Temple, holy ghats, vibrant camel fairs, and rooftop vegan cafes.",
    "highlights": [
      "Pushkar Lake 52 ghats",
      "Brahma Temple",
      "Savitri Temple hilltop sunset",
      "Pushkar Camel Fair (seasonal)"
    ],
    "climate": "Warm"
  },
  {
    "id": "jodhpur",
    "name": "Jodhpur",
    "region": "Rajasthan",
    "country": "India",
    "lat": 26.2389,
    "lon": 73.0243,
    "emoji": "💙",
    "imageUrl": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#2980b9",
      "#6dd5fa"
    ],
    "rating": 4.7,
    "tags": [
      "Culture",
      "History",
      "Food",
      "Shopping"
    ],
    "bestSeason": "Oct - Mar",
    "avgDailyCost": 2800,
    "description": "The Blue City crowned by the colossal Mehrangarh Fort rising above a labyrinth of sapphire-washed old city houses.",
    "highlights": [
      "Mehrangarh Fort ziplining",
      "Jaswant Thada",
      "Clock Tower & Sardar Market",
      "Umaid Bhawan Palace"
    ],
    "climate": "Warm"
  },
  {
    "id": "mount-abu",
    "name": "Mount Abu",
    "region": "Rajasthan",
    "country": "India",
    "lat": 24.5925,
    "lon": 72.7156,
    "emoji": "🌄",
    "imageUrl": "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#11998e",
      "#38ef7d"
    ],
    "rating": 4.4,
    "tags": [
      "Mountains",
      "Culture",
      "History"
    ],
    "bestSeason": "Year-round, Nov - Mar",
    "avgDailyCost": 2600,
    "description": "Rajasthan’s only hill station, perched in the Aravalli Range and revered for the breathtaking marble artistry of Dilwara Temples.",
    "highlights": [
      "Dilwara Jain Temples",
      "Nakki Lake pedal boating",
      "Sunset Point",
      "Guru Shikhar highest peak"
    ],
    "climate": "Cool"
  },
  {
    "id": "kutch",
    "name": "Rann of Kutch",
    "region": "Gujarat",
    "country": "India",
    "lat": 23.7337,
    "lon": 69.8597,
    "emoji": "🌕",
    "imageUrl": "https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#f857a6",
      "#ff5858"
    ],
    "rating": 4.8,
    "tags": [
      "Culture",
      "Adventure",
      "Shopping"
    ],
    "bestSeason": "Nov - Feb",
    "avgDailyCost": 4000,
    "description": "The world’s largest white salt desert that shines under full moon nights, celebrated during the vibrant winter Rann Utsav festival.",
    "highlights": [
      "White Rann sunset & full moon walk",
      "Rann Utsav cultural tents",
      "Kala Dungar hill",
      "Kutch artisan handicraft villages"
    ],
    "climate": "Warm"
  },
  {
    "id": "gir",
    "name": "Gir National Park",
    "region": "Gujarat",
    "country": "India",
    "lat": 21.1243,
    "lon": 70.8242,
    "emoji": "🦁",
    "imageUrl": "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#d35400",
      "#f39c12"
    ],
    "rating": 4.7,
    "tags": [
      "Nature",
      "Adventure"
    ],
    "bestSeason": "Dec - Mar",
    "avgDailyCost": 3800,
    "description": "The sole remaining natural sanctuary on Earth for the majestic Asiatic Lion, set in dry deciduous teak and acacia forests.",
    "highlights": [
      "Asiatic Lion jeep safari",
      "Kamleshwar Dam",
      "Crocodile breeding farm",
      "Maldhari tribal culture"
    ],
    "climate": "Warm"
  },
  {
    "id": "madurai",
    "name": "Madurai",
    "region": "Tamil Nadu",
    "country": "India",
    "lat": 9.9252,
    "lon": 78.1198,
    "emoji": "🛕",
    "imageUrl": "https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#8e44ad",
      "#c0392b"
    ],
    "rating": 4.7,
    "tags": [
      "Culture",
      "History",
      "Spiritual",
      "Food"
    ],
    "bestSeason": "Oct - Mar",
    "avgDailyCost": 2200,
    "description": "The Cultural Capital of Tamil Nadu, centered around the thousand-pillar, sculpted gopurams of Meenakshi Amman Temple.",
    "highlights": [
      "Meenakshi Amman Temple",
      "Thirumalai Nayakkar Mahal",
      "Night Aarti ceremony",
      "Jigarthanda & street food"
    ],
    "climate": "Warm"
  },
  {
    "id": "rameshwaram",
    "name": "Rameshwaram",
    "region": "Tamil Nadu",
    "country": "India",
    "lat": 9.2876,
    "lon": 79.3129,
    "emoji": "🌊",
    "imageUrl": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#00b4db",
      "#0083b0"
    ],
    "rating": 4.8,
    "tags": [
      "Spiritual",
      "Culture",
      "Beaches"
    ],
    "bestSeason": "Oct - Apr",
    "avgDailyCost": 2300,
    "description": "Sacred island connected by the engineering wonder Pamban Sea Bridge, featuring holy wells and the ghost town of Dhanushkodi.",
    "highlights": [
      "Ramanathaswamy Temple corridor",
      "Pamban Sea Bridge view",
      "Dhanushkodi ghost town & beach",
      "Agni Theertham"
    ],
    "climate": "Warm"
  },
  {
    "id": "kanyakumari",
    "name": "Kanyakumari",
    "region": "Tamil Nadu",
    "country": "India",
    "lat": 8.0883,
    "lon": 77.5385,
    "emoji": "🌅",
    "imageUrl": "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#f12711",
      "#f5af19"
    ],
    "rating": 4.6,
    "tags": [
      "Spiritual",
      "Culture",
      "Beaches"
    ],
    "bestSeason": "Oct - Mar",
    "avgDailyCost": 2400,
    "description": "The southern tip of mainland India where the Arabian Sea, Indian Ocean and Bay of Bengal converge under unforgettable sunrises.",
    "highlights": [
      "Vivekananda Rock Memorial",
      "Thiruvalluvar Statue",
      "Triveni Sangam confluence",
      "Sunrise & sunset point"
    ],
    "climate": "Warm"
  },
  {
    "id": "gangtok",
    "name": "Gangtok",
    "region": "Sikkim",
    "country": "India",
    "lat": 27.3389,
    "lon": 88.6065,
    "emoji": "🏔️",
    "imageUrl": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#2980b9",
      "#2c3e50"
    ],
    "rating": 4.8,
    "tags": [
      "Mountains",
      "Culture",
      "Adventure"
    ],
    "bestSeason": "Mar - Jun, Sep - Dec",
    "avgDailyCost": 3200,
    "description": "Capital of Sikkim with clean streets, prayer flags, high-altitude alpine lakes, and dramatic vistas of Mount Kanchenjunga.",
    "highlights": [
      "Tsomgo Lake & Baba Mandir",
      "Nathula Pass Indo-China border",
      "MG Marg pedestrian zone",
      "Rumtek Monastery"
    ],
    "climate": "Cool"
  },
  {
    "id": "pelling",
    "name": "Pelling",
    "region": "Sikkim",
    "country": "India",
    "lat": 27.3167,
    "lon": 88.2333,
    "emoji": "🌉",
    "imageUrl": "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#005c97",
      "#363795"
    ],
    "rating": 4.7,
    "tags": [
      "Mountains",
      "Nature",
      "Culture"
    ],
    "bestSeason": "Sep - May",
    "avgDailyCost": 2800,
    "description": "Quiet Himalayan hamlet offering the closest and clearest views of Kanchenjunga alongside India’s first glass skywalk.",
    "highlights": [
      "Pelling Glass Skywalk",
      "Pemayangtse Monastery",
      "Rabdentse Ruins",
      "Kanchenjunga Falls"
    ],
    "climate": "Cool"
  },
  {
    "id": "tawang",
    "name": "Tawang",
    "region": "Arunachal Pradesh",
    "country": "India",
    "lat": 27.5861,
    "lon": 91.8594,
    "emoji": "🛕",
    "imageUrl": "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#8e44ad",
      "#3498db"
    ],
    "rating": 4.9,
    "tags": [
      "Mountains",
      "Culture",
      "Adventure"
    ],
    "bestSeason": "Mar - Jun, Sep - Oct",
    "avgDailyCost": 3600,
    "description": "Remote mountain wonderland at 10,000 feet, hosting India’s largest monastery, crystal glacial lakes, and the legendary Sela Pass.",
    "highlights": [
      "Tawang Monastery",
      "Sela Pass snow crossing",
      "Madhuri (Sangetsar) Lake",
      "Nuranang Waterfall"
    ],
    "climate": "Snow"
  },
  {
    "id": "ziro",
    "name": "Ziro Valley",
    "region": "Arunachal Pradesh",
    "country": "India",
    "lat": 27.5946,
    "lon": 93.8385,
    "emoji": "🎸",
    "imageUrl": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#11998e",
      "#38ef7d"
    ],
    "rating": 4.7,
    "tags": [
      "Nature",
      "Culture",
      "Adventure"
    ],
    "bestSeason": "Apr - Oct",
    "avgDailyCost": 2800,
    "description": "Picturesque pine-clad plateau inhabited by the gentle Apatani tribe, world-renowned for sustainable paddy farming and its outdoor music festival.",
    "highlights": [
      "Ziro Music Festival (seasonal)",
      "Apatani tribal homestays",
      "Tarin fish farm",
      "Pine groves & paddy fields"
    ],
    "climate": "Cool"
  },
  {
    "id": "konark",
    "name": "Konark & Puri",
    "region": "Odisha",
    "country": "India",
    "lat": 19.8876,
    "lon": 86.0945,
    "emoji": "☀️",
    "imageUrl": "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80",
    "colors": [
      "#f27121",
      "#e94057"
    ],
    "rating": 4.7,
    "tags": [
      "History",
      "Culture",
      "Beaches",
      "Spiritual"
    ],
    "bestSeason": "Oct - Mar",
    "avgDailyCost": 2400,
    "description": "Home of the colossal 13th-century Sun Temple carved like a chariot of the Sun God, paired with the sacred golden beaches of Puri.",
    "highlights": [
      "Konark Sun Temple UNESCO site",
      "Jagannath Temple Puri",
      "Golden Beach blue flag shore",
      "Chilika Lake dolphins"
    ],
    "climate": "Warm"
  }
];

let registry: Destination[] = destinations;
export const setRegistry = (list: Destination[]) => {
  registry = list;
};
export const getDestination = (id: string) => registry.find((d) => d.id === id);
