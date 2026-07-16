import { Product, Category, Testimonial } from "./types";

export const CATEGORIES: Category[] = [
  {
    id: "cat-1",
    name: "Resin Keychains",
    slug: "resin-keychains",
    image: "https://images.unsplash.com/photo-1621259182978-f09e5122ae8e?auto=format&fit=crop&w=500&q=80",
    description: "Personalized monogram and botanical letter keychains with shimmering gold foil accents."
  },
  {
    id: "cat-2",
    name: "Resin Photo Frames",
    slug: "resin-photo-frames",
    image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=500&q=80",
    description: "Encase your cherished memories in floral and fluid art resin borders."
  },
  {
    id: "cat-3",
    name: "Resin Wall Clocks",
    slug: "resin-wall-clocks",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=500&q=80",
    description: "Breathtaking ocean wave and marble-texture clocks featuring live-edge olive wood."
  },
  {
    id: "cat-4",
    name: "Serving Trays",
    slug: "serving-trays",
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=500&q=80",
    description: "Premium hosting trays combining raw timber slabs with glass-like resin shorelines."
  },
  {
    id: "cat-5",
    name: "Coasters",
    slug: "coasters",
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=500&q=80",
    description: "Luxury geode and metallic leaf coasters with scratch-resistant premium finish."
  },
  {
    id: "cat-6",
    name: "Jewelry",
    slug: "jewelry",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=500&q=80",
    description: "Delicate silver and gold bezels encasing preserved wildflowers and crystals."
  }
];

