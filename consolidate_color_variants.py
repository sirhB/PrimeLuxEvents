import re
from collections import defaultdict

# Read the SQL file
with open('supabase/migrations/20251123_import_scraped_data.sql', 'r') as f:
    content = f.read()

# Extract all product INSERT statements
pattern = r"\('([^']+(?:''[^']+)*)',\s*'([^']+(?:''[^']+)*)',\s*(\d+),\s*(cat_\w+),\s*'([^']+)',\s*(\d+),\s*(\d+)\)"

products = []
for match in re.finditer(pattern, content):
    products.append({
        'name': match.group(1),
        'description': match.group(2),
        'price': match.group(3),
        'category': match.group(4),
        'image_url': match.group(5),
        'rental_price': match.group(6),
        'quantity': match.group(7),
        'full_match': match.group(0)
    })

# Group products by base name (without color)
def extract_base_name_and_color(name):
    """Extract base name and color from product name"""
    # Common color patterns
    color_patterns = [
        r'\s*\((gold|silver|black|white|pink|blue|green|red|purple|brown|navy|aqua|burgundy|champagne|coral|lavender|magenta|pewter|orange|emerald|kelly|bright|medium|baby|hot|royal|nude|blush)\)$',
        r'\s+(gold|silver|black|white|pink|blue|green|red|purple|brown|navy|aqua|burgundy|champagne|coral|lavender|magenta|pewter|orange|emerald|kelly|bright|medium|baby|hot|royal|nude|blush)$',
    ]
    
    for pattern in color_patterns:
        match = re.search(pattern, name, re.IGNORECASE)
        if match:
            color = match.group(1).capitalize()
            base_name = re.sub(pattern, '', name, flags=re.IGNORECASE).strip()
            return base_name, color
    
    return name, None

# Group products
grouped_products = defaultdict(list)
for product in products:
    base_name, color = extract_base_name_and_color(product['name'])
    key = (base_name, product['category'])
    grouped_products[key].append({
        **product,
        'base_name': base_name,
        'color': color
    })

# Identify products that have color variants
products_with_variants = {}
single_products = []

for key, group in grouped_products.items():
    if len(group) > 1:
        # Multiple variants found
        products_with_variants[key] = group
    else:
        # Single product, no variants
        single_products.extend(group)

print(f"Found {len(products_with_variants)} products with color variants:")
print(f"Found {len(single_products)} single products without variants")
print()

# Display products with variants
for (base_name, category), variants in sorted(products_with_variants.items()):
    colors = [v['color'] for v in variants if v['color']]
    print(f"  • {base_name} ({category}): {len(variants)} variants - {', '.join(colors)}")

print()
print("=" * 70)
print("Generating consolidated SQL with modifiers...")
print("=" * 70)

# Generate new SQL with consolidated products
def generate_consolidated_sql():
    """Generate SQL with consolidated products and modifiers"""
    
    # Split content into sections
    lines = content.split('\n')
    
    # Find the start of each category's INSERT statement
    category_sections = {}
    current_category = None
    
    for i, line in enumerate(lines):
        if re.match(r'\s*--\s+(Chairs|Tables|Backdrops|Bar Stools|Bar Counters|Bar Tables|Flower Walls|Shimmer Walls|Soft Touch Walls|Decorations|LED Signs|Lit Letters|Benches|Sofas|Kids|Charger Plates|Dinnerware|Flowers|Table Linens|Napkins|Misc|Pedestals|Shelves|Sweets Carts|Cake Tables|Buffet|Chafing|Cooking|Flooring|Tents)', line):
            current_category = line.strip()
            category_sections[current_category] = i
    
    # Build new SQL
    new_lines = []
    skip_until = -1
    
    for i, line in enumerate(lines):
        if i < skip_until:
            continue
            
        # Check if this is a category header
        is_category_header = re.match(r'\s*--\s+(Chairs|Tables|Backdrops|Bar Stools|Bar Counters|Bar Tables|Flower Walls|Shimmer Walls|Soft Touch Walls|Decorations|LED Signs|Lit Letters|Benches|Sofas|Kids|Charger Plates|Dinnerware|Flowers|Table Linens|Napkins|Misc|Pedestals|Shelves|Sweets Carts|Cake Tables|Buffet|Chafing|Cooking|Flooring|Tents)', line)
        
        if is_category_header:
            # Find the end of this category's INSERT statement
            category_start = i
            category_end = i
            
            # Find the semicolon that ends this INSERT
            for j in range(i, len(lines)):
                if ';' in lines[j] and 'INSERT INTO products' in '\n'.join(lines[i:j+1]):
                    category_end = j
                    break
            
            # Extract category variable name
            category_block = '\n'.join(lines[category_start:category_end+1])
            cat_var_match = re.search(r'cat_\w+', category_block)
            
            if cat_var_match:
                cat_var = cat_var_match.group(0)
                
                # Get products for this category
                cat_products = [p for p in products if p['category'] == cat_var]
                
                # Group by base name
                cat_grouped = defaultdict(list)
                for p in cat_products:
                    base_name, color = extract_base_name_and_color(p['name'])
                    cat_grouped[base_name].append({**p, 'base_name': base_name, 'color': color})
                
                # Generate new INSERT statements
                new_lines.append(line)  # Category comment
                new_lines.append('  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES')
                
                product_lines = []
                for base_name, group in sorted(cat_grouped.items()):
                    if len(group) > 1 and any(p['color'] for p in group):
                        # Has color variants - consolidate
                        base_product = group[0]
                        
                        # Build modifiers JSON
                        modifiers = []
                        for variant in group:
                            if variant['color']:
                                modifiers.append({
                                    'name': 'Color',
                                    'value': variant['color'],
                                    'priceAdjustment': 0  # All same price for now
                                })
                        
                        modifiers_json = str(modifiers).replace("'", '"')
                        
                        product_line = f"  ('{base_product['base_name']}', '{base_product['base_name']}.', {base_product['price']}, {cat_var}, '{base_product['image_url']}', {base_product['rental_price']}, {base_product['quantity']}, '{modifiers_json}'::jsonb)"
                        product_lines.append(product_line)
                    else:
                        # No variants - keep as is
                        p = group[0]
                        product_line = f"  ('{p['name']}', '{p['description']}', {p['price']}, {cat_var}, '{p['image_url']}', {p['rental_price']}, {p['quantity']}, '[]'::jsonb)"
                        product_lines.append(product_line)
                
                new_lines.append(',\n'.join(product_lines) + ';')
                new_lines.append('')
                
                skip_until = category_end + 1
            else:
                new_lines.append(line)
        else:
            new_lines.append(line)
    
    return '\n'.join(new_lines)

# Generate and save
new_content = generate_consolidated_sql()

with open('supabase/migrations/20251123_import_scraped_data.sql', 'w') as f:
    f.write(new_content)

print()
print("✅ SQL file updated with consolidated products and modifiers!")
print()
print("Summary:")
print(f"  • {len(products_with_variants)} product groups now use modifiers")
print(f"  • {sum(len(v) for v in products_with_variants.values())} individual variants consolidated")
print(f"  • Reduced from {len(products)} to ~{len(single_products) + len(products_with_variants)} unique products")
