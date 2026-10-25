import { Snapshot, ComparisonResult, GrowthDataPoint, InstagramUser } from '../types';

export const SAMPLE_FOLLOWERS_PREVIOUS: InstagramUser[] = [
  { username: 'design.sophia', name: 'Sophia Chen', profileUrl: 'https://www.instagram.com/design.sophia', timestamp: 1726000000000 },
  { username: 'marcus_visuals', name: 'Marcus Vance', profileUrl: 'https://www.instagram.com/marcus_visuals', timestamp: 1726100000000 },
  { username: 'elena_rodriguez', name: 'Elena Rodriguez', profileUrl: 'https://www.instagram.com/elena_rodriguez', timestamp: 1726150000000 },
  { username: 'pixelcraft.studio', name: 'Pixelcraft Studio', profileUrl: 'https://www.instagram.com/pixelcraft.studio', timestamp: 1726200000000 },
  { username: 'kai_zenith', name: 'Kai Tanaka', profileUrl: 'https://www.instagram.com/kai_zenith', timestamp: 1726300000000 },
  { username: 'alexa_wanderlust', name: 'Alexa Miller', profileUrl: 'https://www.instagram.com/alexa_wanderlust', timestamp: 1726400000000 },
  { username: 'crypto_daily_drops', name: 'Daily Web3', profileUrl: 'https://www.instagram.com/crypto_daily_drops', timestamp: 1726500000000 },
  { username: 'urban_nomad_sam', name: 'Sam Thorne', profileUrl: 'https://www.instagram.com/urban_nomad_sam', timestamp: 1726600000000 },
  { username: 'luna_astro_art', name: 'Luna Starling', profileUrl: 'https://www.instagram.com/luna_astro_art', timestamp: 1726700000000 },
  { username: 'dev_charlie', name: 'Charlie Kim', profileUrl: 'https://www.instagram.com/dev_charlie', timestamp: 1726800000000 },
  { username: 'nordic_minimalism', name: 'Nordic Interior', profileUrl: 'https://www.instagram.com/nordic_minimalism', timestamp: 1726900000000 },
  { username: 'fitness_with_dave', name: 'David Walker', profileUrl: 'https://www.instagram.com/fitness_with_dave', timestamp: 1727000000000 },
  { username: 'chloe_bakes', name: 'Chloe Dupuis', profileUrl: 'https://www.instagram.com/chloe_bakes', timestamp: 1727100000000 },
  { username: 'tech_insider_daily', name: 'Tech Insider', profileUrl: 'https://www.instagram.com/tech_insider_daily', timestamp: 1727200000000 },
  { username: 'ghost_runner_99', name: 'Liam Brooks', profileUrl: 'https://www.instagram.com/ghost_runner_99', timestamp: 1727300000000 },
  { username: 'artby_seraphina', name: 'Seraphina Lin', profileUrl: 'https://www.instagram.com/artby_seraphina', timestamp: 1727400000000 },
  { username: 'vintage_collector_uk', name: 'Vintage London', profileUrl: 'https://www.instagram.com/vintage_collector_uk', timestamp: 1727500000000 },
  { username: 'clara.voyage', name: 'Clara Santos', profileUrl: 'https://www.instagram.com/clara.voyage', timestamp: 1727600000000 },
];

// Accounts that unfollowed between snapshot 1 and snapshot 2
export const SAMPLE_LOST_FOLLOWERS: InstagramUser[] = [
  { username: 'crypto_daily_drops', name: 'Daily Web3', profileUrl: 'https://www.instagram.com/crypto_daily_drops', timestamp: 1726500000000 },
  { username: 'urban_nomad_sam', name: 'Sam Thorne', profileUrl: 'https://www.instagram.com/urban_nomad_sam', timestamp: 1726600000000 },
  { username: 'fitness_with_dave', name: 'David Walker', profileUrl: 'https://www.instagram.com/fitness_with_dave', timestamp: 1727000000000 },
  { username: 'ghost_runner_99', name: 'Liam Brooks', profileUrl: 'https://www.instagram.com/ghost_runner_99', timestamp: 1727300000000 },
  { username: 'vintage_collector_uk', name: 'Vintage London', profileUrl: 'https://www.instagram.com/vintage_collector_uk', timestamp: 1727500000000 },
  { username: 'dropship_guru_pro', name: 'Ecom Mastery', profileUrl: 'https://www.instagram.com/dropship_guru_pro', timestamp: 1727200000000 },
  { username: 'travel_junkie_zack', name: 'Zack Evans', profileUrl: 'https://www.instagram.com/travel_junkie_zack', timestamp: 1727400000000 },
  { username: 'bot_acc_392019', name: 'Social Boost', profileUrl: 'https://www.instagram.com/bot_acc_392019', timestamp: 1727500000000 },
];