export const PRODUCTS: Product[] = [
  // 1. Resin Keychains
  {
    id: "prod-1",
    name: "Golden Botanical Monogram Keychain",
    category: "Resin Keychains",
    price: 18.00,
    rating: 4.9,
    reviewsCount: 142,
    image: "https://images.unsplash.com/photo-1621259182978-f09e5122ae8e?auto=format&fit=crop&w=600&q=80",
    isBestSeller: true,
    description: "A custom letter keychain featuring hand-pressed baby's breath, dried rose petals, and genuine 24k gold leaf flakes embedded in high-gloss, UV-resistant crystal resin. Fitted with a luxurious gold clasp.",
    dimensions: "1.5\" x 1.5\" (varies by letter)",
    materials: ["UV-Resistant Resin", "Dried Florals", "24k Gold Foil", "Brass Hardware"],
    inStock: true,
    features: ["Scratch-resistant glaze", "Free custom monogram", "Hypoallergenic keychain clasp"]
  },
  {
    id: "prod-2",
    name: "Ocean Tide Teal Shimmer Keychain",
    category: "Resin Keychains",
    price: 14.50,
    rating: 4.7,
    reviewsCount: 56,
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
    description: "Capturing the serene waves of coastal tide pools in a miniature pocket charm. Made with turquoise mica powder, titanium white wave cells, and actual white sand from pristine shores.",
    dimensions: "2.0\" Circular Ring",
    materials: ["Mica Pigments", "Beach Sand", "Resin", "Stainless Steel"],
    inStock: true,
    features: ["Authentic ocean cells", "Double-sided dome finish", "Waterproof"]
  },

  // 2. Resin Photo Frames
  {
    id: "prod-3",
    name: "Wildflower Meadows Botanical Photo Frame",
    category: "Resin Photo Frames",
    price: 42.00,
    rating: 4.8,
    reviewsCount: 88,
    image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80",
    isBestSeller: true,
    description: "Bring the tranquility of a spring meadow to your favorite memory. This freestanding frame incorporates pressed daisies, ferns, cornflowers, and elegant gold flakes wrapped around a vintage wooden inner trim.",
    dimensions: "5\" x 7\" photo window (Overall: 7\" x 9\")",
    materials: ["Hand-pressed Flowers", "Gold Leaf", "Varnished Oak Wood", "Epoxy Resin"],
    inStock: true,
    features: ["Sturdy dual-orientation kickstand", "Anti-yellowing UV blocker", "Individually arranged botanicals"]
  },

  // 3. Resin Wall Clocks
  {
    id: "prod-4",
    name: "Pacific Shore Ocean Wave Clocks",
    category: "Resin Wall Clocks",
    price: 145.00,
    rating: 5.0,
    reviewsCount: 112,
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80",
    isBestSeller: true,
    description: "A signature statement piece combining centuries-old olive wood slabs with modern resin ocean-pouring techniques. Features 3-4 distinct layered waves crashing against a sandy beach. No two wood grains or tide lines are alike.",
    dimensions: "14\" Diameter (Thickness: 1.2\")",
    materials: ["Aged Olive Wood", "Liquid Glass Epoxy", "Premium Resin Pigments", "Silent Quartz Movement"],
    inStock: true,
    features: ["Completely silent sweeps (no ticking)", "Sturdy heavy-duty wall hanger pre-installed", "Treated with organic beeswax and orange oil"]
  },
  {
    id: "prod-5",
    name: "White Marble & Gold Leaf Hexagon Clock",
    category: "Resin Wall Clocks",
    price: 120.00,
    rating: 4.9,
    reviewsCount: 39,
    image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=600&q=80",
    description: "A sleek geometric clock radiating modern luxury. Styled with delicate pearlescent white resin, fine black marble-style veins, and bold streaks of hand-applied gold leaf.",
    dimensions: "12\" Point-to-Point Hexagon",
    materials: ["Eco-Epoxy Resin", "Gold Leaf", "Silent Quartz Sweep"],
    inStock: true,
    features: ["Brushed gold metal hands", "Minimalist hour markers", "Easy battery slot"]
  },

  // 4. Serving Trays
  {
    id: "prod-6",
    name: "Aegean Sea River Serving Board",
    category: "Serving Trays",
    price: 85.00,
    rating: 4.9,
    reviewsCount: 95,
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80",
    isBestSeller: true,
    description: "A beautiful fusion of rustic woodcraft and liquid ocean. This live-edge acacia wood tray features an artistic resin 'river' complete with translucent sea-teal depth and white frothy lace details. Perfect for charcuterie or gourmet spreads.",
    dimensions: "18\" x 10\" x 0.8\"",
    materials: ["Live-edge Acacia Wood", "Food-Safe Certified Resin", "Black Matte Steel Handles"],
    inStock: true,
    features: ["100% food-safe certified finish", "Comfort-grip ergonomic metal handles", "Silicone non-slip feet on bottom"]
  },

  // 5. Coasters
  {
    id: "prod-7",
    name: "Emerald Quartz Geode Coaster Set",
    category: "Coasters",
    price: 36.00,
    rating: 4.8,
    reviewsCount: 210,
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80",
    isBestSeller: true,
    description: "A set of four breathtaking hand-poured geode coasters replicating the crystallization of emerald gemstones. Outlined with stunning hand-painted gold gilded rims and embedded with high-grade reflective glitter center clusters.",
    dimensions: "4.5\" Diameter (Set of 4)",
    materials: ["Pigmented Resin", "Gilded Gold Paint", "Faux Crystal Glitters", "Protective Clear Rubber Bumpers"],
    inStock: true,
    features: ["Heat resistant up to 140°F/60°C", "Scratch-resistant crystal top layer", "Includes beautiful gold metal holder"]
  },

  // 6. Jewelry
  {
    id: "prod-8",
    name: "Preserved Moss & Fern Teardrop Pendant",
    category: "Jewelry",
    price: 28.00,
    rating: 4.9,
    reviewsCount: 64,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80",
    description: "A wearable token of the forest. Features delicate maidenhair fern fronds and emerald green star moss preserved in a crystal-clear drop of high-grade resin, set in an elegant 18k gold plated teardrop frame.",
    dimensions: "1.2\" Pendant (with 18\" Adjustable Chain)",
    materials: ["Pressed Fern & Moss", "18k Gold Plated Brass", "Eco-Friendly Jewelry Resin"],
    inStock: true,
    features: ["Lead-free and nickel-free chain", "Stays vibrant forever", "Comes in premium linen gift box"]
  },

  // 7. Bookmarks
  {
    id: "prod-9",
    name: "Lavender Petals & Gold Leaf Bookmark",
    category: "Bookmarks",
    price: 12.00,
    rating: 4.6,
    reviewsCount: 119,
    image: "https://images.unsplash.com/photo-1474932430478-367db26836c1?auto=format&fit=crop&w=600&q=80",
    description: "Elevate your reading ritual. A slender, elegant, clear-glass resin bookmark containing fragrant organic lavender buds and sparkling gold leaf flecks, finished with a matching lilac silk tassel.",
    dimensions: "5.5\" x 1\" x 0.1\" (Ultra-thin)",
    materials: ["Epoxy Resin", "Preserved Lavender", "Gold Leaf", "Silk Tassel"],
    inStock: true,
    features: ["Extremely flexible and drop-proof", "Doesn't damage book spines", "Delicately scented lavender infusion"]
  },

  // 8. Name Plates
  {
    id: "prod-10",
    name: "Live Edge Walnut & Turquoise River Name Plate",
    category: "Name Plates",
    price: 75.00,
    rating: 5.0,
    reviewsCount: 45,
    image: "https://images.unsplash.com/photo-1613682139695-167232230b05?auto=format&fit=crop&w=600&q=80",
    description: "An elegant addition to any professional desk. Crafted using a gorgeous block of American Walnut with a hand-poured turquoise resin river cutting down the middle. Personalized with gold-foil laser engraving of your name and title.",
    dimensions: "10\" x 2.5\" x 1.5\"",
    materials: ["Premium American Walnut", "Turquoise Mica Resin", "Laser-Etched Gold Foil Ink"],
    inStock: true,
    features: ["Perfect weighted bottom", "Includes complementary wood polish oil", "Custom fonts available"]
  },

  // 9. Home Décor
  {
    id: "prod-11",
    name: "Golden Hour Iridescent Ring Dish",
    category: "Home Décor",
    price: 22.00,
    rating: 4.7,
    reviewsCount: 32,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
    description: "A shimmering, iridescent shell-shaped dish designed to cradle your daily jewelry. Cast with specialized color-shifting pearlescent flakes that glimmer beautifully under any warm light.",
    dimensions: "4\" x 4\" x 0.8\"",
    materials: ["Iridescent Pearlescent Pigments", "Clear Epoxy Resin"],
    inStock: true,
    features: ["Water-resistant, perfect for bathroom vanity", "Smooth rounded edges", "Soft felt base pads"]
  },

  // 10. Custom Gifts
  {
    id: "prod-12",
    name: "Bespoke Bridal Bouquet Preservation Block",
    category: "Custom Gifts",
    price: 180.00,
    rating: 5.0,
    reviewsCount: 155,
    image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=600&q=80",
    isBestSeller: true,
    description: "Keep your wedding memories alive forever. Send us your bouquet, and we will carefully dry the flowers using specialized silica gel, then cast them in a massive, heavy, bubble-free clear crystal cube or hexagon resin block.",
    dimensions: "6\" x 6\" x 3\" (Weighted cube)",
    materials: ["Customer's Dried Flowers", "Ultra-Clear Deep Pour Cast Resin", "UV-Resistant Protective Sealant"],
    inStock: true,
    features: ["Advanced multi-layer bubble removal", "Guaranteed anti-yellowing formulation", "Includes custom maple wood LED display stand"]
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "rev-1",
    name: "Eleanor Sterling",
    role: "Interior Designer",
    rating: 5,
    text: "The Pacific Shore Ocean Wave Clock is the absolute centerpiece of my living room. The depth in the ocean waves is genuinely mesmerizing—it looks like real glass. Guests ask about it immediately. The customer service and care sheet provided are top-tier.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    date: "June 14, 2026",
    verified: true,
    productName: "Pacific Shore Ocean Wave Clocks"
  },
  {
    id: "rev-2",
    name: "Julian Mercer",
    role: "Art Collector",
    rating: 5,
    text: "I ordered a custom bridal bouquet preservation block for my wife's anniversary. The results surpassed our wildest dreams. The roses look perfectly preserved and floating in air, and the bubble-free glass finish is flawless. Well worth the price.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    date: "May 28, 2026",
    verified: true,
    productName: "Bespoke Bridal Bouquet Preservation Block"
  },
  {
    id: "rev-3",
    name: "Clara Vandermeer",
    role: "Graphic Artist",
    rating: 5,
    text: "I bought the Emerald Quartz Geode Coasters as a housewarming gift. The packaging alone felt like opening a luxurious jewel box. The gold gilded rims are thick, glossy, and beautifully painted. They are robust and heavy. I will definitely be ordering more for myself!",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    date: "April 10, 2026",
    verified: true,
    productName: "Emerald Quartz Geode Coaster Set"
  },
  {
    id: "rev-4",
    name: "Marcus Vance",
    role: "Corporate Executive",
    rating: 4,
    text: "Outstanding work on the Walnut & Turquoise river name plate. It commands attention on my executive desk. The turquoise resin stands out with subtle metallic shimmers in the light. Fast shipping and extremely secure bubble wrap packaging.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    date: "March 22, 2026",
    verified: true,
    productName: "Live Edge Walnut & Turquoise River Name Plate"
  }
];

