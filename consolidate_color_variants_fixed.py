import re
from collections import defaultdict

# Read the SQL file
with open('supabase/migrations/20251123_import_scraped_data.sql', 'r') as f:
    content = f.read()

# Extract base name and color from product name
def extract_base_name_and_color(name):
    """Extract base name and color from product name, handling colors anywhere in the string"""
    # Extended color list including Translucent, Clear, etc.
    colors = [
        'Gold', 'Silver', 'Black', 'White', 'Pink', 'Blue', 'Green', 'Red', 'Purple', 
        'Brown', 'Navy', 'Aqua', 'Burgundy', 'Champagne', 'Coral', 'Lavender', 
        'Magenta', 'Pewter', 'Orange', 'Emerald', 'Kelly', 'Bright', 'Medium', 
        'Baby', 'Hot', 'Royal', 'Nude', 'Blush', 'Translucent', 'Clear', 'Rose Gold',
        'Ivory', 'Beige', 'Cream', 'Teal', 'Turquoise', 'Yellow', 'Gray', 'Grey'
    ]
    
    # Sort by length descending to match "Rose Gold" before "Gold"
    colors.sort(key=len, reverse=True)
    
    # Create a pattern that matches any of these colors as a whole word
    # \b matches word boundary
    color_pattern = r'\b(' + '|'.join(re.escape(c) for c in colors) + r')\b'
    
    match = re.search(color_pattern, name, re.IGNORECASE)
    if match:
        color = match.group(1).title() # Standardize to Title Case
        
        # Remove the color from the name
        # Handle cases like "Chair (Gold)" -> "Chair ()" -> "Chair"
        base_name = re.sub(color_pattern, '', name, flags=re.IGNORECASE)
        
        # Clean up parentheses and extra spaces
        base_name = re.sub(r'\(\s*\)', '', base_name) # Remove empty parens
        base_name = re.sub(r'\s+', ' ', base_name)   # Collapse spaces
        base_name = base_name.strip()
        
        # Remove trailing " -" or similar if left behind
        base_name = re.sub(r'\s-\s*$', '', base_name)
        
        return base_name, color
    
    return name, None

# Find and replace product INSERT blocks while preserving everything else
def consolidate_products_in_sql(content):
    lines = content.split('\n')
    new_lines = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        
        # Check if this is a product INSERT statement
        if 'INSERT INTO products' in line and 'VALUES' in line:
            # Capture the category comment above
            category_comment = ''
            if i > 0 and lines[i-1].strip().startswith('--'):
                category_comment = lines[i-1]
                new_lines.pop()  # Remove the comment we already added
            
            # Find the end of this INSERT statement (semicolon)
            insert_start = i
            insert_end = i
            for j in range(i, len(lines)):
                if ';' in lines[j]:
                    insert_end = j
                    break
            
            # Extract all product entries from this INSERT
            insert_block = '\n'.join(lines[insert_start:insert_end+1])
            
            # Extract category variable
            cat_var_match = re.search(r'cat_\w+', insert_block)
            if not cat_var_match:
                # No category variable, keep as is
                new_lines.append(line)
                i += 1
                continue
            
            cat_var = cat_var_match.group(0)
            
            # Extract all product tuples
            product_pattern = r"\('([^']+(?:''[^']+)*)',\s*'([^']+(?:''[^']+)*)',\s*(\d+),\s*" + re.escape(cat_var) + r",\s*'([^']+)',\s*(\d+),\s*(\d+)\)"
            
            products = []
            for match in re.finditer(product_pattern, insert_block):
                products.append({
                    'name': match.group(1),
                    'description': match.group(2),
                    'price': match.group(3),
                    'image_url': match.group(4),
                    'rental_price': match.group(5),
                    'quantity': match.group(6)
                })
            
            # Group by base name
            grouped = defaultdict(list)
            for p in products:
                base_name, color = extract_base_name_and_color(p['name'])
                grouped[base_name].append({**p, 'base_name': base_name, 'color': color})
            
            # Generate new INSERT statement
            if category_comment:
                new_lines.append(category_comment)
            
            new_lines.append('  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES')
            
            product_lines = []
            for base_name, group in sorted(grouped.items()):
                if len(group) > 1 and any(p['color'] for p in group):
                    # Has color variants - consolidate
                    base_product = group[0]
                    
                    # Build modifiers JSON matching frontend structure
                    # interface Modifier { id: string, name: string, options: ModifierOption[] }
                    # interface ModifierOption { id: string, label: string, priceAdjustment: number }
                    
                    options = []
                    for variant in group:
                        if variant['color']:
                            options.append({
                                'id': variant['color'].lower(),
                                'label': variant['color'],
                                'priceAdjustment': 0
                            })
                    
                    modifiers = [{
                        'id': 'color',
                        'name': 'Color',
                        'options': options
                    }]
                    
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
            
            i = insert_end + 1
        else:
            new_lines.append(line)
            i += 1
    
    return '\n'.join(new_lines)

# Process the file
print("Processing SQL file...")
new_content = consolidate_products_in_sql(content)

# Save the result
with open('supabase/migrations/20251123_import_scraped_data.sql', 'w') as f:
    f.write(new_content)

print("✅ SQL file updated successfully!")
print("\nProducts with color variants have been consolidated into single products with modifiers.")
print("All category creation statements have been preserved.")