// Accounts that recently followed between snapshot 1 and snapshot 2
export const SAMPLE_NEW_FOLLOWERS: InstagramUser[] = [
  { username: 'maya.photofilms', name: 'Maya Patel', profileUrl: 'https://www.instagram.com/maya.photofilms', timestamp: 1729200000000 },
  { username: 'zen.architect', name: 'Kenji Sato', profileUrl: 'https://www.instagram.com/zen.architect', timestamp: 1729250000000 },
  { username: 'neon_hustle_club', name: 'Neon Studio', profileUrl: 'https://www.instagram.com/neon_hustle_club', timestamp: 1729300000000 },
  { username: 'sarah.creativelabs', name: 'Sarah Jenkins', profileUrl: 'https://www.instagram.com/sarah.creativelabs', timestamp: 1729350000000 },
  { username: 'coffee_and_code', name: 'Julian Becker', profileUrl: 'https://www.instagram.com/coffee_and_code', timestamp: 1729400000000 },
  { username: 'minimal_spaces_mag', name: 'Minimal Spaces Magazine', profileUrl: 'https://www.instagram.com/minimal_spaces_mag', timestamp: 1729450000000 },
  { username: 'lucas.droneshots', name: 'Lucas Martin', profileUrl: 'https://www.instagram.com/lucas.droneshots', timestamp: 1729500000000 },
  { username: 'valerie_fashion_notes', name: 'Valerie Laurent', profileUrl: 'https://www.instagram.com/valerie_fashion_notes', timestamp: 1729550000000 },
  { username: 'oliver_type_design', name: 'Oliver Rhys', profileUrl: 'https://www.instagram.com/oliver_type_design', timestamp: 1729600000000 },
  { username: 'flora.ceramic.arts', name: 'Flora Gomez', profileUrl: 'https://www.instagram.com/flora.ceramic.arts', timestamp: 1729650000000 },
];

// Accounts you follow that don't follow you back (classic target list)
export const SAMPLE_NOT_FOLLOWING_BACK: InstagramUser[] = [
  { username: 'natgeo', name: 'National Geographic', profileUrl: 'https://www.instagram.com/natgeo', timestamp: 1715000000000, isWhitelisted: true, notes: 'Verified Brand' },
  { username: 'mkbhd', name: 'Marques Brownlee', profileUrl: 'https://www.instagram.com/mkbhd', timestamp: 1716000000000, isWhitelisted: true, notes: 'Tech Creator' },
  { username: 'hypebeast', name: 'HYPEBEAST', profileUrl: 'https://www.instagram.com/hypebeast', timestamp: 1717000000000, isWhitelisted: false },
  { username: 'austin_kleon', name: 'Austin Kleon', profileUrl: 'https://www.instagram.com/austin_kleon', timestamp: 1718000000000, isWhitelisted: true, notes: 'Author Inspiration' },
  { username: 'complex', name: 'Complex', profileUrl: 'https://www.instagram.com/complex', timestamp: 1719000000000, isWhitelisted: false },
  { username: 'dan_bilzerian_lifestyle', name: 'Dan Fans', profileUrl: 'https://www.instagram.com/dan_bilzerian_lifestyle', timestamp: 1721000000000, isWhitelisted: false },
  { username: 'archdigest', name: 'Architectural Digest', profileUrl: 'https://www.instagram.com/archdigest', timestamp: 1722000000000, isWhitelisted: true, notes: 'Design publication' },
  { username: 'jake_random_traveler', name: 'Jake Miller', profileUrl: 'https://www.instagram.com/jake_random_traveler', timestamp: 1723000000000, isWhitelisted: false },
  { username: 'growth_hacking_agency_la', name: 'Growth Scale LA', profileUrl: 'https://www.instagram.com/growth_hacking_agency_la', timestamp: 1724000000000, isWhitelisted: false },
  { username: 'tasty_bites_cookbook', name: 'Tasty Bites', profileUrl: 'https://www.instagram.com/tasty_bites_cookbook', timestamp: 1725000000000, isWhitelisted: false },
  { username: 'theverge', name: 'The Verge', profileUrl: 'https://www.instagram.com/theverge', timestamp: 1725500000000, isWhitelisted: true, notes: 'Tech Media' },
  { username: 'steve_crypto_arbitrage', name: 'Steve Trading', profileUrl: 'https://www.instagram.com/steve_crypto_arbitrage', timestamp: 1726000000000, isWhitelisted: false },
  { username: 'berlin_electronic_underground', name: 'Berlin Nightlife', profileUrl: 'https://www.instagram.com/berlin_electronic_underground', timestamp: 1726500000000, isWhitelisted: false },
  { username: 'fashion_forward_nyc', name: 'NYC Trends', profileUrl: 'https://www.instagram.com/fashion_forward_nyc', timestamp: 1727000000000, isWhitelisted: false },
  { username: 'speed_runner_ex', name: 'Speedrunner', profileUrl: 'https://www.instagram.com/speed_runner_ex', timestamp: 1727500000000, isWhitelisted: false },
];

