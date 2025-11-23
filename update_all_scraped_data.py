import re

# All scraped data organized by category
scraped_data = {
    "tables": [
        {"name": "White lux table", "price": "$11.00"},
        {"name": "BANQUET ROUND PARTY TABLES", "price": "$11.00"},
        {"name": "RECTANGULAR BANQUET TABLES", "price": "$11.00"},
        {"name": "gold mirrior table", "price": "$250.00"},
        {"name": "Gold Serpentine table", "price": "$225.00"},
        {"name": "Vogue Triangular Table", "price": "$350.00"},
        {"name": "Fab Glass Table", "price": "$250.00"},
        {"name": "Clear Rectangular Table", "price": "$250.00"},
        {"name": "Olivia Rectangular Table", "price": "$350.00"},
    ],
    "bar_tables": [
        {"name": "White cocktail", "price": "$11.00"},
        {"name": "Led Champagne table", "price": "$50.00"},
        {"name": "Highboy Cocktail Round Spandex Table cover", "price": "$13.50"},
        {"name": "COCKTAIL TABLES", "price": "$14.50"},
        {"name": "Spandex Tablecloth for Cocktail Tables", "price": "$13.50"},
        {"name": "LED COCKTABLE TABLE", "price": "$35.00"},
        {"name": "Trisha Bar Table (Silver)", "price": "$100.00"},
        {"name": "Trisha Bar Table (Gold)", "price": "$100.00"},
        {"name": "Circle Bar Table (Silver)", "price": "$100.00"},
        {"name": "Circle Bar Table (Gold)", "price": "$100.00"},
    ],
    "flower_walls": [
        {"name": "RED FLOWER WALL BACKDROP", "price": "$400.00"},
        {"name": "Grand Flower Wall Backdrop", "price": "$400.00"},
        {"name": "FLOWER WALL & BALLOON", "price": "$522.00"},
        {"name": "Flower Wall (Touch of Pink)", "price": "$250.00"},
    ],
    "shimmer_walls": [
        {"name": "Shimmer Wall (Gold)", "price": "$225.00"},
        {"name": "Shimmer Wall (Black)", "price": "$225.00"},
        {"name": "Shimmer Wall (Silver)", "price": "$225.00"},
    ],
    "soft_touch_walls": [
        {"name": "Soft Touch Wall (Black)", "price": "$150.00"},
    ],
    "decorations_props": [
        {"name": "Green Tree", "price": "$50.00"},
        {"name": "Trio Wedding Gold Arch", "price": "$1,050.00"},
        {"name": "Telephone Booth", "price": "$275.00"},
        {"name": "Zebra", "price": "$125.00"},
        {"name": "Giraffe", "price": "$225.00"},
        {"name": "Elephant", "price": "$225.00"},
        {"name": "Table Top Elephant", "price": "$10.00"},
        {"name": "Gold Number Stand", "price": "$50.00"},
    ],
    "led_signs": [
        {"name": "Happy Birthday LED Sign", "price": "$75.00"},
        {"name": "Let's Party LED Sign", "price": "$75.00"},
    ],
    "lit_letters": [
        {"name": "BABY MARQUEE", "price": "$505.00"},
        {"name": "OH BABY MARQUEE", "price": "$505.00"},
        {"name": "BLACK MARQUEE NUMBERS", "price": "$100.00"},
        {"name": "MARQUEE LETTER", "price": "$125.00"},
        {"name": "LARGE MARQUEE CROSS WITH LIGHT", "price": "$125.00"},
        {"name": "WHITE MARQUEE NUMBER", "price": "$85.00"},
    ],
    "benches": [
        {"name": "Single Velvet Lux", "price": "$195.00"},
        {"name": "Pink Elegance Loveseat", "price": "$195.00"},
        {"name": "Elegance Lux Loveseat", "price": "$195.00"},
        {"name": "Lounge Circles", "price": "$65.00"},
        {"name": "Hendrix 52\" Velvet Flared Arm Loveseat", "price": "$200.00"},
        {"name": "Cage sofa", "price": "$206.25"},
    ],
    "sofas": [
        {"name": "Wave sofa", "price": "$160.00"},
        {"name": "Hendrix Velvet Flared Arm Loveseats", "price": "$160.00"},
        {"name": "Lux Sofa", "price": "$150.00"},
        {"name": "Cage sofa", "price": "$206.25"},
        {"name": "3 PIECE LUX SET", "price": "$270.00"},
        {"name": "Lux Pink sofa", "price": "$200.00"},
        {"name": "fancy Royal Sofa", "price": "$246.50"},
        {"name": "NUDE SOFA", "price": "$200.00"},
        {"name": "Chic Sofa (Black)", "price": "$300.00"},
        {"name": "White Dotted Throne Sofa", "price": "$240.00"},
    ],
    "kids_backdrops": [
        {"name": "Dreamland Train", "price": "$425.00"},
        {"name": "Princess Express Train", "price": "$425.00"},
        {"name": "Story Book", "price": "$275.00"},
        {"name": "Royal Castle", "price": "$475.00"},
        {"name": "Blast Zone Magic Castle", "price": "$275.00"},
    ],
    "kids_chairs": [
        {"name": "Kids Bow Back Chair", "price": "$5.00"},
        {"name": "kids Chiavari Blue Chair", "price": "$5.00"},
        {"name": "KIDS White Samsonite Chair", "price": "$2.25"},
        {"name": "Kids Bamboo Chair (Pink)", "price": "$5.00"},
    ],
    "kids_thrones": [
        {"name": "Kids Bow Back Chair", "price": "$120.00"},
        {"name": "Kids King Throne Chair (White)", "price": "$120.00"},
    ],
    "charger_plates": [
        {"name": "Plain Red Chargers", "price": "$6.50"},
        {"name": "Eclipse Gold Charger", "price": "$6.50"},
        {"name": "Natural Tone Charger", "price": "$1.00"},
        {"name": "Reef Charger Plate (Pink)", "price": "$3.50"},
        {"name": "Reef Charger Plate (Navy Blue)", "price": "$3.50"},
        {"name": "Reef Charger Plate (Purple)", "price": "$3.50"},
        {"name": "Reef Charger Plate (Gold)", "price": "$3.50"},
        {"name": "Reef Charger Plate (Black)", "price": "$3.50"},
        {"name": "Reef Charger Plate (Aqua Blue)", "price": "$3.50"},
        {"name": "Reef Charger Plate (Baby Blue)", "price": "$3.50"},
        {"name": "Reef Charger Plate (Burgundy)", "price": "$3.50"},
        {"name": "Reef Charger Plate (Silver)", "price": "$3.50"},
    ],
    "dinnerware": [
        {"name": "White Dessert Plate", "price": "$0.99"},
        {"name": "Blanc Wine Glass", "price": "$1.35"},
        {"name": "Rocks / Old Fashioned Glass", "price": "$1.35"},
        {"name": "Champagne Flute 6.25oz", "price": "$1.25"},
        {"name": "Modern luxury Matte Gold Silverware", "price": "$1.95"},
        {"name": "Stoneware Mug 12oz", "price": "$0.99"},
        {"name": "Stemless Glass 20.5oz", "price": "$1.35"},
        {"name": "Stainless Steel Steak Knives", "price": "$0.99"},
        {"name": "The Drop Flatware Stainless Steel Silverware", "price": "$1.05"},
        {"name": "Bentley stainless steel spoon", "price": "$0.95"},
        {"name": "White Plate 7.5 in", "price": "$0.99"},
        {"name": "White Dinner Plate 10.5 in", "price": "$1.05"},
        {"name": "Classic Black Plate 10.5 in", "price": "$1.05"},
        {"name": "Classic Black Plate 7.5 in", "price": "$0.99"},
        {"name": "White serving Coupe Bone China Plate", "price": "$0.95"},
        {"name": "Gold Rim Dinner Plates 10.5 in", "price": "$1.25"},
        {"name": "Glass Pint Jar 16oz", "price": "$1.25"},
        {"name": "Glass Carafe 1 liter", "price": "$6.00"},
    ],
    "flowers": [
        {"name": "Green Tree", "price": "$65.00"},
        {"name": "ELEGANT CANDLES", "price": "$65.00"},
        {"name": "LUX TRIANGLE W/FLOWERS", "price": "$85.00"},
        {"name": "FLORAL BALL", "price": "$35.00"},
        {"name": "3 GOBLETS", "price": "$35.00"},
        {"name": "Spring Valley Centerpiece", "price": "$45.00"},
        {"name": "The Elegance Centerpiece", "price": "$45.00"},
        {"name": "Peach Time Centerpiece", "price": "$45.00"},
        {"name": "Flower Runner (Purple & Pink)", "price": "$375.00"},
        {"name": "Flower Runner (Pink)", "price": "$120.00"},
        {"name": "Flower Runner (Purple)", "price": "$120.00"},
    ],
}

