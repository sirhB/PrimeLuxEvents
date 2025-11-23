import re

scraped_data = {
  "backdrops_and_panels": [
    {"name": "Scottsdale Arch", "price": "$375.00", "image": "https://static.wixstatic.com/media/938d0f_c74ec89aecc1453c9483f15c759ea512~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_c74ec89aecc1453c9483f15c759ea512~mv2.png"},
    {"name": "Sapphire acrh", "price": "$250.00", "image": "https://static.wixstatic.com/media/938d0f_7e5bde18cb914fb2a26c5af24003c4fb~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_7e5bde18cb914fb2a26c5af24003c4fb~mv2.png"},
    {"name": "Clover wave Acrh", "price": "$275.00", "image": "https://static.wixstatic.com/media/938d0f_a0ed9e68ba844511805208fe9b1ce21d~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_a0ed9e68ba844511805208fe9b1ce21d~mv2.png"},
    {"name": "Ana set", "price": "$600.00", "image": "https://static.wixstatic.com/media/938d0f_44ec157181004e7eb71c5e932d5b11f8~mv2.jpg/v1/fill/w_432,h_432,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_44ec157181004e7eb71c5e932d5b11f8~mv2.jpg"},
    {"name": "Waves of Elegance Backdrop 8x8ft", "price": "$450.00", "image": "https://static.wixstatic.com/media/938d0f_07f5bc9b83214effac3c4f5241d59128~mv2.jpg/v1/fill/w_432,h_432,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_07f5bc9b83214effac3c4f5241d59128~mv2.jpg"},
    {"name": "JOLIE\"S BACKDROP", "price": "$650.00", "image": "https://static.wixstatic.com/media/938d0f_81e9c17f83b64f7fa5ec01fffde8a332~mv2.jpg/v1/fill/w_432,h_432,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_81e9c17f83b64f7fa5ec01fffde8a332~mv2.jpg"},
    {"name": "Story Book", "price": "$275.00", "image": "https://static.wixstatic.com/media/938d0f_a9fc3b4477ef4593994344b4e222a9aa~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_a9fc3b4477ef4593994344b4e222a9aa~mv2.png"},
    {"name": "Fresh Kicks Display 6ft", "price": "$225.00", "image": "https://static.wixstatic.com/media/938d0f_1ffbd887af024dd2b4501eadfbfa62d4~mv2.jpg/v1/fill/w_432,h_432,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_1ffbd887af024dd2b4501eadfbfa62d4~mv2.jpg"},
    {"name": "Moon 7ft", "price": "$175.00", "image": "https://static.wixstatic.com/media/938d0f_76b247dbc6e44e9b90be6eef0acc8768~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_76b247dbc6e44e9b90be6eef0acc8768~mv2.png"},
    {"name": "Santorini wall package", "price": "$1,000.00", "image": "https://static.wixstatic.com/media/938d0f_d4b38484fc8f4dff9a60afc21e435e52~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_d4b38484fc8f4dff9a60afc21e435e52~mv2.png"},
    {"name": "Boxwood Wall 6ft x 3ft", "price": "$225.00", "image": "https://static.wixstatic.com/media/938d0f_a58afd965db24fa086929fab3b00571a~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_a58afd965db24fa086929fab3b00571a~mv2.png"},
    {"name": "Sugar Blossom Patisserie 🌸🍩", "price": "$500.00", "image": "https://static.wixstatic.com/media/938d0f_6a2669ec7f3548af802309eccd44ec5f~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_6a2669ec7f3548af802309eccd44ec5f~mv2.png"},
    {"name": "Rustic Red Barn Wall", "price": "$275.00", "image": "https://static.wixstatic.com/media/938d0f_b79c0f9d01804a95bc3b22c179a1bac0~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_b79c0f9d01804a95bc3b22c179a1bac0~mv2.png"},
    {"name": "F&M Arch Wall", "price": "$150.00", "image": "https://static.wixstatic.com/media/938d0f_9d51ac5ad17f4048a607e3989f4d6c15~mv2.jpg/v1/fill/w_432,h_432,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_9d51ac5ad17f4048a607e3989f4d6c15~mv2.jpg"},
    {"name": "Fanta Shelf Wall | 8ft x 8ft", "price": "$275.00", "image": "https://static.wixstatic.com/media/938d0f_dcf9e12c7a54464c82e7594cae4f23e5~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_dcf9e12c7a54464c82e7594cae4f23e5~mv2.png"},
    {"name": "Trio Wedding Gold Arch", "price": "$1,050.00", "image": "https://static.wixstatic.com/media/938d0f_54f2bd57be634107a4e786290f28d004~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_54f2bd57be634107a4e786290f28d004~mv2.png"},
    {"name": "The Crain wall", "price": "$125.00", "image": "https://static.wixstatic.com/media/938d0f_c2ba7100b4b248cba24693813efa9b18~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_c2ba7100b4b248cba24693813efa9b18~mv2.png"},
    {"name": "Alice flower box 6ft x 4ft", "price": "$350.00", "image": "https://static.wixstatic.com/media/938d0f_f4b792a69c944adca8bf39fdc5049db5~mv2.jpg/v1/fill/w_432,h_432,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_f4b792a69c944adca8bf39fdc5049db5~mv2.jpg"},
    {"name": "Luxe Tote", "price": "$650.00", "image": "https://static.wixstatic.com/media/938d0f_7ac2093b20774d64805374ab07dbec48~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_7ac2093b20774d64805374ab07dbec48~mv2.png"},
    {"name": "Store Front", "price": "$450.00", "image": "https://static.wixstatic.com/media/938d0f_0d85b7b282504b0cbe2e48fef8da89bb~mv2.png/v1/fill/w_432,h_432,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/938d0f_0d85b7b282504b0cbe2e48fef8da89bb~mv2.png"}
  ],
  "bar_counters": [
    {"name": "Malibu Bar 6ft", "price": "$325.00", "image": "", "link": "https://www.primeluxevents.com/product-page/malibu-bar-6ft"},
    {"name": "Lux Bar", "price": "$350.00", "image": "", "link": "https://www.primeluxevents.com/product-page/lux-bar"},
    {"name": "White CHAMPAGNE WALL", "price": "$150.00", "image": "", "link": "https://www.primeluxevents.com/product-page/champagne-wall"},
    {"name": "Black Champagne Wall", "price": "$180.00", "image": "", "link": "https://www.primeluxevents.com/product-page/black-champagne-wall"},
    {"name": "Walnut laminate bar", "price": "$75.00", "image": "", "link": "https://www.primeluxevents.com/product-page/walnut-laminate-bar"},
    {"name": "White Formica Bar", "price": "$75.00", "image": "", "link": "https://www.primeluxevents.com/product-page/mirrored-console-table"},
    {"name": "Laminate black bar", "price": "$75.00", "image": "", "link": "https://www.primeluxevents.com/product-page/laminate-black-bar"},
    {"name": "GRASS BAR", "price": "$150.00", "image": "", "link": "https://www.primeluxevents.com/product-page/grass-bar-1"}
  ],
  "bar_stools": [
    {"name": "LUX GOLD BAR STOOL", "price": "$25.00", "image": "", "link": "https://www.primeluxevents.com/product-page/gold-bar-stool"},
    {"name": "Stylish Vintage Barstool 30”", "price": "$12.00", "image": "", "link": "https://www.primeluxevents.com/product-page/copy-of-stylish-vintage-barstool-24"},
    {"name": "Stylish Vintage Barstool 24”", "price": "$10.20", "image": "", "link": "https://www.primeluxevents.com/product-page/stackable-bartool"},
    {"name": "LUX SILVER BAR STOOL", "price": "$20.00", "image": "", "link": "https://www.primeluxevents.com/product-page/lux-silver-bar-stool"},
    {"name": "O Back Gold Bar Stool", "price": "$25.00", "image": "", "link": "https://www.primeluxevents.com/product-page/o-back-gold-bar-stool"}
  ],
  "chairs": [
    {"name": "TRANSLUCENT CHIAVARI CHAIR", "price": "$7.00", "image": "", "link": "https://www.primeluxevents.com/product-page/translucent-chiavari-chair"},
    {"name": "CLEAR ROUND ELEGANCE", "price": "$7.50", "image": "", "link": "https://www.primeluxevents.com/product-page/clear-round-elegance"},
    {"name": "Padded Folding Chair", "price": "$3.50", "image": "", "link": "https://www.primeluxevents.com/product-page/choice-deluxe-8-qt-full-size-gold-accent-chafer"},
    {"name": "BLACK PADDED CHAIR", "price": "$3.50", "image": "", "link": "https://www.primeluxevents.com/product-page/black-padded-chair"},
    {"name": "BLACK CHIAVARI CHAIR", "price": "$7.00", "image": "", "link": "https://www.primeluxevents.com/product-page/black-chiavari-chair"},
    {"name": "PRIME PINK ROYALTY CHAIR", "price": "$14.40", "image": "", "link": "https://www.primeluxevents.com/product-page/prime-pink-royalty-chair"},
    {"name": "White Samsonite Chair", "price": "$2.50", "image": "", "link": "https://www.primeluxevents.com/product-page/classic-8-qt-full-size-chafer"},
    {"name": "O Back Gold Chair", "price": "$18.00", "image": "", "link": "https://www.primeluxevents.com/product-page/o-back-gold-chair"},
    {"name": "O Back Silver Chair", "price": "$18.00", "image": "", "link": "https://www.primeluxevents.com/product-page/o-back-silver-chair"},
    {"name": "Heart Chair (Gold)", "price": "$12.00", "image": "", "link": "https://www.primeluxevents.com/product-page/heart-chair-gold"},
    {"name": "Bamboo Chair (Gold)", "price": "$7.00", "image": "", "link": "https://www.primeluxevents.com/product-page/bamboo-chair-gold"},
    {"name": "Bamboo Chair (Silver)", "price": "$7.00", "image": "", "link": "https://www.primeluxevents.com/product-page/bamboo-chair-silver"},
    {"name": "Folding Acrylic Chair (Gold)", "price": "$11.25", "image": "", "link": "https://www.primeluxevents.com/product-page/folding-acrylic-chair-gold"}
  ]
}

