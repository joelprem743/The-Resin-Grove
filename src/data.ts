// src/data.ts
import { Product, Category, Testimonial } from "./types";

export const CATEGORIES: Category[] = [
  {
    id: "cat-1",
    name: "Resin Frames",
    slug: "resin-frames",
    image: "./public/products/Message Bloom Plaque.jpg",
    description: "Encase your cherished memories in a beautiful resin frame."
  },
  {
    id: "cat-2",
    name: "Resin Keychains",
    slug: "resin-keychains",
    image: "./public/products/Alphabet Resin Keychain.jpg",
    description: "Personalized monogram and botanical letter keychains with shimmering gold foil accents."
  },
  {
    id: "cat-3",
    name: "Resin Wall Clocks",
    slug: "resin-wall-clocks",
    image: "./public/products/Luxe Petal Clock.jpg",
    description: "Breathtaking ocean wave and marble-texture clocks featuring live-edge olive wood."
  },
  {
    id: "cat-6",
    name: "Jewelry",
    slug: "jewelry",
    image: "./public/products/Pressed Flower Resin Pendant.webp",
    description: "Delicate silver and gold bezels encasing preserved wildflowers and crystals."
  },
  {
    id: "cat-7",
    name: "Customizable Boquets",
    slug: "customizable-boquets",
    image: "./public/products/Forever Bloom Bouquet.png",
    description: "Personalized Bouquets — blending chocolate indulgence and timeless memories into gifts as unique as your story."
  },
  {
    id: "cat-8",
    name: "Resin Photo Frames",
    slug: "resin-photo-frames",
    image: "./public/products/Floral Resin Photo Frame.png",
    description: "Encase your cherished memories in floral and fluid art resin borders."
  }
];

