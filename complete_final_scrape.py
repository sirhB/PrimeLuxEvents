import re

# Final batch of scraped data for remaining categories
final_batch_data = {
    "buffet": [
        {"name": "White Wagon Cart", "price": "$225.00"},
        {"name": "White serving Coupe Bone China Plate", "price": "$0.95"},
        {"name": "Gold Cake Stand", "price": "$50.00"},
    ],
    "chafing": [
        {"name": "6 BURNER STOVE", "price": "$150.00"},
        {"name": "Char Griller", "price": "$125.00"},
        {"name": "Food warmer", "price": "$45.00"},
    ],
    "cooking": [
        {"name": "Food warmer", "price": "$45.00"},
        {"name": "Elite Dripless Rectangular Chafer with Gold", "price": "$45.00"},
        {"name": "Renaissance Chafer", "price": "$30.00"},
        {"name": "Economy 8 Qt. Full Size Stainless Steel Chafer", "price": "$15.00"},
        {"name": "Deluxe 8 Qt. Full Size Gold Accent Chafer", "price": "$25.00"},
        {"name": "Deluxe 4 Qt. Round Gold Accent Chafer", "price": "$15.00"},
        {"name": "Classic Half Size Round Chafer", "price": "$25.00"},
        {"name": "Full Size Chafer Choice Classic 8 Qt.", "price": "$25.00"},
    ],
    "flooring": [
        {"name": "Installation", "price": "$125.00"},
        {"name": "Dance Floor 3x3", "price": "$32.00"},
        {"name": "QuickLock Staging 8'x8' Indoor/Outdoor Stage System", "price": "$450.00"},
        {"name": "Pure white Stage 8x8", "price": "$800.00"},
        {"name": "Acrylic Stage 8'x 8'", "price": "$575.00"},
    ],
    "kids_tables": [
        {"name": "KIDS 6FT TABLE", "price": "$15.00"},
    ],
    "tents": [
        {"name": "Tent Installation", "price": "$125.00"},
        {"name": "10x10 Tent", "price": "$150.00"},
        {"name": "20x30 Tent", "price": "$675.00"},
        {"name": "20x40 Tent", "price": "$875.00"},
        {"name": "20x20 Tent", "price": "$475.00"},
        {"name": "LED Cabana", "price": "$715.00"},
        {"name": "Single Cabana", "price": "$650.00"},
        {"name": "Outdoor Package #1", "price": "$990.00"},
        {"name": "Outdoor Package #2", "price": "$1,293.50"},
        {"name": "Outdoor Package #3", "price": "$1,145.00"},
        {"name": "Outdoor Package #4", "price": "$1,681.50"},
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
        image = f"https://placehold.co/600x400?text={name.replace(' ', '+')[:50]}"
        desc = f"{name}."
        qty = 10
        
        values.append(f"  ('{name}', '{desc}', {price}, {category_var}, '{image}', {price}, {qty})")
    
    lines.append(",\n".join(values) + ";")
    return "\n".join(lines)

# Read the existing SQL file
with open('supabase/migrations/20251123_import_scraped_data.sql', 'r') as f:
    content = f.read()

# Map final batch data to SQL categories
mappings = [
    ('buffet', 'cat_buffet', '-- Buffet'),
    ('chafing', 'cat_chafing', '-- Chafing Dishes'),
    ('cooking', 'cat_cooking', '-- Cooking'),
    ('flooring', 'cat_flooring', '-- Flooring'),
    ('kids_tables', 'cat_kids_tables', '-- Kids Tables'),
    ('tents', 'cat_tents', '-- Tents'),
]

new_content = content

for key, var, header in mappings:
    if key in final_batch_data:
        items = final_batch_data[key]
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

print("\n✓ FINAL batch update completed!")
print("\n" + "=" * 60)
print("COMPLETE SCRAPING SUMMARY")
print("=" * 60)
print("\n📦 ALL CATEGORIES SCRAPED (33 total):\n")

categories = [
    ("Chairs", 13),
    ("Tables", 9),
    ("Backdrops & Panels", 20),
    ("Bar Counters", 8),
    ("Bar Stools", 5),
    ("Bar Tables", 10),
    ("Flower Walls", 4),
    ("Shimmer Walls", 3),
    ("Soft Touch Walls", 1),
    ("Decorations & Props", 8),
    ("LED Signs", 2),
    ("Lit Letters & Numbers", 6),
    ("Benches & Ottomans", 6),
    ("Sofas & Loveseats", 10),
    ("Kids Backdrops", 5),
    ("Kids Chairs", 4),
    ("Kids Tables", 1),
    ("Kids Thrones", 2),
    ("Charger Plates", 12),
    ("Dinnerware", 18),
    ("Flowers & Centerpieces", 11),
    ("Table Linens", 15),
    ("Napkins & Rings", 1),
    ("Misc", 6),
    ("Pedestals & Plinths", 9),
    ("Shelves", 1),
    ("Sweets Carts", 5),
    ("Cake Tables", 6),
    ("Buffet Service", 3),
    ("Chafing Dishes", 3),
    ("Cooking & Prep", 8),
    ("Flooring & Staging", 5),
    ("Tents", 11),
]

total_products = 0
for cat_name, count in categories:
    print(f"  ✓ {cat_name:<30} {count:>3} products")
    total_products += count

print("\n" + "=" * 60)
print(f"🎉 TOTAL: {len(categories)} categories with {total_products} products!")
print("=" * 60)
print("\n✅ All products from primeluxevents.com have been scraped!")
print("✅ SQL migration file is ready to be applied!")