def parse_price(price_str):
    if not price_str or price_str == 'N/A':
        return 0
    clean = price_str.replace('$', '').replace(',', '')
    try:
        return int(float(clean) * 100)
    except:
        return 0

def generate_insert(category_var, items):
    lines = []
    lines.append(f"  -- {category_var.replace('cat_', '').replace('_', ' ').title()}")
    lines.append(f"  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available) VALUES")
    
    values = []
    for item in items:
        name = item['name'].replace("'", "''")
        price = parse_price(item['price'])
        image = item['image'] if item['image'] else f"https://placehold.co/600x400?text={name.replace(' ', '+')}"
        desc = f"{name}."
        qty = 10
        
        values.append(f"  ('{name}', '{desc}', {price}, {category_var}, '{image}', {price}, {qty})")
    
    lines.append(",\n".join(values) + ";")
    return "\n".join(lines)

with open('supabase/migrations/20251123_import_scraped_data.sql', 'r') as f:
    content = f.read()

mappings = [
    ('chairs', 'cat_chairs', '-- Chairs'),
    ('bar_stools', 'cat_bar_stools', '-- Bar Stools'),
    ('backdrops_and_panels', 'cat_backdrops', '-- Backdrops & Panels'),
    ('bar_counters', 'cat_bar_counters', '-- Bar Counters')
]

new_content = content

for key, var, header in mappings:
    if key in scraped_data:
        items = scraped_data[key]
        new_block = generate_insert(var, items)
        
        # Regex to find the block
        # The block starts with the header (e.g. "-- Chairs")
        # Then contains "INSERT INTO products"
        # Then ends with a semicolon
        
        # We need to be careful to match only the specific block.
        # The blocks are separated by blank lines and comments.
        
        # Pattern:
        # 1. The header literal
        # 2. Any whitespace
        # 3. "INSERT INTO products" ...
        # 4. ... ending with ";"
        
        pattern = re.compile(rf"{re.escape(header)}\s+INSERT INTO products.*?;\s*", re.DOTALL)
        
        if pattern.search(new_content):
            new_content = pattern.sub(new_block + "\n\n", new_content)
        else:
            print(f"Could not find block for {header}")

with open('supabase/migrations/20251123_import_scraped_data.sql', 'w') as f:
    f.write(new_content)
