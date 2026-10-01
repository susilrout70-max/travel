import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding TravelHub database...');

  // Clean existing tables in reverse dependency order
  await prisma.priceBreakdown.deleteMany();
  await prisma.safetyCheckIn.deleteMany();
  await prisma.emergencyContact.deleteMany();
  await prisma.tripChecklistItem.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.incidentReport.deleteMany();
  await prisma.emergencyPhrase.deleteMany();
  await prisma.emergencyDirectory.deleteMany();
  await prisma.localPick.deleteMany();
  await prisma.seasonalInsight.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.hotelBooking.deleteMany();
  await prisma.vehicleBooking.deleteMany();
  await prisma.hotelRoom.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.tripSharePin.deleteMany();
  await prisma.tripShare.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.liveInfoCache.deleteMany();
  await prisma.travelGuide.deleteMany();
  await prisma.destination.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const passwordHashUser = await bcrypt.hash('TravelHub123!', 10);
  const passwordHashAdmin = await bcrypt.hash('Admin123!', 10);

  const demoUser = await prisma.user.create({
    data: {
      email: 'traveler@travelhub.com',
      passwordHash: passwordHashUser,
      name: 'Aarav Sharma',
      phone: '+91 98765 43210',
      role: 'USER',
      isEmailVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      preferences: JSON.stringify({
        preferredCategories: ['HILL_STATION', 'NATURE', 'BEACH'],
        budgetLevel: 'MODERATE',
        travelStyle: 'LEISURE',
      }),
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@travelhub.com',
      passwordHash: passwordHashAdmin,
      name: 'TravelHub Operations',
      phone: '+91 98111 22334',
      role: 'ADMIN',
      isEmailVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
  });

  console.log(`Created users: ${demoUser.email}, ${adminUser.email}`);

  // Create Destinations
  const destinationsData = [
    {
      name: 'Manali',
      slug: 'manali',
      category: 'HILL_STATION',
      description: 'A high-altitude Himalayan resort town known for snow-capped peaks, pine forests, adventure sports, and Solang Valley.',
      country: 'India',
      state: 'Himachal Pradesh',
      latitude: 32.2432,
      longitude: 77.1892,
      bestSeason: 'October to June',
      trendingScore: 94.5,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1586351012965-861624544334?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1605649487212-47bdab064df8?auto=format&fit=crop&w=1200&q=80',
      ]),
      guide: {
        highlights: JSON.stringify([
          'Paragliding and Zorbing at Solang Valley',
          'Scenic drive through the engineering marvel Atal Tunnel',
          'Ancient timber-and-stone Hadimba Devi Temple',
          'Hot sulphur springs at Vashisht Village',
          'Cafes, apple orchards and wooden cottages in Old Manali',
        ]),
        bestTimeToVisit: 'October to February for winter snowfall; March to June for pleasant weather and trekking.',
        localTips: JSON.stringify([
          'Rent gumboots and snow suits near Solang Valley rather than on the highway.',
          'Start early around 6:00 AM if visiting Rohtang Pass or Atal Tunnel to beat tourist traffic.',
          'Try authentic Siddu (steamed wheat bread with walnut stuffing) and local trout fish.',
        ]),
        sampleItinerary: JSON.stringify([
          { day: 1, title: 'Old Manali Charm & Cafes', plan: 'Check into your resort, visit Hadimba Temple, wander through Old Manali alleyways, and enjoy live music at local cafes.' },
          { day: 2, title: 'Solang Adventure & Atal Tunnel', plan: 'Head to Solang Valley for ropeway & paragliding, drive through Atal Tunnel to Sissu waterfall in Lahaul Valley.' },
          { day: 3, title: 'Jogini Waterfall & Vashisht Baths', plan: 'Trek to Jogini Waterfall through pine forests, relax in natural hot springs at Vashisht, shop for Himachali shawls on Mall Road.' },
        ]),
      },
    },
    {
      name: 'Goa',
      slug: 'goa',
      category: 'BEACH',
      description: 'Tropical paradise featuring golden palm-fringed coastlines, vibrant beach shacks, Portuguese heritage, and sunset cruises.',
      country: 'India',
      state: 'Goa',
      latitude: 15.2993,
      longitude: 74.1240,
      bestSeason: 'November to March',
      trendingScore: 98.2,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1587922546307-776227941871?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1590393282245-c19d443425cb?auto=format&fit=crop&w=1200&q=80',
      ]),
      guide: {
        highlights: JSON.stringify([
          'Sunbathing and water sports at Palolem & Ashwem Beaches',
          'Centuries-old Basilica of Bom Jesus and Se Cathedral in Old Goa',
          'Latin Quarter walking tour through colorful Fontainhas',
          'Sunset catamaran cruises along Mandovi River',
          'Fresh seafood curry and beach-side live music at sunset',
        ]),
        bestTimeToVisit: 'November to February for beach festivals, cool sea breeze, and sunny waters.',
        localTips: JSON.stringify([
          'Rent a scooter to easily navigate coastal roads and hidden beaches.',
          'Head south to Agonda or Cola Beach for quieter, serene sands away from crowds.',
          'Carry cash or UPI for local beach shacks as card connectivity can occasionally dip.',
        ]),
        sampleItinerary: JSON.stringify([
          { day: 1, title: 'North Goa Sunset & Shacks', plan: 'Arrive in North Goa, unwind at Vagator beach, visit Chapora Fort for twilight views, dinner at Anjuna beach.' },
          { day: 2, title: 'Heritage & Fontainhas', plan: 'Explore Old Goa UNESCO churches, walk through the Portuguese villas of Fontainhas, evening river cruise.' },
          { day: 3, title: 'South Goa Hidden Gems', plan: 'Drive south to Palolem beach, take a boat to Butterfly Beach, and relish a sunset beach dinner under lantern-lit palms.' },
        ]),
      },
    },
    {
      name: 'Munnar',
      slug: 'munnar',
      category: 'NATURE',
      description: 'Lush rolling tea estates, misty mountain horizons, spice plantations, and exotic flora nestled in God’s Own Country.',
      country: 'India',
      state: 'Kerala',
      latitude: 10.0889,
      longitude: 77.0595,
      bestSeason: 'September to March',
      trendingScore: 89.0,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      ]),
      guide: {
        highlights: JSON.stringify([
          'Panoramic views from Eravikulam National Park (Home of Nilgiri Tahr)',
          'Tea plucking experience & museum at Lockhart Estate',
          'Boating and echo acoustics at Mattupetty Dam',
          'Sunrise viewpoints at Top Station overlooking Western Ghats valleys',
          'Traditional Ayurvedic healing massage & spice trail tour',
        ]),
        bestTimeToVisit: 'October to February when misty hills are at their greenest and temperatures range between 10°C and 20°C.',
        localTips: JSON.stringify([
          'Pre-book Eravikulam National Park tickets online to skip long queue lines.',
          'Early mornings are crisp and misty; bring a light jacket.',
          'Buy fresh home-made chocolates and cardamom directly from plantation cooperatives.',
        ]),
        sampleItinerary: JSON.stringify([
          { day: 1, title: 'Tea Gardens & Valley Views', plan: 'Check in, visit KDHP Tea Museum, stroll through emerald tea fields and capture sunset at Pothamedu Viewpoint.' },
          { day: 2, title: 'Wildlife & Mountain Peaks', plan: 'Morning safari at Eravikulam National Park to spot Nilgiri Tahr, followed by Mattupetty Lake boating and Kundala Dam.' },
          { day: 3, title: 'Top Station & Spice Estates', plan: 'Catch spectacular early morning cloud beds at Top Station, tour an aromatic spice garden, and enjoy a traditional Sadya meal.' },
        ]),
      },
    },
    {
      name: 'Leh-Ladakh',
      slug: 'leh-ladakh',
      category: 'ADVENTURE',
      description: 'High desert wonderland of dramatic mountain passes, azure lakes, Tibetan monasteries, and exhilarating Himalayan bike expeditions.',
      country: 'India',
      state: 'Ladakh',
      latitude: 34.1526,
      longitude: 77.5771,
      bestSeason: 'May to September',
      trendingScore: 96.0,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1509299349698-dd22323b5963?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
      ]),
      guide: {
        highlights: JSON.stringify([
          'Crossing Khardung La — one of the highest motorable passes on earth',
          'Camping by the sparkling color-shifting waters of Pangong Tso',
          'Double-humped Bactrian camel safari in Nubra Valley sand dunes',
          'Spiritual tranquility at Thiksey and Hemis Monasteries',
          'Magnetic Hill anti-gravity phenomenon and Sangam river confluence',
        ]),
        bestTimeToVisit: 'June to September when highways are open, passes are snow-cleared, and weather is optimal.',
        localTips: JSON.stringify([
          'Acclimatization is essential: rest completely for the first 24–36 hours in Leh without exertion.',
          'Keep hydration high and carry Diamox or consult a physician before travel.',
          'Inner Line Permits (ILP) are required for Nubra Valley and Pangong Lake.',
        ]),
        sampleItinerary: JSON.stringify([
          { day: 1, title: 'Acclimatization & Leh Palace', plan: 'Rest, drink fluids, take an evening walk to Shanti Stupa and Leh Main Market.' },
          { day: 2, title: 'Nubra Valley via Khardung La', plan: 'Drive across Khardung La (17,982 ft) into Nubra Valley, visit Diskit Monastery and ride Bactrian camels at Hunder.' },
          { day: 3, title: 'Pangong Lake Mirage', plan: 'Travel along the Shyok route to Pangong Tso, witness magical blue waters at sunset, camp under starlit skies.' },
        ]),
      },
    },
    {
      name: 'Jaipur',
      slug: 'jaipur',
      category: 'CULTURAL',
      description: 'The iconic Pink City boasting majestic hilltop forts, ornate palaces, bustling bazaars, and rich Rajput culinary heritage.',
      country: 'India',
      state: 'Rajasthan',
      latitude: 26.9124,
      longitude: 75.7873,
      bestSeason: 'October to March',
      trendingScore: 91.0,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80',
      ]),
      guide: {
        highlights: JSON.stringify([
          'Amber Fort mirror palace (Sheesh Mahal) and elephant pathway',
          'Honeycomb facade of Hawa Mahal (Palace of Winds)',
          'Astronomical instruments of Jantar Mantar (UNESCO)',
          'City Palace museum and royal courtyards',
          'Shopping for block-printed textiles and blue pottery in Johari Bazaar',
        ]),
        bestTimeToVisit: 'November to February for mild daytime sunshine and cool evenings.',
        localTips: JSON.stringify([
          'Purchase a composite ticket at Amber Fort to enter multiple monuments at a discount.',
          'Sample Dal Baati Churma and Pyaz Kachori at Rawat Mishtan Bhandar.',
          'Sunset at Nahargarh Fort offers an unmatched panoramic view of the lit-up city.',
        ]),
        sampleItinerary: JSON.stringify([
          { day: 1, title: 'Forts & Royal Panoramas', plan: 'Explore Amber Fort, Jal Mahal photo stop, evening sunset at Nahargarh Fort.' },
          { day: 2, title: 'Palaces & Astronomy', plan: 'Visit City Palace, Jantar Mantar, Hawa Mahal, and an evening Rajasthani folk dinner at Chokhi Dhani.' },
          { day: 3, title: 'Heritage Bazaars & Crafts', plan: 'Shop in Bapu Bazaar and Johari Bazaar, visit Albert Hall Museum, sample traditional sweets.' },
        ]),
      },
    },
    {
      name: 'Jim Corbett',
      slug: 'jim-corbett',
      category: 'WILDLIFE',
      description: 'India’s oldest national park nestled in the Himalayan foothills, famed for royal Bengal tigers, wild elephants, and dense sal forests.',
      country: 'India',
      state: 'Uttarakhand',
      latitude: 29.5300,
      longitude: 78.7747,
      bestSeason: 'November to June',
      trendingScore: 88.0,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1547407139-3c921a66005c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80',
      ]),
      guide: {
        highlights: JSON.stringify([
          'Morning open-top Jeep Safari across Dhikala & Bijrani zones',
          'Bird watching along the pristine Kosi River banks',
          'Corbett Waterfall nature trek amidst teak wood groves',
          'Heritage bungalow of Jim Corbett at Kaladhungi',
          'Luxury wilderness lodge experiences with bonfire storytelling',
        ]),
        bestTimeToVisit: 'Mid-November to April when all zones are open and tiger sightings around water bodies peak.',
        localTips: JSON.stringify([
          'Dhikala forest lodge stays need to be reserved 45–90 days in advance.',
          'Wear earth-toned clothing (khaki, olive, brown) to blend into the forest.',
          'Carry a pair of 10x42 binoculars and a telephoto lens for wildlife spotting.',
        ]),
        sampleItinerary: JSON.stringify([
          { day: 1, title: 'Arrival & Riverside Serenity', plan: 'Check in to jungle resort, afternoon birdwalk along Kosi river, evening naturalist orientation.' },
          { day: 2, title: 'Deep Forest Jeep Safari', plan: 'Dawn 4x4 safari into Bijrani zone, lunch at the lodge, afternoon excursion to Garjiya Devi Temple.' },
          { day: 3, title: 'Corbett Waterfall & Departure', plan: 'Short trek to Corbett Falls, visit Corbett Museum at Kaladhungi, departure.' },
        ]),
      },
    },
    {
      name: 'Varanasi',
      slug: 'varanasi',
      category: 'CULTURAL',
      description: 'One of the world’s oldest continuously inhabited cities on the banks of the sacred Ganges River, vibrant with spiritual energy and timeless rituals.',
      country: 'India',
      state: 'Uttar Pradesh',
      latitude: 25.3176,
      longitude: 82.9739,
      bestSeason: 'October to March',
      trendingScore: 87.5,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80',
      ]),
      guide: {
        highlights: JSON.stringify([
          'Evening Ganga Aarti at Dashashwamedh Ghat with synchronized brass lamps',
          'Sunrise rowing boat ride from Assi Ghat to Manikarnika Ghat',
          'Kashi Vishwanath Golden Temple corridor',
          'Sarnath Buddhist pilgrimage site where Lord Buddha gave his first sermon',
          'Weaving workshops of Banarasi silk sarees in the old alleyways',
        ]),
        bestTimeToVisit: 'November to February for crisp morning air and comfortable ghat walks.',
        localTips: JSON.stringify([
          'Negotiate morning boat rides at Assi Ghat the previous evening for best rates.',
          'Savor Banarasi Paan, Malaiyo (winter milk froth dessert), and piping hot Kachori Jalebi.',
          'Avoid taking photographs at cremation grounds (Manikarnika and Harishchandra Ghats).',
        ]),
        sampleItinerary: JSON.stringify([
          { day: 1, title: 'Ghats & Evening Aarti', plan: 'Arrive, afternoon walk through vibrant alleyways, front-row seat on a boat for the majestic Ganga Aarti.' },
          { day: 2, title: 'Sunrise on Ganges & Sarnath', plan: '5:30 AM sunrise boat tour, breakfast of kachori-jalebi, afternoon excursion to Sarnath stupas and museum.' },
          { day: 3, title: 'Kashi Vishwanath & Silk Trails', plan: 'Darshan at Kashi Vishwanath corridor, visit Banarasi silk master weavers, savor local street food.' },
        ]),
      },
    },
    {
      name: 'Andaman Islands',
      slug: 'andaman-islands',
      category: 'BEACH',
      description: 'An archipelago of crystal-clear turquoise waters, coral reefs, bioluminescent beaches, and lush tropical rainforests.',
      country: 'India',
      state: 'Andaman and Nicobar Islands',
      latitude: 11.7401,
      longitude: 92.6586,
      bestSeason: 'October to May',
      trendingScore: 95.0,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80',
      ]),
      guide: {
        highlights: JSON.stringify([
          'Radhanagar Beach at Havelock (voted among Asia’s best beaches)',
          'Scuba diving and sea-walking at Elephant Beach',
          'Historical light and sound show at Cellular Jail in Port Blair',
          'Natural limestone caves and mangrove boat safari at Baratang Island',
          'Snorkeling with manta rays and turtles at Neil Island (Shaheed Dweep)',
        ]),
        bestTimeToVisit: 'November to April with calm turquoise seas and crystal visibility for underwater diving.',
        localTips: JSON.stringify([
          'Pre-book Makruzz or Nautika catamaran ferries between Port Blair and Havelock.',
          'Cellular network is best on Airtel/BSNL; enjoy digital detox on other beaches.',
          'Wear reef-safe sunscreen to protect delicate coral ecosystems.',
        ]),
        sampleItinerary: JSON.stringify([
          { day: 1, title: 'Port Blair & Cellular Jail', plan: 'Arrive at Port Blair, visit Cellular Jail and witness the poignant light & sound show, sunset at Corbyn’s Cove.' },
          { day: 2, title: 'Cruise to Havelock & Radhanagar', plan: 'Morning ferry to Havelock Island, check into beachfront villa, spend afternoon swimming at Radhanagar Beach.' },
          { day: 3, title: 'Coral Reef Scuba & Neil Island', plan: 'Scuba dive at Elephant Beach, afternoon ferry to Neil Island for sunset at Laxmanpur Beach.' },
        ]),
      },
    },
  ];

  const createdDestinations = [];

  for (const d of destinationsData) {
    const { guide, ...destFields } = d;
    const dest = await prisma.destination.create({
      data: {
        ...destFields,
        travelGuide: {
          create: guide,
        },
      },
    });
    createdDestinations.push(dest);
  }

  console.log(`Created ${createdDestinations.length} destinations with travel guides.`);

  // Create Hotels & Rooms
  const hotelsData = [
    {
      destSlug: 'manali',
      name: 'The Himalayan Luxury Resort & Spa',
      description: 'A Victorian Gothic castle-style sanctuary with heated outdoor pool, apple orchard trails, and panoramic snow peaks.',
      address: 'Hadimba Road, Old Manali, Himachal Pradesh 175131',
      latitude: 32.2475,
      longitude: 77.1812,
      rating: 4.8,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
      ]),
      amenities: JSON.stringify(['Free High-Speed WiFi', 'Heated Pool', 'Mountain View', 'Luxury Spa', 'Fireplace', 'Complimentary Breakfast', 'Fine Dining Restaurant']),
      rooms: [
        {
          roomType: 'Deluxe Pine View Room',
          pricePerNight: 4500,
          capacity: 2,
          totalRooms: 8,
          amenities: JSON.stringify(['King Bed', 'Private Balcony', 'Room Heater', 'HD TV', 'Tea/Coffee Maker']),
          images: JSON.stringify(['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80']),
        },
        {
          roomType: 'Castle Premier Suite',
          pricePerNight: 8500,
          capacity: 3,
          totalRooms: 4,
          amenities: JSON.stringify(['Living Room', 'Bathtub with Mountain View', 'Fireplace', 'Mini Bar', 'Butler Service']),
          images: JSON.stringify(['https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80']),
        },
      ],
    },
    {
      destSlug: 'manali',
      name: 'Solang Valley Adventure Lodge',
      description: 'Alpine wooden chalet set right next to ski slopes, paragliding landing fields, and cedar forests.',
      address: 'VPO Palchan, Solang Valley, Manali 175103',
      latitude: 32.3167,
      longitude: 77.1583,
      rating: 4.6,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=80',
      ]),
      amenities: JSON.stringify(['Ski-in/Ski-out', 'Campfire & BBQ', 'Adventure Desk', 'Restaurant', 'Free Parking', 'Pet Friendly']),
      rooms: [
        {
          roomType: 'Wooden Chalet Room',
          pricePerNight: 3200,
          capacity: 2,
          totalRooms: 10,
          amenities: JSON.stringify(['Queen Bed', 'Valley View', 'Radiator Heating', 'Balcony']),
          images: JSON.stringify(['https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80']),
        },
        {
          roomType: 'Duplex Family Chalet',
          pricePerNight: 6200,
          capacity: 4,
          totalRooms: 3,
          amenities: JSON.stringify(['2 Bedrooms', 'Attic Sleeping Area', 'Private Sun Deck', 'Kitchenette']),
          images: JSON.stringify(['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80']),
        },
      ],
    },
    {
      destSlug: 'goa',
      name: 'Taj Exotica Beachfront Resort',
      description: 'Mediterranean-style coastal oasis sprawled over 56 landscaped acres with private beach access and award-winning dining.',
      address: 'Calwaddo, Benaulim, Salcete, Goa 403716',
      latitude: 15.2588,
      longitude: 73.9212,
      rating: 4.9,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80',
      ]),
      amenities: JSON.stringify(['Private Beach Access', 'Infinity Pool', 'Jiva Ayurvedic Spa', 'Golf Course', 'Multiple Bars & Restaurants', 'Kids Club', 'Water Sports']),
      rooms: [
        {
          roomType: 'Garden Villa Room',
          pricePerNight: 9500,
          capacity: 2,
          totalRooms: 12,
          amenities: JSON.stringify(['King Bed', 'Private Verandah', 'Bathtub', 'Plush Robes', 'Espresso Machine']),
          images: JSON.stringify(['https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80']),
        },
        {
          roomType: 'Sunset Ocean View Plunge Pool Villa',
          pricePerNight: 19500,
          capacity: 3,
          totalRooms: 4,
          amenities: JSON.stringify(['Private Plunge Pool', 'Direct Ocean View', 'Outdoor Shower', 'Personal Concierge']),
          images: JSON.stringify(['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80']),
        },
      ],
    },
    {
      destSlug: 'goa',
      name: 'Wanderlust Boutique Palolem',
      description: 'Eco-chic wooden cottages 50 meters from serene Palolem beach, featuring yoga shala and healthy organic dining.',
      address: 'Main Beach Road, Palolem, Canacona, Goa 403702',
      latitude: 15.0098,
      longitude: 74.0232,
      rating: 4.7,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1000&q=80',
      ]),
      amenities: JSON.stringify(['50m to Beach', 'Yoga Classes', 'Organic Cafe', 'Free Wi-Fi', 'Surfboard Rental', 'Cocktail Bar']),
      rooms: [
        {
          roomType: 'Boho Beach Cottage',
          pricePerNight: 3500,
          capacity: 2,
          totalRooms: 10,
          amenities: JSON.stringify(['King Bed', 'Open Air Rain Shower', 'Hammock Patio', 'Air Conditioning']),
          images: JSON.stringify(['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80']),
        },
      ],
    },
    {
      destSlug: 'munnar',
      name: 'Fragrant Nature Tea Retreat',
      description: 'Luxury boutique resort surrounded by endless cardamom estates and mist-kissed waterfalls.',
      address: 'Pothamedu, Bison Valley Road, Munnar 685612',
      latitude: 10.0512,
      longitude: 77.0621,
      rating: 4.7,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
      ]),
      amenities: JSON.stringify(['Tea Plantation Tours', 'Ayurvedic Spa', 'Fireplace in all Rooms', 'Glasshouse Restaurant', 'Free Wi-Fi']),
      rooms: [
        {
          roomType: 'Tropic Green Room',
          pricePerNight: 5200,
          capacity: 2,
          totalRooms: 8,
          amenities: JSON.stringify(['King Bed', 'Cardamom Valley View', 'Fireplace', 'Heated Bathroom']),
          images: JSON.stringify(['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80']),
        },
      ],
    },
    {
      destSlug: 'leh-ladakh',
      name: 'The Grand Dragon Ladakh',
      description: 'Premier luxury hotel in Leh equipped with solar heated facilities, Royal Ladakhi wood carvings, and mountain views.',
      address: 'Sheynam, Old Road, Leh, Ladakh 194101',
      latitude: 34.1567,
      longitude: 77.5741,
      rating: 4.8,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=80',
      ]),
      amenities: JSON.stringify(['Oxygen Enriched Rooms', 'Central Solar Heating', 'Multi-Cuisine Buffet', 'Cultural Evenings', 'Travel Desk for Permits']),
      rooms: [
        {
          roomType: 'Royal Heritage Mountain Suite',
          pricePerNight: 9800,
          capacity: 2,
          totalRooms: 6,
          amenities: JSON.stringify(['King Bed', 'Stok Kangri Range View', 'Underfloor Heating', 'Oxygen Concentrator Support', 'Mini Bar']),
          images: JSON.stringify(['https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80']),
        },
      ],
    },
    {
      destSlug: 'jaipur',
      name: 'Rambagh Palace Jaipur',
      description: 'Former residence of the Maharaja of Jaipur, renowned as the Jewel of Jaipur with royal gardens and hand-carved marble.',
      address: 'Bhawani Singh Road, Jaipur, Rajasthan 302005',
      latitude: 26.8974,
      longitude: 75.8082,
      rating: 4.9,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80',
      ]),
      amenities: JSON.stringify(['Vintage Car Transfers', 'Peacock Gardens', 'Royal Spa', 'Indoor & Outdoor Pool', 'Steam Bath', 'Fine Dining in Royal Steam Engine']),
      rooms: [
        {
          roomType: 'Palace Historical Room',
          pricePerNight: 16000,
          capacity: 2,
          totalRooms: 6,
          amenities: JSON.stringify(['Royal Four Poster Bed', 'Antique Furniture', 'Marble Bathtub', 'High Tea Access']),
          images: JSON.stringify(['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80']),
        },
      ],
    },
    {
      destSlug: 'jim-corbett',
      name: 'Aahana The Corbett Wilderness',
      description: 'Eco-luxury jungle retreat bordering the Bijrani safari zone, renowned for organic farming and wilderness hospitality.',
      address: 'Vill. Semalkhaliya, Jhilmil, Ramnagar, Nainital 244715',
      latitude: 29.3982,
      longitude: 79.1124,
      rating: 4.8,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1000&q=80',
      ]),
      amenities: JSON.stringify(['Direct Jungle Border', '4x4 Safari Desk', 'Swimming Pool', 'Organic Farm-to-Table', 'Naturalist Guided Walks']),
      rooms: [
        {
          roomType: 'Corbett Club Room',
          pricePerNight: 7500,
          capacity: 2,
          totalRooms: 10,
          amenities: JSON.stringify(['King Bed', 'Forest View Balcony', 'Living Area', 'Natural Herbal Toiletries']),
          images: JSON.stringify(['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80']),
        },
      ],
    },
    {
      destSlug: 'andaman-islands',
      name: 'Barefoot at Havelock',
      description: 'Secluded rainforest resort set right on the award-winning pristine sands of Radhanagar Beach.',
      address: 'Beach No. 7, Radhanagar, Havelock Island 744211',
      latitude: 11.9841,
      longitude: 92.9520,
      rating: 4.8,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1000&q=80',
      ]),
      amenities: JSON.stringify(['Direct Radhanagar Beach Access', 'Scuba Center', 'Mahua Spa', 'Barefoot Bar', 'Jungle Walks']),
      rooms: [
        {
          roomType: 'Andaman Nicobari Villa',
          pricePerNight: 11000,
          capacity: 2,
          totalRooms: 8,
          amenities: JSON.stringify(['King Bed', 'Hardwood Architecture', 'Open Sky Rain Shower', 'Private Patio']),
          images: JSON.stringify(['https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80']),
        },
      ],
    },
  ];

  for (const h of hotelsData) {
    const dest = createdDestinations.find((d) => d.slug === h.destSlug);
    if (!dest) continue;

    const { rooms, destSlug, ...hotelFields } = h;
    const hotel = await prisma.hotel.create({
      data: {
        ...hotelFields,
        destinationId: dest.id,
        rooms: {
          create: rooms,
        },
      },
    });

    // Add a demo review
    await prisma.review.create({
      data: {
        hotelId: hotel.id,
        userId: demoUser.id,
        rating: 5,
        comment: `Outstanding stay at ${hotel.name}! The views and hospitality were memorable. Will definitely book again through TravelHub.`,
      },
    });
  }

  console.log('Created hotels with room types and initial reviews.');

  // Create Vehicles (Cars & Bikes)
  const vehiclesData = [
    {
      name: 'Mahindra Thar 4x4 Convertible',
      type: 'CAR',
      brand: 'Mahindra',
      modelYear: 2024,
      pricePerHour: 350,
      pricePerDay: 3600,
      securityHold: 5000,
      fuelType: 'Diesel',
      transmission: 'Manual',
      seatingCapacity: 4,
      city: 'Manali',
      currentLat: 32.2432,
      currentLng: 77.1892,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
      ]),
    },
    {
      name: 'Royal Enfield Himalayan 450',
      type: 'BIKE',
      brand: 'Royal Enfield',
      modelYear: 2024,
      pricePerHour: 180,
      pricePerDay: 1600,
      securityHold: 2000,
      fuelType: 'Petrol',
      transmission: 'Manual',
      seatingCapacity: 2,
      city: 'Manali',
      currentLat: 32.2450,
      currentLng: 77.1870,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80',
      ]),
    },
    {
      name: 'Jeep Compass Trailhawk 4x4',
      type: 'CAR',
      brand: 'Jeep',
      modelYear: 2023,
      pricePerHour: 450,
      pricePerDay: 4800,
      securityHold: 6000,
      fuelType: 'Diesel',
      transmission: 'Automatic',
      seatingCapacity: 5,
      city: 'Leh-Ladakh',
      currentLat: 34.1526,
      currentLng: 77.5771,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
      ]),
    },
    {
      name: 'Royal Enfield Classic 350 Desert Storm',
      type: 'BIKE',
      brand: 'Royal Enfield',
      modelYear: 2023,
      pricePerHour: 150,
      pricePerDay: 1300,
      securityHold: 2000,
      fuelType: 'Petrol',
      transmission: 'Manual',
      seatingCapacity: 2,
      city: 'Leh-Ladakh',
      currentLat: 34.1550,
      currentLng: 77.5790,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80',
      ]),
    },
    {
      name: 'Hyundai Creta SX Turbo',
      type: 'CAR',
      brand: 'Hyundai',
      modelYear: 2024,
      pricePerHour: 300,
      pricePerDay: 3200,
      securityHold: 4000,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seatingCapacity: 5,
      city: 'Goa',
      currentLat: 15.2993,
      currentLng: 74.1240,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
      ]),
    },
    {
      name: 'Ather 450X Gen 3 Electric Scooter',
      type: 'BIKE',
      brand: 'Ather',
      modelYear: 2024,
      pricePerHour: 120,
      pricePerDay: 900,
      securityHold: 1500,
      fuelType: 'Electric',
      transmission: 'Automatic',
      seatingCapacity: 2,
      city: 'Goa',
      currentLat: 15.3050,
      currentLng: 74.1200,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
      ]),
    },
    {
      name: 'Toyota Innova Crysta ZX',
      type: 'CAR',
      brand: 'Toyota',
      modelYear: 2023,
      pricePerHour: 400,
      pricePerDay: 4200,
      securityHold: 5000,
      fuelType: 'Diesel',
      transmission: 'Automatic',
      seatingCapacity: 7,
      city: 'Munnar',
      currentLat: 10.0889,
      currentLng: 77.0595,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
      ]),
    },
    {
      name: 'Honda Hness CB350',
      type: 'BIKE',
      brand: 'Honda',
      modelYear: 2024,
      pricePerHour: 160,
      pricePerDay: 1400,
      securityHold: 2000,
      fuelType: 'Petrol',
      transmission: 'Manual',
      seatingCapacity: 2,
      city: 'Munnar',
      currentLat: 10.0870,
      currentLng: 77.0610,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1558980664-769d59546b3d?auto=format&fit=crop&w=800&q=80',
      ]),
    },
    {
      name: 'Tata Safari Dark Edition',
      type: 'CAR',
      brand: 'Tata',
      modelYear: 2024,
      pricePerHour: 420,
      pricePerDay: 4500,
      securityHold: 5000,
      fuelType: 'Diesel',
      transmission: 'Automatic',
      seatingCapacity: 7,
      city: 'Jaipur',
      currentLat: 26.9124,
      currentLng: 75.7873,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80',
      ]),
    },
    {
      name: 'Maruti Suzuki Gypsy King 4x4',
      type: 'CAR',
      brand: 'Maruti Suzuki',
      modelYear: 2022,
      pricePerHour: 300,
      pricePerDay: 3000,
      securityHold: 4000,
      fuelType: 'Petrol',
      transmission: 'Manual',
      seatingCapacity: 6,
      city: 'Jim Corbett',
      currentLat: 29.5300,
      currentLng: 78.7747,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
      ]),
    },
  ];

  for (const v of vehiclesData) {
    await prisma.vehicle.create({
      data: v,
    });
  }

  console.log(`Created ${vehiclesData.length} vehicles.`);

  // Create Live Info Caches for top destinations
  for (const dest of createdDestinations) {
    // Weather cache
    const weatherMock = {
      temperature: dest.category === 'HILL_STATION' || dest.slug === 'leh-ladakh' ? 12 : 28,
      feelsLike: dest.category === 'HILL_STATION' ? 10 : 30,
      condition: dest.category === 'BEACH' ? 'Sunny & Gentle Breeze' : dest.category === 'HILL_STATION' ? 'Crisp Mountain Breeze' : 'Partly Cloudy',
      humidity: dest.category === 'BEACH' ? 68 : 45,
      windSpeedKmH: 14,
      uvIndex: 6,
      airQualityIndex: 'Good (AQI 38)',
      forecast: [
        { day: 'Tomorrow', high: 26, low: 14, condition: 'Clear Skies' },
        { day: 'Day 2', high: 25, low: 13, condition: 'Sunny' },
        { day: 'Day 3', high: 24, low: 12, condition: 'Mild Clouds' },
      ],
    };

    // Traffic cache
    const trafficMock = {
      congestionLevel: dest.slug === 'goa' || dest.slug === 'manali' ? 'MODERATE' : 'LOW',
      congestionIndexPercent: dest.slug === 'manali' ? 42 : dest.slug === 'goa' ? 38 : 22,
      averageSpeedKmh: 45,
      peakHours: '10:30 AM - 1:00 PM & 5:30 PM - 8:00 PM',
      bestTravelWindow: 'Early mornings before 9:00 AM or post 8:30 PM',
      liveAlerts: [
        'Smooth movement along main bypass and tourist viewpoints.',
        'Speed limit strictly monitored near school zones and valley curves.',
      ],
    };

    // Wildlife cache (GBIF simulated biodiversity)
    const wildlifeMock = {
      regionName: `${dest.name} Ecosystem & Biosphere`,
      speciesCount: 140,
      spottingProbability: dest.category === 'WILDLIFE' ? 'HIGH (85%)' : dest.category === 'NATURE' ? 'MEDIUM (60%)' : 'MODERATE',
      featuredFauna:
        dest.slug === 'jim-corbett'
          ? [
              { name: 'Royal Bengal Tiger (Panthera tigris)', status: 'Endangered', sightingRate: '75% in Bijrani & Dhikala', bestTime: 'Dawn & Twilight' },
              { name: 'Asian Elephant (Elephas maximus)', status: 'Endangered', sightingRate: '90% along Ramganga River', bestTime: 'Afternoons' },
              { name: 'Spotted Deer (Axis axis)', status: 'Least Concern', sightingRate: 'Very High', bestTime: 'Throughout day' },
              { name: 'Gharial Crocodile', status: 'Critically Endangered', sightingRate: 'Common near reservoir', bestTime: 'Midday sunning' },
            ]
          : dest.slug === 'munnar'
          ? [
              { name: 'Nilgiri Tahr (Nilgiritragus hylocrius)', status: 'Endangered', sightingRate: '88% at Eravikulam', bestTime: 'Morning 7:30 AM' },
              { name: 'Malabar Giant Squirrel', status: 'Least Concern', sightingRate: 'Frequent in Shola forest', bestTime: 'Mid-morning' },
              { name: 'Nilgiri Langur', status: 'Vulnerable', sightingRate: 'Common', bestTime: 'Tree canopy' },
            ]
          : dest.slug === 'leh-ladakh'
          ? [
              { name: 'Snow Leopard (Panthera uncia)', status: 'Vulnerable', sightingRate: 'Rare / Winter High (Hemis NP)', bestTime: 'Winter months' },
              { name: 'Himalayan Marmot', status: 'Least Concern', sightingRate: 'Very High along passes', bestTime: 'Warm midday' },
              { name: 'Black-necked Crane', status: 'Near Threatened', sightingRate: 'Wetlands of Changthang', bestTime: 'Summer breeding' },
            ]
          : [
              { name: 'Indian Peafowl (Pavo cristatus)', status: 'Least Concern', sightingRate: 'High', bestTime: 'Mornings' },
              { name: 'Kingfisher (Alcedo atthis)', status: 'Least Concern', sightingRate: 'Near coastal & backwaters', bestTime: 'Early morning' },
              { name: 'Common Palm Civet', status: 'Least Concern', sightingRate: 'Nocturnal', bestTime: 'Night trails' },
            ],
    };

    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.liveInfoCache.create({
      data: {
        destinationId: dest.id,
        cacheType: 'WEATHER',
        payloadJson: JSON.stringify(weatherMock),
        expiresAt: expires,
      },
    });

    await prisma.liveInfoCache.create({
      data: {
        destinationId: dest.id,
        cacheType: 'TRAFFIC',
        payloadJson: JSON.stringify(trafficMock),
        expiresAt: expires,
      },
    });

    await prisma.liveInfoCache.create({
      data: {
        destinationId: dest.id,
        cacheType: 'WILDLIFE',
        payloadJson: JSON.stringify(wildlifeMock),
        expiresAt: expires,
      },
    });
  }

  console.log('Created live info caches for weather, traffic, and biodiversity.');

  // Create Wishlist items for demo user
  await prisma.wishlist.create({
    data: {
      userId: demoUser.id,
      destinationId: createdDestinations[0].id, // Manali
    },
  });

  await prisma.wishlist.create({
    data: {
      userId: demoUser.id,
      destinationId: createdDestinations[1].id, // Goa
    },
  });

  // Create a Demo Trip Share session
  const tripShare = await prisma.tripShare.create({
    data: {
      userId: demoUser.id,
      title: 'Himalayan Escape — Manali & Solang Valley',
      shareToken: 'demo-himalayan-trail-2026',
      isActive: true,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h validity
      pins: {
        create: [
          {
            latitude: 32.2432,
            longitude: 77.1892,
            label: 'Old Manali Base Camp',
            description: 'Arrived at our boutique lodge. Crisp cool air and apple blossoms all around!',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          },
          {
            latitude: 32.3167,
            longitude: 77.1583,
            label: 'Solang Paragliding Launch Point',
            description: 'Took off from the high ridge. Unbelievable 360-degree snow peaks.',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
          },
          {
            latitude: 32.3619,
            longitude: 77.1278,
            label: 'Atal Tunnel South Portal',
            description: 'Crossing into Lahaul Valley through the tunnel. Engineering marvel!',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
          },
        ],
      },
    },
  });

  console.log(`Created demo TripShare session with token: ${tripShare.shareToken}`);

  // Seed Emergency Contacts for demoUser
  await prisma.emergencyContact.createMany({
    data: [
      {
        userId: demoUser.id,
        name: 'Rohit Sharma (Brother)',
        phone: '+91 98765 11223',
        relation: 'Brother',
        priority: 1,
      },
      {
        userId: demoUser.id,
        name: 'Pooja Sharma (Spouse)',
        phone: '+91 98765 44332',
        relation: 'Spouse',
        priority: 2,
      },
    ],
  });

  // Seed Emergency Phrases (English & Hindi)
  await prisma.emergencyPhrase.createMany({
    data: [
      {
        countryCode: 'IN',
        category: 'medical',
        englishText: 'I need an ambulance immediately',
        localText: 'मुझे तुरंत एम्बुलेंस चाहिए',
        phonetic: 'Mujhe turant ambulance chahiye',
        localLanguage: 'Hindi',
      },
      {
        countryCode: 'IN',
        category: 'medical',
        englishText: 'Where is the nearest hospital or doctor?',
        localText: 'निकटतम अस्पताल या डॉक्टर कहाँ है?',
        phonetic: 'Nikat-tam aspatal ya doctor kahan hai?',
        localLanguage: 'Hindi',
      },
      {
        countryCode: 'IN',
        category: 'police',
        englishText: 'I need police assistance right now',
        localText: 'मुझे अभी पुलिस सहायता चाहिए',
        phonetic: 'Mujhe abhi police sahayata chahiye',
        localLanguage: 'Hindi',
      },
      {
        countryCode: 'IN',
        category: 'documents',
        englishText: 'I lost my passport and wallet',
        localText: 'मेरा पासपोर्ट और बटुआ खो गया है',
        phonetic: 'Mera passport aur batua kho gaya hai',
        localLanguage: 'Hindi',
      },
      {
        countryCode: 'IN',
        category: 'general',
        englishText: 'Please help me call this emergency number',
        localText: 'कृपया इस आपातकालीन नंबर पर कॉल करने में मेरी मदद करें',
        phonetic: 'Kripya is aapat-kaaleen number par call karne me meri madad karein',
        localLanguage: 'Hindi',
      },
    ],
  });

  // Seed Emergency Directory for Manali & Goa
  await prisma.emergencyDirectory.createMany({
    data: [
      {
        destinationId: createdDestinations[0].id, // Manali
        type: 'police',
        name: 'Manali Tourist Police Station',
        phone: '+91 1902 252326',
        address: 'Mall Road, Old Manali Crossing',
      },
      {
        destinationId: createdDestinations[0].id, // Manali
        type: 'hospital',
        name: 'Civil Hospital Manali (24/7 Trauma Care)',
        phone: '+91 1902 253385',
        address: 'Model Town, Siyal, Manali',
      },
      {
        destinationId: createdDestinations[0].id, // Manali
        type: 'platform_support',
        name: 'TravelHub 24/7 Himalayan Emergency Dispatch',
        phone: '+91 800-425-TRIP',
        address: 'Dedicated Concierge Desk',
      },
      {
        destinationId: createdDestinations[1].id, // Goa
        type: 'police',
        name: 'Goa Coastal & Tourist Police Station',
        phone: '+91 832 2277255',
        address: 'Calangute - Baga Road, North Goa',
      },
      {
        destinationId: createdDestinations[1].id, // Goa
        type: 'hospital',
        name: 'Goa Medical College Hospital (GMC)',
        phone: '+91 832 2458700',
        address: 'NH 66, Bambolim, Goa',
      },
    ],
  });

  // Seed Local Picks (Offbeat spots)
  await prisma.localPick.createMany({
    data: [
      {
        destinationId: createdDestinations[0].id, // Manali
        name: 'Jogini Waterfall Hidden Pine Trail',
        description: 'Trek past ancient deodar trees to a secluded upper cliff pool. Far away from typical tourist crowds with crystal Himalayan stream water.',
        category: 'VIEWPOINT',
        addedBy: 'Tenzin (Local High-Altitude Guide)',
        upvotes: 68,
        isSponsored: false,
        imageUrl: 'https://images.unsplash.com/photo-1596761225881-229ef58b901a?auto=format&fit=crop&w=600&q=80',
      },
      {
        destinationId: createdDestinations[0].id, // Manali
        name: 'Old Manali Woodfired Siddu Shack',
        description: 'Cozy traditional mud-brick home serving fresh steamed walnut Siddu with clarified ghee and homemade apricot chutney.',
        category: 'FOOD',
        addedBy: 'Aarav Sharma (Verified Traveler)',
        upvotes: 49,
        isSponsored: false,
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
      },
      {
        destinationId: createdDestinations[1].id, // Goa
        name: 'Cola Beach Fresh Water Lagoon',
        description: 'A hidden emerald lagoon meeting the Arabian Sea surrounded by dense coconut groves. Completely untouched by noisy beach shacks.',
        category: 'VIEWPOINT',
        addedBy: 'Savio (Goan Coastal Naturalist)',
        upvotes: 94,
        isSponsored: false,
        imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
      },
      {
        destinationId: createdDestinations[1].id, // Goa
        name: 'Fontainhas Heritage Bakery Walk',
        description: 'Taste 120-year-old Bebinca recipes and Portuguese pastéis de nata in quiet cobblestone alleyways of the Latin Quarter.',
        category: 'CULTURE',
        addedBy: 'Maria (Panjim Heritage Walk Leader)',
        upvotes: 82,
        isSponsored: false,
        imageUrl: 'https://images.unsplash.com/photo-1590393282245-c19d443425cb?auto=format&fit=crop&w=600&q=80',
      },
    ],
  });

  // Seed 12-Month Seasonal Insights for Manali & Goa
  const manaliMonths = [
    { month: 1, monthName: 'Jan', avgTempC: -1.5, rainfallLevel: 'LOW', verdict: 'Peak Snow Season — Heavy Snowfall & Skiing', notes: 'Rohtang Pass closed; Solang Valley operational for snow activities.' },
    { month: 2, monthName: 'Feb', avgTempC: 1.2, rainfallLevel: 'LOW', verdict: 'Winter Wonderland — Solang Valley Ski Festival', notes: 'Cold nights, clear blue skies on sunny days.' },
    { month: 3, monthName: 'Mar', avgTempC: 7.8, rainfallLevel: 'LOW', verdict: 'Spring Thaw — Apple Orchards Blossom', notes: 'Pleasant daytime weather, ideal for pine forest treks.' },
    { month: 4, monthName: 'Apr', avgTempC: 13.5, rainfallLevel: 'LOW', verdict: 'Best Spring Season — Perfect for Sightseeing', notes: 'Comfortable sunshine, blooming valley flowers.' },
    { month: 5, monthName: 'May', avgTempC: 18.0, rainfallLevel: 'LOW', verdict: 'Peak Summer Escapes — High Tourist Season', notes: 'Book hotels well in advance; pleasant 18°C weather.' },
    { month: 6, monthName: 'Jun', avgTempC: 21.0, rainfallLevel: 'MODERATE', verdict: 'Pleasant Climates — Rohtang Pass Opens', notes: 'Best time for high-altitude passes and paragliding.' },
    { month: 7, monthName: 'Jul', avgTempC: 19.5, rainfallLevel: 'HIGH', verdict: 'Monsoon Begins — Lush Greenery, Occasional Landslides', notes: 'Check highway status before driving; carry rain gear.' },
    { month: 8, monthName: 'Aug', avgTempC: 18.8, rainfallLevel: 'HIGH', verdict: 'Peak Monsoon — Serene Waterfalls, Lower Rates', notes: 'Best for budget travelers who enjoy mist and quiet.' },
    { month: 9, monthName: 'Sep', avgTempC: 16.2, rainfallLevel: 'MODERATE', verdict: 'Post-Monsoon Refresh — Fresh Crisp Mountain Air', notes: 'Greenest landscapes, clear visibility, apple harvest.' },
    { month: 10, monthName: 'Oct', avgTempC: 11.0, rainfallLevel: 'LOW', verdict: 'Golden Autumn — Crisp Sun, Stunning Foliage', notes: 'Ideal trekking weather; chill sets in after sunset.' },
    { month: 11, monthName: 'Nov', avgTempC: 6.0, rainfallLevel: 'LOW', verdict: 'Early Winter — First Snow on Mountain Peaks', notes: 'Quiet month before year-end rush; pack warm jackets.' },
    { month: 12, monthName: 'Dec', avgTempC: 1.5, rainfallLevel: 'LOW', verdict: 'Festive Snow Season — Christmas & New Year', notes: 'Snow begins in mid-to-late December in higher reaches.' },
  ];

  for (const m of manaliMonths) {
    await prisma.seasonalInsight.create({
      data: {
        destinationId: createdDestinations[0].id,
        month: m.month,
        monthName: m.monthName,
        avgTempC: m.avgTempC,
        rainfallLevel: m.rainfallLevel,
        verdict: m.verdict,
        notes: m.notes,
      },
    });
  }

  // Seed sample completed booking with price breakdown for demoUser to test verified reviews and My Trip
  const sampleHotel = await prisma.hotel.findFirst({
    where: { destinationId: createdDestinations[0].id },
    include: { rooms: true },
  });

  if (sampleHotel && sampleHotel.rooms.length > 0) {
    const room = sampleHotel.rooms[0];
    const checkIn = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days ahead
    const checkOut = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000);
    const basePrice = room.pricePerNight * 3;
    const taxesAndFees = Math.round(basePrice * 0.12);
    const serviceFee = Math.round(basePrice * 0.03);
    const totalPrice = basePrice + taxesAndFees + serviceFee;

    const sampleBooking = await prisma.hotelBooking.create({
      data: {
        userId: demoUser.id,
        hotelId: sampleHotel.id,
        roomId: room.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guestCount: 2,
        totalPrice,
        status: 'CONFIRMED',
        voucherUrl: '/vouchers/TH-VCHR-DEMO-MANALI',
      },
    });

    await prisma.priceBreakdown.create({
      data: {
        hotelBookingId: sampleBooking.id,
        basePrice,
        taxesAndFees,
        serviceFee,
        resortFee: 0,
        totalPrice,
      },
    });

    // Create a demo Unified Trip for demoUser
    const demoTrip = await prisma.trip.create({
      data: {
        userId: demoUser.id,
        name: 'Himalayan Summer Escape — Manali & Solang',
        destinationId: createdDestinations[0].id,
        startDate: checkIn,
        endDate: checkOut,
        hotelBookingIds: JSON.stringify([sampleBooking.id]),
        vehicleBookingIds: '[]',
        notes: 'Booked Solang valley paragliding slot for Day 2 morning. Remember warm jackets!',
      },
    });

    await prisma.tripChecklistItem.createMany({
      data: [
        { tripId: demoTrip.id, label: 'Download offline maps & emergency phrases pack', category: 'SAFETY', isDone: true, isAuto: true },
        { tripId: demoTrip.id, label: 'Carry Gov ID / Aadhaar card originals', category: 'DOCUMENTS', isDone: true, isAuto: true },
        { tripId: demoTrip.id, label: 'Pack thermals, windcheater & woolen gloves', category: 'PACKING', isDone: false, isAuto: true },
        { tripId: demoTrip.id, label: 'Configure Trip Safety Mode & ping interval', category: 'SAFETY', isDone: false, isAuto: true },
        { tripId: demoTrip.id, label: 'Check Atal Tunnel timing and morning weather', category: 'DOCUMENTS', isDone: false, isAuto: false },
      ],
    });

    console.log(`Created sample confirmed booking #${sampleBooking.id} and Unified Trip #${demoTrip.id}`);
  }

  // Seed Emergency Contacts for demoUser
  await prisma.emergencyContact.createMany({
    data: [
      {
        userId: demoUser.id,
        name: 'Ananya Sharma (Sister)',
        phone: '+91 98765 43210',
        relation: 'Sister',
        priority: 1,
      },
      {
        userId: demoUser.id,
        name: 'Rohan Verma (Friend)',
        phone: '+91 98123 45678',
        relation: 'Friend',
        priority: 2,
      },
    ],
  });

  // Seed Bilingual Offline Emergency Phrases
  await prisma.emergencyPhrase.createMany({
    data: [
      {
        countryCode: 'IN',
        category: 'medical',
        englishText: 'I need an ambulance urgently.',
        localText: 'मुझे तुरंत एम्बुलेंस चाहिए।',
        phonetic: 'Mujhe turant ambulance chahiye.',
        localLanguage: 'Hindi',
      },
      {
        countryCode: 'IN',
        category: 'medical',
        englishText: 'Where is the nearest hospital or pharmacy?',
        localText: 'नज़दीकी अस्पताल या दवा की दुकान कहाँ है?',
        phonetic: 'Nazdeeki aspatal ya dawa ki dukaan kahan hai?',
        localLanguage: 'Hindi',
      },
      {
        countryCode: 'IN',
        category: 'medical',
        englishText: 'I am having severe chest pain / difficulty breathing.',
        localText: 'मुझे सीने में तेज दर्द / सांस लेने में तकलीफ हो रही है।',
        phonetic: 'Mujhe seene mein tez dard / saans lene mein takleef ho rahi hai.',
        localLanguage: 'Hindi',
      },
      {
        countryCode: 'IN',
        category: 'police',
        englishText: 'Please help me, I am in danger.',
        localText: 'कृपया मेरी मदद करें, मैं खतरे में हूँ।',
        phonetic: 'Kripya meri madad karein, main khatre mein hoon.',
        localLanguage: 'Hindi',
      },
      {
        countryCode: 'IN',
        category: 'police',
        englishText: 'I need to contact the Tourist Police.',
        localText: 'मुझे टूरिस्ट पुलिस से संपर्क करना है।',
        phonetic: 'Mujhe tourist police se sampark karna hai.',
        localLanguage: 'Hindi',
      },
      {
        countryCode: 'IN',
        category: 'general',
        englishText: 'Can you please share your phone to call for emergency help?',
        localText: 'क्या मैं मदद के लिए आपका फ़ोन इस्तेमाल कर सकता हूँ?',
        phonetic: 'Kya main madad ke liye aapka phone istemaal kar sakta hoon?',
        localLanguage: 'Hindi',
      },
      {
        countryCode: 'IN',
        category: 'general',
        englishText: 'I am lost. Can you point me towards the main road or taxi stand?',
        localText: 'मैं रास्ता भटक गया हूँ। क्या आप मुझे मुख्य सड़क या टैक्सी स्टैंड दिखा सकते हैं?',
        phonetic: 'Main raasta bhatak gaya hoon. Kya aap mujhe mukhya sadak ya taxi stand dikha sakte hain?',
        localLanguage: 'Hindi',
      },
    ],
  });

  // Seed Emergency Directory for Manali & Goa
  const manaliDest = createdDestinations.find((d) => d.slug === 'manali');
  if (manaliDest) {
    await prisma.emergencyDirectory.createMany({
      data: [
        {
          destinationId: manaliDest.id,
          type: 'hospital',
          name: 'Civil Hospital Manali (Emergency 24x7)',
          phone: '+91 1902 252327',
          address: 'Mall Road, Manali, Himachal Pradesh 175131',
        },
        {
          destinationId: manaliDest.id,
          type: 'police',
          name: 'Manali Tourist Police Station',
          phone: '+91 1902 252322',
          address: 'Model Town, Near Private Bus Stand, Manali',
        },
        {
          destinationId: manaliDest.id,
          type: 'police',
          name: 'State Disaster Management Authority (SDMA)',
          phone: '1070',
          address: 'Himachal Pradesh State Emergency Operations',
        },
        {
          destinationId: manaliDest.id,
          type: 'platform_support',
          name: 'TravelHub 24/7 Rapid Incident Desk',
          phone: '+91 1800 200 8899',
          address: 'Priority Traveler Safety & Breakdown Assistance',
        },
      ],
    });

    // Seed Local Picks for Manali
    await prisma.localPick.createMany({
      data: [
        {
          destinationId: manaliDest.id,
          name: 'Jogini Waterfall Hidden Upper Trail',
          description: 'Bypass the crowded base steps; this pine-shaded trail climbs up behind Vashisht village to panoramic natural spray pools.',
          category: 'VIEWPOINT',
          addedBy: 'Local Mountain Guide',
          upvotes: 42,
          isSponsored: false,
          imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
        },
        {
          destinationId: manaliDest.id,
          name: 'Old Manali Riverside Woodfired Bakery',
          description: 'Unmarked stone cottage serving sourdough apple cinnamon rolls and freshly brewed mountain mint tea next to the Beas river.',
          category: 'FOOD',
          addedBy: 'Verified Traveler',
          upvotes: 38,
          isSponsored: false,
          imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
        },
        {
          destinationId: manaliDest.id,
          name: 'Sethan Igloo Village & Stargazing Ridge',
          description: 'Quiet Buddhist village located 12km uphill from Prini. Pristine night skies, bouldering, and traditional homestays away from commercial hotels.',
          category: 'EXPERIENCE',
          addedBy: 'Local Guide',
          upvotes: 56,
          isSponsored: false,
          imageUrl: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=800&q=80',
        },
      ],
    });

    // Seed Seasonal Insights for Manali (12 Months)
    const manaliSeasons = [
      { month: 1, monthName: 'Jan', avgTempC: 1, rainfallLevel: 'MODERATE', verdict: 'Snow Sports Peak', notes: 'Heavy snowfall, ski slopes in Solang fully active. Sub-zero nights.' },
      { month: 2, monthName: 'Feb', avgTempC: 3, rainfallLevel: 'LOW', verdict: 'Crisp Snow & Quiet', notes: 'Snow begins settling; great window for photography and romantic quiet trips.' },
      { month: 3, monthName: 'Mar', avgTempC: 8, rainfallLevel: 'LOW', verdict: 'Spring Thaw', notes: 'Apple orchards begin budding; mild daytime sunny weather.' },
      { month: 4, monthName: 'Apr', avgTempC: 14, rainfallLevel: 'LOW', verdict: 'Best Time to Visit', notes: 'Crystal-clear views, comfortable trekking temperatures, and blooming flora.' },
      { month: 5, monthName: 'May', avgTempC: 19, rainfallLevel: 'LOW', verdict: 'Peak Summer Escape', notes: 'Pleasant weather for paragliding, river rafting, and camping.' },
      { month: 6, monthName: 'Jun', avgTempC: 22, rainfallLevel: 'MODERATE', verdict: 'Warm Sunny Days', notes: 'Rohtang Pass and Atal Tunnel bustling with high-altitude snow points.' },
      { month: 7, monthName: 'Jul', avgTempC: 20, rainfallLevel: 'HIGH', verdict: 'Monsoon Rains', notes: 'Emerald valleys, but monitor highway advisory for landslide alerts.' },
      { month: 8, monthName: 'Aug', avgTempC: 19, rainfallLevel: 'HIGH', verdict: 'Monsoon Off-Season', notes: 'Cozy retreat inside cedar chalets; budget accommodations abound.' },
      { month: 9, monthName: 'Sep', avgTempC: 16, rainfallLevel: 'LOW', verdict: 'Best Time to Visit', notes: 'Crystal mountain clarity post-rains. Peak trekking and camping window.' },
      { month: 10, monthName: 'Oct', avgTempC: 12, rainfallLevel: 'LOW', verdict: 'Golden Autumn Glow', notes: 'Poplars turn golden, starry nights, and crisp mountain mornings.' },
      { month: 11, monthName: 'Nov', avgTempC: 7, rainfallLevel: 'LOW', verdict: 'Early Winter Chill', notes: 'First dustings of snow on higher ridges. Peaceful atmosphere.' },
      { month: 12, monthName: 'Dec', avgTempC: 3, rainfallLevel: 'MODERATE', verdict: 'Winter Wonderland', notes: 'Fresh white snowfall, Christmas/New Year festivities, and cozy fireplaces.' },
    ];

    await prisma.seasonalInsight.createMany({
      data: manaliSeasons.map((s) => ({
        destinationId: manaliDest.id,
        ...s,
      })),
    });
  }

  console.log('Database seeding completed successfully! ✨');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