export const INSTAGRAM_IMAGES = [
  {
    id: "ig-1",
    url: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=400&h=400&q=80",
    likes: "2.4k",
    comments: "84"
  },
  {
    id: "ig-2",
    url: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=400&h=400&q=80",
    likes: "1.8k",
    comments: "49"
  },
  {
    id: "ig-3",
    url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=400&h=400&q=80",
    likes: "4.1k",
    comments: "156"
  },
  {
    id: "ig-4",
    url: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=400&h=400&q=80",
    likes: "3.2k",
    comments: "92"
  },
  {
    id: "ig-5",
    url: "https://images.unsplash.com/photo-1621259182978-f09e5122ae8e?auto=format&fit=crop&w=400&h=400&q=80",
    likes: "1.5k",
    comments: "38"
  },
  {
    id: "ig-6",
    url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&h=400&q=80",
    likes: "2.9k",
    comments: "73"
  }
];

export const CUSTOM_BUILDER_OPTIONS = {
  products: [
    { name: "Monogram Keychain", basePrice: 15.00, image: "https://images.unsplash.com/photo-1621259182978-f09e5122ae8e?auto=format&fit=crop&w=400&q=80" },
    { name: "Wildflower Photo Frame", basePrice: 38.00, image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=400&q=80" },
    { name: "Live-Edge Wall Clock", basePrice: 125.00, image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=400&q=80" },
    { name: "Acacia Serving Tray", basePrice: 75.00, image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=400&q=80" },
    { name: "Set of 4 Coasters", basePrice: 32.00, image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=400&q=80" },
    { name: "Botanical Bookmark", basePrice: 10.00, image: "https://images.unsplash.com/photo-1474932430478-367db26836c1?auto=format&fit=crop&w=400&q=80" }
  ],
  woodTypes: [
    { name: "None (Pure Resin)", price: 0, desc: "An all-resin transparent or colored pour" },
    { name: "Olive Wood", price: 15.00, desc: "Highly figured rich grains with distinct warm tones" },
    { name: "Black Walnut", price: 12.00, desc: "Deep dark chocolate luxury timber with crisp edges" },
    { name: "Aged Rustic Oak", price: 8.00, desc: "Classic golden honey waves with solid weight" }
  ],
  resinColors: [
    { name: "Aegean Teal Ocean Waves", color: "#1E4D4A", shimmer: "ocean-foam", desc: "Layers of cyan, emerald, and white frothy lace" },
    { name: "Amethyst Purple & Gold Dust", color: "#4A2B59", shimmer: "gold-flake", desc: "Deep regal quartz crystal violet with gold particles" },
    { name: "Forest Green & Copper Swirl", color: "#1D3B2E", shimmer: "copper-dust", desc: "Rich woodland organic green with shining warm veins" },
    { name: "Pearl White & Rose Gold Shimmer", color: "#EEDCD6", shimmer: "rose-gold", desc: "Iridescent celestial white satin with elegant blush dust" },
    { name: "Crystal Clear Glass", color: "transparent", shimmer: "none", desc: "Perfect optically clear museum-quality preservation resin" }
  ],
  decorations: [
    { name: "24k Gold Foil Flakes", price: 3.00, desc: "Subtle gleaming floating islands" },
    { name: "Pressed Wildflowers", price: 5.00, desc: "Vibrant handpicked baby's breath, rose petals, and ferns" },
    { name: "Metallic Copper Flakes", price: 3.00, desc: "Warm rich fiery flakes" },
    { name: "Beach Sand & Shells", price: 4.00, desc: "Real ocean grains and micro shells for sea aesthetics" },
    { name: "Real Quartz Crystals", price: 6.00, desc: "Crushed raw amethyst and aquamarine dust" }
  ]
};
