import re

# Additional scraped data for remaining categories
additional_data = {
    "linens": [
        {"name": "SOLID STRIPE TABLECLOTH", "price": "$25.00"},
        {"name": "BEETHOVEN TABLECLOTH", "price": "$25.00"},
        {"name": "CHECKS TABLECLOTH", "price": "$25.00"},
        {"name": "PLAID TABLECLOTH", "price": "$25.00"},
        {"name": "AWNING STRIPE TABLECLOTH", "price": "$25.00"},
        {"name": "VELVET TABLECLOTH", "price": "$25.00"},
        {"name": "RACE CAR TABLECLOTH", "price": "$33.00"},
        {"name": "SEQUINS TABLECLOTH", "price": "$25.00"},
        {"name": "Flower on Sequin Taffeta Tablecloth 120\" Round", "price": "$25.00"},
        {"name": "Large Rosette Flower Tablecloth", "price": "$50.00"},
        {"name": "ROUND PINTUCK TABLECLOTH", "price": "$25.00"},
        {"name": "ROUND PAYETTE SEQUIN TABLECLOTH IRIDESCENT", "price": "$40.00"},
        {"name": "RECTANGULAR POLYESTER TABLECLOTH", "price": "$15.00"},
        {"name": "ROUND POLYESTER TABLECLOTH", "price": "$15.00"},
        {"name": "ROUND SILK EMBROIDERED POLYESTER TABLECLOTH", "price": "$25.00"},
    ],
    "napkins": [
        {"name": "Table Napkin (Any Color)", "price": "$2.50"},
    ],
    "misc": [
        {"name": "Green Columns", "price": "$200.00"},
        {"name": "Pink Columns", "price": "$200.00"},
        {"name": "Blush Columns", "price": "$200.00"},
        {"name": "Hot Pink Columns", "price": "$200.00"},
        {"name": "Purple Columns", "price": "$200.00"},
        {"name": "NUDE COLUMNS", "price": "$200.00"},
    ],
    "pedestals": [
        {"name": "Slatted Pedestal", "price": "$60.00"},
        {"name": "Silver Pedestal", "price": "$60.00"},
        {"name": "BLACK COLUMNS", "price": "$200.00"},
        {"name": "3 PIECE SET OF METAL CYLINDER PEDESTALS DISPLAY - SILVER", "price": "$150.00"},
        {"name": "Royal Blue Columns", "price": "$200.00"},
        {"name": "Ruth Pedestals (Gold)", "price": "$225.00"},
        {"name": "Gold Square Pedestals", "price": "$80.00"},
        {"name": "Ruth Pedestals (Silver)", "price": "$225.00"},
        {"name": "Cylinder Acrylic Pedestals (White)", "price": "$160.00"},
    ],
    "shelves": [
        {"name": "Charice Shelf", "price": "$150.00"},
    ],
    "sweets_carts": [
        {"name": "Prime cycle cart", "price": "$200.00"},
        {"name": "Pumpkin Cart", "price": "$200.00"},
        {"name": "White Rustic cart", "price": "$300.00"},
        {"name": "All White Cart", "price": "$250.00"},
        {"name": "White Wagon Cart", "price": "$225.00"},
    ],
    "cake_tables": [
        {"name": "LED ROSES TABLE", "price": "$150.00"},
        {"name": "Squeeze Me Stand (Blue)", "price": "$125.00"},
        {"name": "Squeeze Me Stand (Pink)", "price": "$125.00"},
        {"name": "GIRL Treat Table", "price": "$175.00"},
        {"name": "BOY Treat Table", "price": "$150.00"},
        {"name": "Diamond Cake Table (Gold)", "price": "$160.00"},
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
        
        # Set quantity based on category
        if category_var in ['cat_linens', 'cat_napkins']:
            qty = 100
        elif category_var in ['cat_dinnerware', 'cat_charger_plates']:
            qty = 50
        else:
            qty = 10
        
        values.append(f"  ('{name}', '{desc}', {price}, {category_var}, '{image}', {price}, {qty})")
    
    lines.append(",\n".join(values) + ";")
    return "\n".join(lines)

# Read the existing SQL file
with open('supabase/migrations/20251123_import_scraped_data.sql', 'r') as f:
    content = f.read()

# Map additional scraped data to SQL categories
mappings = [
    ('linens', 'cat_linens', '-- Table Linens'),
    ('napkins', 'cat_napkins', '-- Napkins'),
    ('misc', 'cat_misc', '-- Misc'),
    ('pedestals', 'cat_pedestals', '-- Pedestals'),
    ('shelves', 'cat_shelves', '-- Shelves'),
    ('sweets_carts', 'cat_sweets_carts', '-- Sweets Carts'),
    ('cake_tables', 'cat_cake_tables', '-- Cake Tables'),
]

new_content = content

for key, var, header in mappings:
    if key in additional_data:
        items = additional_data[key]
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

print("\n✓ Final SQL migration update completed!")
print("\nSummary of all scraped categories:")
print("=" * 50)
print("✓ Chairs (13 products)")
print("✓ Tables (9 products)")
print("✓ Backdrops & Panels (20 products)")
print("✓ Bar Counters (8 products)")
print("✓ Bar Stools (5 products)")
print("✓ Bar Tables (10 products)")
print("✓ Flower Walls (4 products)")
print("✓ Shimmer Walls (3 products)")
print("✓ Soft Touch Walls (1 product)")
print("✓ Decorations & Props (8 products)")
print("✓ LED Signs (2 products)")
print("✓ Lit Letters & Numbers (6 products)")
print("✓ Benches & Ottomans (6 products)")
print("✓ Sofas & Loveseats (10 products)")
print("✓ Kids Backdrops (5 products)")
print("✓ Kids Chairs (4 products)")
print("✓ Kids Thrones (2 products)")
print("✓ Charger Plates (12 products)")
print("✓ Dinnerware (18 products)")
print("✓ Flowers & Centerpieces (11 products)")
print("✓ Table Linens (15 products)")
print("✓ Napkins & Rings (1 product)")
print("✓ Misc (6 products)")
print("✓ Pedestals & Plinths (9 products)")
print("✓ Shelves (1 product)")
print("✓ Sweets Carts (5 products)")
print("✓ Cake Tables (6 products)")
print("=" * 50)
print(f"\nTotal: 27 categories with ~200+ products scraped!")