// Accounts that follow you, and you also follow back (Mutual)
export const SAMPLE_MUTUAL_FOLLOWERS: InstagramUser[] = [
  { username: 'design.sophia', name: 'Sophia Chen', profileUrl: 'https://www.instagram.com/design.sophia', timestamp: 1726000000000 },
  { username: 'marcus_visuals', name: 'Marcus Vance', profileUrl: 'https://www.instagram.com/marcus_visuals', timestamp: 1726100000000 },
  { username: 'elena_rodriguez', name: 'Elena Rodriguez', profileUrl: 'https://www.instagram.com/elena_rodriguez', timestamp: 1726150000000 },
  { username: 'pixelcraft.studio', name: 'Pixelcraft Studio', profileUrl: 'https://www.instagram.com/pixelcraft.studio', timestamp: 1726200000000 },
  { username: 'kai_zenith', name: 'Kai Tanaka', profileUrl: 'https://www.instagram.com/kai_zenith', timestamp: 1726300000000 },
  { username: 'alexa_wanderlust', name: 'Alexa Miller', profileUrl: 'https://www.instagram.com/alexa_wanderlust', timestamp: 1726400000000 },
  { username: 'luna_astro_art', name: 'Luna Starling', profileUrl: 'https://www.instagram.com/luna_astro_art', timestamp: 1726700000000 },
  { username: 'dev_charlie', name: 'Charlie Kim', profileUrl: 'https://www.instagram.com/dev_charlie', timestamp: 1726800000000 },
  { username: 'nordic_minimalism', name: 'Nordic Interior', profileUrl: 'https://www.instagram.com/nordic_minimalism', timestamp: 1726900000000 },
  { username: 'chloe_bakes', name: 'Chloe Dupuis', profileUrl: 'https://www.instagram.com/chloe_bakes', timestamp: 1727100000000 },
  { username: 'tech_insider_daily', name: 'Tech Insider', profileUrl: 'https://www.instagram.com/tech_insider_daily', timestamp: 1727200000000 },
  { username: 'artby_seraphina', name: 'Seraphina Lin', profileUrl: 'https://www.instagram.com/artby_seraphina', timestamp: 1727400000000 },
  { username: 'clara.voyage', name: 'Clara Santos', profileUrl: 'https://www.instagram.com/clara.voyage', timestamp: 1727600000000 },
];

// Accounts that follow you, but you don't follow them back (Fans)
export const SAMPLE_FANS: InstagramUser[] = [
  ...SAMPLE_NEW_FOLLOWERS,
  { username: 'art_collector_01', name: 'Art Collector', profileUrl: 'https://www.instagram.com/art_collector_01', timestamp: 1727700000000 },
  { username: 'japan_walks_4k', name: 'Japan Walks', profileUrl: 'https://www.instagram.com/japan_walks_4k', timestamp: 1727800000000 },
  { username: 'daily_typography', name: 'Daily Type', profileUrl: 'https://www.instagram.com/daily_typography', timestamp: 1727900000000 },
  { username: 'coffee_roasters_co', name: 'Coffee Roasters', profileUrl: 'https://www.instagram.com/coffee_roasters_co', timestamp: 1728000000000 },
  { username: 'motion_design_daily', name: 'Motion Design', profileUrl: 'https://www.instagram.com/motion_design_daily', timestamp: 1728100000000 },
  { username: 'analog_film_vibes', name: 'Film Vibes', profileUrl: 'https://www.instagram.com/analog_film_vibes', timestamp: 1728200000000 },
  { username: 'ui_interactions_showcase', name: 'UI Showcase', profileUrl: 'https://www.instagram.com/ui_interactions_showcase', timestamp: 1728300000000 },
];