def parse_price(price_str):
    if not price_str or price_str == 'N/A':
        return 0
    clean = price_str.replace('$', '').replace(',', '')
    try:
        return int(float(clean) * 100)
    except:
        return 0

def generate_insert(category_var, items, category_name):
    lines = []
    lines.append(f"  -- {category_name}")
    lines.append(f"  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES")
    
    values = []
    for item in items:
        name = item['name'].replace("'", "''")
        price = parse_price(item['price'])
        image = f"https://placehold.co/600x400?text={name.replace(' ', '+')}"
        desc = f"{name}."
        qty = 10 if category_var not in ['cat_tables', 'cat_dinnerware', 'cat_charger_plates'] else 50
        
        values.append(f"  ('{name}', '{desc}', {price}, {category_var}, '{image}', {price}, {qty})")
    
    lines.append(",\n".join(values) + ";")
    return "\n".join(lines)

# Read the existing SQL file
with open('supabase/migrations/20251123_import_scraped_data.sql', 'r') as f:
    content = f.read()

# Map scraped data to SQL categories
mappings = [
    ('tables', 'cat_tables', '-- Tables'),
    ('bar_tables', 'cat_bar_tables', '-- Bar Tables'),
    ('flower_walls', 'cat_flower_walls', '-- Flower Walls'),
    ('shimmer_walls', 'cat_shimmer_walls', '-- Shimmer Walls'),
    ('soft_touch_walls', 'cat_soft_touch_walls', '-- Soft Touch Walls'),
    ('decorations_props', 'cat_decor_props', '-- Decorations Props'),
    ('led_signs', 'cat_led_signs', '-- LED Signs'),
    ('lit_letters', 'cat_lit_letters', '-- Lit Letters'),
    ('benches', 'cat_benches', '-- Benches & Ottomans'),
    ('sofas', 'cat_sofas', '-- Sofas & Loveseats'),
    ('kids_backdrops', 'cat_kids_backdrops', '-- Kids Backdrops'),
    ('kids_chairs', 'cat_kids_chairs', '-- Kids Chairs'),
    ('kids_thrones', 'cat_kids_thrones', '-- Kids Thrones'),
    ('charger_plates', 'cat_charger_plates', '-- Charger Plates'),
    ('dinnerware', 'cat_dinnerware', '-- Dinnerware'),
    ('flowers', 'cat_flowers', '-- Flowers & Centerpieces'),
]

new_content = content

for key, var, header in mappings:
    if key in scraped_data:
        items = scraped_data[key]
        category_name = header.replace('-- ', '')
        new_block = generate_insert(var, items, category_name)
        
        # Pattern to find and replace the block
        pattern = re.compile(rf"{re.escape(header)}\s+INSERT INTO products.*?;\s*", re.DOTALL)
        
        if pattern.search(new_content):
            new_content = pattern.sub(new_block + "\n\n", new_content)
            print(f"✓ Updated {category_name}")
        else:
            print(f"✗ Could not find block for {header}")

# Write the updated content
with open('supabase/migrations/20251123_import_scraped_data.sql', 'w') as f:
    f.write(new_content)

print("\n✓ SQL migration file updated successfully!")