export const PRODUCTS: Product[] = [
  // 1. Resin Keychains
  {
    id: "prod-1",
    name: "Message Bloom Plaque",
    category: "Resin Frames",
    price: 18.00,
    rating: 4.9,
    reviewsCount: 142,
    image: "./public/products/Message Bloom Plaque.jpg",
    isBestSeller: true,
    description: "Celebrate life's special moments with a handcrafted personalized resin plaque, beautifully designed with preserved flowers, custom photos, heartfelt messages, and elegant pearl and gold foil accents. Each piece is carefully handmade using premium crystal-clear resin, creating a timeless keepsake that's perfect for birthdays, anniversaries, Mother's Day, weddings, and other meaningful occasions.",
    dimensions: "8\" x 8\"",
    materials: ["UV-Resistant Resin", "Dried Florals", "24k Gold Foil", "Brass Hardware"],
    inStock: true,
  },
  {
    id: "prod-2",
    name: "Date & Memory Plaque",
    category: "Resin Frames",
    price: 14.50,
    rating: 4.7,
      reviewsCount: 56,
      image: "./public/products/Date & Memory Plaque.png",
    description: "A handcrafted resin plaque featuring a personalized photo, custom calendar date, names, and custom text, beautifully accented with preserved flowers and delicate gold foil. Crafted from premium crystal-clear resin, this keepsake offers a timeless way to display cherished memories while adding an elegant decorative touch to any space.",

    dimensions: "8\" × 8\"",
    
    materials: [
      "Premium Crystal-Clear Resin",
      "Preserved Dried Flowers",
      "Gold Foil Accents",
      "UV-Resistant Resin",
      "High-Quality Vinyl Printing",
      "Wooden Display Stand"
    ],
    
    inStock: true,
    
    features: [
      "Fully Personalized Design",
      "Custom Photo & Calendar Date",
      "Real Preserved Flowers",
      "Premium Crystal-Clear Finish",
      "Handcrafted with Care",
      "Fade-Resistant & Durable"
    ]
  },

  // 2. Resin Photo Frames
  {
    id: "prod-3",
    name: "Alphabet Resin Keychain",
    category: "Resin Keychains",
    price: 42.00,
    rating: 4.8,
    reviewsCount: 88,
    image: "./public/products/Alphabet Resin Keychain.jpg",
    isBestSeller: true,
    description: "A handcrafted alphabet resin keychain featuring real preserved flowers, delicate gold foil accents, and premium crystal-clear resin. Personalized with your chosen initial, each keychain is uniquely designed to add a stylish and meaningful touch to your keys, bags, or everyday accessories.",

    dimensions: "2\" - 2.5\" Height (Varies by Letter)",
    
    materials: [
      "Premium Crystal-Clear Resin",
      "Preserved Dried Flowers",
      "Gold Foil Accents",
      "Premium Key Ring",
      "Gold-Plated Hardware"
    ],
    
    inStock: true,
    
    features: [
      "Personalized Initial Design",
      "Real Preserved Flowers",
      "Handcrafted Finish",
      "Lightweight & Durable",
      "Scratch-Resistant Surface",
      "Perfect for Keys & Bags"
    ]
  },

  // 3. Resin Wall Clocks
  {
    id: "prod-4",
    name: "Floral Resin Photo Frame",
      category: "Resin Photo Frames",
      price: 145.00,
    rating: 5.0,
    reviewsCount: 112,
    image: "./public/products/Floral Resin Photo Frame.png",
    isBestSeller: true,
    description: "A handcrafted resin photo frame featuring your favorite photo surrounded by real preserved flowers and delicate gold foil accents. Crafted from premium crystal-clear resin, this elegant frame transforms cherished moments into a timeless keepsake while adding a beautiful decorative touch to any space.",

    dimensions: "4\" × 6\" Photo (Overall: 6\" × 8\")",
    
    materials: [
      "Premium Crystal-Clear Resin",
      "Real Preserved Flowers",
      "Gold Foil Accents",
      "High-Quality Photo Print",
      "UV-Resistant Resin"
    ],
    
    inStock: true,
    
    features: [
      "Personalized Photo Display",
      "Real Preserved Flowers",
      "Handcrafted Design",
      "Crystal-Clear Gloss Finish",
      "Freestanding Display",
      "Fade-Resistant & Durable"
    ]
  },
  {
    id: "prod-5",
    name: "Velvet Indulgence Bouquet",
    category: "Customizable Boquets",
    price: 120.00,
    rating: 4.9,
    reviewsCount: 39,
    image: "./public/products/Velvet Indulgence Bouquet.png",
    description: "A handcrafted chocolate bouquet featuring premium chocolates, fresh roses, delicate baby's breath flowers, and elegant luxury wrapping. Beautifully arranged with premium ribbons and floral accents, this bouquet offers a unique blend of sweetness and sophistication, making it a thoughtful gift and a stunning presentation for any special occasion.",

dimensions: "Approx. 16\" × 10\" (Varies by Arrangement)",

materials: [
  "Premium Chocolates",
  "Fresh Roses",
  "Baby's Breath Flowers",
  "Premium Bouquet Wrapping",
  "Satin Ribbon",
  "Floral Fillers"
],

inStock: true,

features: [
  "Handcrafted Floral Arrangement",
  "Premium Chocolate Selection",
  "Elegant Gift Wrapping",
  "Fresh Floral Accents",
  "Ready to Gift",
  "Customizable Design"
]
  },


  {
    id: "prod-6",
    name: "First Year Memories Clock",
    category: "Resin Wall Clocks",
    price: 85.00,
    rating: 4.9,
    reviewsCount: 95,
    image: "./public/products/First Year Memories Clock.png",
    isBestSeller: true,
    description: "A handcrafted personalized resin clock designed to showcase your baby's first year through twelve cherished milestone photos. Featuring custom names, birth details, and a premium glossy resin finish, this unique keepsake beautifully preserves precious memories while serving as an elegant functional décor piece for your home.",

dimensions: "12\" Diameter",

materials: [
  "Premium Crystal-Clear Resin",
  "High-Quality Photo Prints",
  "Silent Quartz Clock Movement",
  "Gold-Finish Clock Hands",
  "UV-Resistant Resin"
],

inStock: true,

features: [
  "12 Monthly Milestone Photos",
  "Personalized Name & Birth Details",
  "Silent Quartz Movement",
  "Handcrafted Premium Finish",
  "Fade-Resistant & Durable",
  "Ready to Hang"
]
  },

  // 5. Coasters
  {
    id: "prod-7",
    name: "Photo Bloom Resin Clock",
    category: "Resin Wall Clocks",
    price: 36.00,
    rating: 4.8,
    reviewsCount: 210,
    image: "./public/products/Photo Bloom Resin Clock.png",
    isBestSeller: true,
    description: "A handcrafted personalized resin clock featuring your favorite photo, preserved roses, elegant Roman numerals, and delicate gold foil accents. Crafted with premium crystal-clear resin and a silent quartz movement, this unique timepiece beautifully combines meaningful memories with functional home décor.",

    dimensions: "12\" Diameter",
    
    materials: [
      "Premium Crystal-Clear Resin",
      "Real Preserved Roses",
      "Gold Foil Accents",
      "High-Quality Photo Print",
      "Silent Quartz Clock Movement",
      "Gold-Finish Clock Hands"
    ],
    
    inStock: true,
    
    features: [
      "Personalized Photo & Names",
      "Real Preserved Roses",
      "Silent Quartz Movement",
      "Handcrafted Premium Finish",
      "Fade-Resistant & Durable",
      "Ready to Hang"
    ]
  },

  // 6. Jewelry
  {
    id: "prod-8",
    name: "Pressed Flower Resin Pendant",
    category: "Resin Pendants",
    price: 28.00,
    rating: 4.9,
    reviewsCount: 64,
    image: "./public/products/Pressed Flower Resin Pendant.webp",
    description: "A handcrafted resin pendant featuring real pressed flowers preserved in premium crystal-clear resin and finished with an elegant gold-tone frame and matching chain. Lightweight and timeless, each pendant showcases the natural beauty of real botanicals, making every piece uniquely beautiful for everyday wear or thoughtful gifting.",

    dimensions: "Pendant: Approx. 1\"–1.5\" (Shape Varies) | Chain Length: 18\" + 2\" Extension",
    
    materials: [
      "Premium Crystal-Clear Resin",
      "Real Pressed Flowers",
      "Gold-Tone Alloy Frame",
      "Gold-Plated Chain",
      "Protective UV-Resistant Coating"
    ],
    
    inStock: true,
    
    features: [
      "Real Pressed Flowers",
      "Each Piece is One-of-a-Kind",
      "Lightweight & Comfortable",
      "Crystal-Clear Gloss Finish",
      "Fade-Resistant Resin",
      "Perfect for Everyday Wear or Gifting"
    ]
  },

  // 7. Bookmarks
  {
    id: "prod-9",
    name: "Birth Story Memory Clock",
    category: "Resin Wall Clocks",
    price: 12.00,
    rating: 4.6,
    reviewsCount: 119,
    image: "./public/products/Birth Story Memory Clock.png",
    description: "A handcrafted personalized resin wall clock designed to celebrate a baby's first-year journey. Featuring monthly milestone photos, baby's name, birth details, and a custom color theme, this unique keepsake transforms precious memories into a functional piece of home décor. Made with premium crystal-clear resin and a silent quartz movement, it's a timeless gift for parents and growing families.",

    dimensions: "12\" Diameter",
    
    materials: [
      "Premium Crystal-Clear Resin",
      "High-Quality Printed Photos",
      "Gold-Tone Clock Hands",
      "Silent Quartz Clock Movement",
      "UV-Resistant Pigments"
    ],
    
    inStock: true,
    
    features: [
      "Personalized with Baby's Name",
      "12 Monthly Milestone Photos",
      "Custom Birth Details",
      "Silent Non-Ticking Movement",
      "Glossy Crystal-Clear Finish",
      "Ready to Hang",
      "Perfect Baby Shower & First Birthday Gift"
    ]
  },

  // 8. Name Plates
  {
    id: "prod-10",
    name: "Rose Keepsake Plaque",
    category: "Resin Frames",
    price: 75.00,
    rating: 5.0,
    reviewsCount: 45,
    image: "./public/products/Rose Keepsake Plaque.png",
    description: "A handcrafted resin keepsake plaque featuring a personalized photo, names, special date, and preserved roses beautifully arranged with delicate baby's breath flowers, pearl embellishments, and gold foil accents. Crafted with premium crystal-clear resin, this elegant décor piece preserves life's most cherished memories while adding a timeless floral touch to any home or gifting occasion.",

    dimensions: "8\" Round Plaque",
    
    materials: [
      "Premium Crystal-Clear Resin",
      "Preserved Roses",
      "Baby's Breath Flowers",
      "Pearl Embellishments",
      "Gold Foil Accents",
      "High-Quality Printed Photo"
    ],
    
    inStock: true,
    
    features: [
      "Personalized Photo & Names",
      "Custom Date Engraving",
      "Real Preserved Roses",
      "Handcrafted Floral Design",
      "Glossy Crystal Finish",
      "Perfect for Weddings & Anniversaries",
      "Freestanding Display"
    ]
  },

  // 9. Home Décor
  {
    id: "prod-11",
    name: "Round Resin Name Keychain",
    category: "Resin Keychains",
    price: 22.00,
    rating: 4.7,
    reviewsCount: 32,
    image: "./public/products/Round Resin Name Keychain.png",
    description: "A handcrafted resin keychain personalized with your name, initials, or short text. Designed with a glossy crystal-clear finish, elegant pearl details, shimmering pigments, and delicate gold foil accents, this lightweight keychain is both stylish and durable. A perfect everyday accessory or thoughtful personalized gift for friends, family, and loved ones.",

    dimensions: "2\" Round",
    
    materials: [
      "Premium Crystal-Clear Resin",
      "Gold Foil Accents",
      "Pearl Embellishments",
      "Metal Keyring & Chain",
      "High-Quality Vinyl Name"
    ],
    
    inStock: true,
    
    features: [
      "Personalized with Name or Initials",
      "Handcrafted Design",
      "Glossy Resin Finish",
      "Lightweight & Durable",
      "Scratch-Resistant Surface",
      "Easy to Attach to Keys or Bags",
      "Perfect for Gifting"
    ]
  },

  // 10. Custom Gifts
  {
    id: "prod-12",
    name: "Signature Calendar Plaque",
    category: "Resin Frames",
    price: 180.00,
    rating: 5.0,
    reviewsCount: 155,
    image: "./public/products/Signature Calendar Plaque.jpg",
    isBestSeller: true,
    description: "A handcrafted resin plaque featuring a personalized photo, custom calendar highlighting your special date, names, heartfelt message, and decorative pearl and glitter accents. Made with premium crystal-clear resin, this elegant keepsake beautifully preserves meaningful moments and serves as a timeless décor piece for any home. Each plaque is carefully handcrafted to create a unique and lasting memory.",

    dimensions: "8\" Round Plaque",
    
    materials: [
      "Premium Crystal-Clear Resin",
      "High-Quality Printed Photo",
      "Decorative Pearl Embellishments",
      "Silver Glitter Accents",
      "UV-Resistant Pigments"
    ],
    
    inStock: true,
    
    features: [
      "Personalized Photo",
      "Custom Calendar Date",
      "Names & Custom Message",
      "Handcrafted Design",
      "Glossy Crystal Finish",
      "Freestanding Display",
      "Perfect for Birthdays, Anniversaries & Special Occasions"
    ]
  },
  {
    id: "prod-13",
    name: "Floral Resin Wall Clock",
    category: "Resin Wall Clocks",
    price: 180.00,
    rating: 5.0,
    reviewsCount: 155,
    image: "./public/products/Floral Resin Wall Clock.png",
    isBestSeller: true,
    description: "A handcrafted resin wall clock featuring preserved rose petals, delicate baby's breath flowers, pearl embellishments, elegant Roman numerals, and subtle gold foil accents. Crafted with premium crystal-clear resin and a silent quartz movement, this timeless decorative piece combines natural beauty with everyday functionality, making it a stunning addition to any living space.",

    dimensions: "12\" Diameter",
    
    materials: [
      "Premium Crystal-Clear Resin",
      "Preserved Rose Petals",
      "Baby's Breath Flowers",
      "Pearl Embellishments",
      "Gold Foil Accents",
      "Silent Quartz Clock Movement",
      "Gold-Tone Clock Hands"
    ],
    
    inStock: true,
    
    features: [
      "Handcrafted Floral Design",
      "Silent Non-Ticking Movement",
      "Elegant Roman Numerals",
      "Glossy Crystal Finish",
      "Wall-Mount Ready",
      "Lightweight & Durable",
      "Perfect for Home & Gift Decor"
    ]
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "rev-1",
    name: "Eleanor Sterling",
    role: "Interior Designer",
    rating: 5,
    text: "The Floral Resin Wall Clock is the absolute centerpiece of my living room. The depth of the preserved rose petals is genuinely mesmerizing—it looks like real glass. Guests ask about it immediately. The customer service and care sheet provided are top-tier.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    date: "June 14, 2026",
    verified: true,
    productName: "Floral Resin Wall Clock"
  },
  {
    id: "rev-2",
    name: "Julian Mercer",
    role: "Art Collector",
    rating: 5,
    text: "I ordered the Rose Keepsake Plaque for my wife's anniversary. The results surpassed our wildest dreams. The roses look perfectly preserved and floating in air, and the bubble-free glass finish is flawless. Well worth the price.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    date: "May 28, 2026",
    verified: true,
    productName: "Rose Keepsake Plaque"
  },
  {
    id: "rev-3",
    name: "Clara Vandermeer",
    role: "Graphic Artist",
    rating: 5,
    text: "I bought the Signature Calendar Plaque as a housewarming gift. The packaging alone felt like opening a luxurious jewel box. The pearl embellishments are thick, glossy, and beautifully painted. They are robust and heavy. I will definitely be ordering more for myself!",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    date: "April 10, 2026",
    verified: true,
    productName: "Signature Calendar Plaque"
  },
  {
    id: "rev-4",
    name: "Marcus Vance",
    role: "Corporate Executive",
    rating: 4,
    text: "Outstanding work on the First Year Memories Clock. It commands attention in our nursery. The crystal-clear resin stands out beautifully, and the milestone photos look fantastic. Fast shipping and extremely secure bubble wrap packaging.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    date: "March 22, 2026",
    verified: true,
    productName: "First Year Memories Clock"
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