export const DEMO_CURRENT_SNAPSHOT: Snapshot = {
  id: 'snapshot-latest',
  label: 'Latest Export (Current)',
  timestamp: 1729850400000, // Oct 25, 2026
  followers: [
    ...SAMPLE_MUTUAL_FOLLOWERS,
    ...SAMPLE_FANS,
  ],
  following: [
    ...SAMPLE_MUTUAL_FOLLOWERS,
    ...SAMPLE_NOT_FOLLOWING_BACK,
  ],
  stats: {
    totalFollowers: 1248,
    totalFollowing: 582,
    mutualFollowers: 420,
    notFollowingBack: 162,
    fans: 828,
    ratio: 2.14,
  },
};

export const DEMO_PREVIOUS_SNAPSHOT: Snapshot = {
  id: 'snapshot-oct-11',
  label: 'Snapshot (2 Weeks Ago)',
  timestamp: 1728640800000, // Oct 11, 2026
  followers: [
    ...SAMPLE_MUTUAL_FOLLOWERS,
    ...SAMPLE_LOST_FOLLOWERS,
  ],
  following: [
    ...SAMPLE_MUTUAL_FOLLOWERS,
    ...SAMPLE_NOT_FOLLOWING_BACK.slice(0, 10),
  ],
  stats: {
    totalFollowers: 1215,
    totalFollowing: 590,
    mutualFollowers: 416,
    notFollowingBack: 174,
    fans: 799,
    ratio: 2.06,
  },
};

export const DEMO_COMPARISON: ComparisonResult = {
  previousSnapshotId: DEMO_PREVIOUS_SNAPSHOT.id,
  previousLabel: DEMO_PREVIOUS_SNAPSHOT.label,
  previousDate: DEMO_PREVIOUS_SNAPSHOT.timestamp,
  currentSnapshotId: DEMO_CURRENT_SNAPSHOT.id,
  currentLabel: DEMO_CURRENT_SNAPSHOT.label,
  currentDate: DEMO_CURRENT_SNAPSHOT.timestamp,
  lostFollowers: SAMPLE_LOST_FOLLOWERS,
  newFollowers: SAMPLE_NEW_FOLLOWERS,
  unfollowedByYou: [
    { username: 'random_ecom_hub', profileUrl: 'https://www.instagram.com/random_ecom_hub', timestamp: 1728800000000 },
    { username: 'crypto_signals_daily', profileUrl: 'https://www.instagram.com/crypto_signals_daily', timestamp: 1728900000000 },
  ],
  newFollowing: [
    { username: 'minimal_spaces_mag', name: 'Minimal Spaces Magazine', profileUrl: 'https://www.instagram.com/minimal_spaces_mag', timestamp: 1729450000000 },
  ],
  netChange: 33,
};

export const DEMO_GROWTH_HISTORY: GrowthDataPoint[] = [
  { date: 'Oct 01', timestamp: 1727740800000, followers: 1180, following: 595, gained: 6, lost: 2, net: 4 },
  { date: 'Oct 03', timestamp: 1727913600000, followers: 1188, following: 594, gained: 10, lost: 2, net: 8 },
  { date: 'Oct 05', timestamp: 1728086400000, followers: 1195, following: 592, gained: 8, lost: 1, net: 7 },
  { date: 'Oct 07', timestamp: 1728259200000, followers: 1202, following: 592, gained: 9, lost: 2, net: 7 },
  { date: 'Oct 09', timestamp: 1728432000000, followers: 1208, following: 591, gained: 8, lost: 2, net: 6 },
  { date: 'Oct 11', timestamp: 1728604800000, followers: 1215, following: 590, gained: 11, lost: 4, net: 7 },
  { date: 'Oct 13', timestamp: 1728777600000, followers: 1221, following: 588, gained: 8, lost: 2, net: 6 },
  { date: 'Oct 15', timestamp: 1728950400000, followers: 1226, following: 586, gained: 7, lost: 2, net: 5 },
  { date: 'Oct 17', timestamp: 1729123200000, followers: 1230, following: 585, gained: 6, lost: 2, net: 4 },
  { date: 'Oct 19', timestamp: 1729296000000, followers: 1237, following: 585, gained: 9, lost: 2, net: 7 },
  { date: 'Oct 21', timestamp: 1729468800000, followers: 1242, following: 584, gained: 7, lost: 2, net: 5 },
  { date: 'Oct 23', timestamp: 1729641600000, followers: 1245, following: 583, gained: 5, lost: 2, net: 3 },
  { date: 'Oct 25', timestamp: 1729814400000, followers: 1248, following: 582, gained: 5, lost: 2, net: 3 },
];
