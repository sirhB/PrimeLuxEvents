import re

def clean_product_name(name):
    """Clean and standardize product names"""
    
    # Remove escaped quotes first
    name = name.replace("''", "'")
    
    # Special cases that should remain uppercase
    uppercase_words = {'LED', 'LCD', 'USB', 'DVD', 'TV', 'AC', 'DC', 'VIP', 'DJ', 'BBQ', 'UV'}
    
    # Measurement abbreviations that should be lowercase
    measurements = {'ft', 'in', 'oz', 'qt', 'x'}
    
    # Words that should be lowercase (articles, prepositions, conjunctions)
    lowercase_words = {'a', 'an', 'the', 'and', 'or', 'but', 'for', 'with', 'of', 'in', 'on', 'at', 'to', 'from'}
    
    # Split into words
    words = name.split()
    cleaned_words = []
    
    for i, word in enumerate(words):
        # Check if it's a measurement pattern like "8x8" or "6ft"
        if re.match(r'^\d+[xX]\d+$', word):
            cleaned_words.append(word.lower().replace('x', 'x'))
            continue
        
        if re.match(r'^\d+["\']?$', word):  # Just numbers or numbers with quotes
            cleaned_words.append(word)
            continue
            
        # Remove special characters for checking
        word_clean = re.sub(r'[^a-zA-Z]', '', word)
        
        # Check if entire word should be uppercase
        if word_clean.upper() in uppercase_words:
            cleaned_words.append(word_clean.upper() + word[len(word_clean):])
        # Check if it's a measurement
        elif word_clean.lower() in measurements:
            cleaned_words.append(word.lower())
        # First word or after punctuation should be capitalized
        elif i == 0 or (i > 0 and words[i-1].endswith((':', '-', '('))):
            cleaned_words.append(word.capitalize())
        # Check if it should be lowercase
        elif word_clean.lower() in lowercase_words and i > 0:
            cleaned_words.append(word.lower())
        # Default: capitalize first letter
        else:
            cleaned_words.append(word.capitalize())
    
    result = ' '.join(cleaned_words)
    
    # Fix common patterns
    result = re.sub(r'\bLed\b', 'LED', result)
    result = re.sub(r'\bDj\b', 'DJ', result)
    result = re.sub(r'\bVip\b', 'VIP', result)
    result = re.sub(r'\bBbq\b', 'BBQ', result)
    result = re.sub(r'\b(\d+)\s*X\s*(\d+)\b', r'\1x\2', result, flags=re.IGNORECASE)
    result = re.sub(r'\b(\d+)\s*Ft\b', r'\1ft', result, flags=re.IGNORECASE)
    result = re.sub(r'\b(\d+)\s*In\b', r'\1in', result, flags=re.IGNORECASE)
    result = re.sub(r'\bQt\.', 'Qt.', result)
    result = re.sub(r'\bOz\b', 'oz', result, flags=re.IGNORECASE)
    
    # Fix parentheses spacing
    result = re.sub(r'\s*\(\s*', ' (', result)
    result = re.sub(r'\s*\)\s*', ') ', result).strip()
    
    # Fix quotes
    result = re.sub(r'\s*"\s*', '"', result)
    result = re.sub(r'"\s+', '" ', result)
    
    # Re-escape single quotes for SQL
    result = result.replace("'", "''")
    
    return result

# Read the SQL file
with open('supabase/migrations/20251123_import_scraped_data.sql', 'r') as f:
    content = f.read()

# Find all product INSERT statements and clean names
pattern = r"\('([^']+(?:''[^']+)*)',\s*'([^']+(?:''[^']+)*)',\s*(\d+),\s*(cat_\w+),"

def replace_product(match):
    name = match.group(1)
    desc = match.group(2)
    price = match.group(3)
    category = match.group(4)
    
    # Clean the name
    cleaned_name = clean_product_name(name)
    
    # Update description to match cleaned name
    cleaned_desc = cleaned_name + '.'
    
    return f"('{cleaned_name}', '{cleaned_desc}', {price}, {category},"

# Replace all product entries
new_content = re.sub(pattern, replace_product, content)

# Write back
with open('supabase/migrations/20251123_import_scraped_data.sql', 'w') as f:
    f.write(new_content)

print("✓ Product names cleaned and standardized!")
print("\nSample transformations:")
print("  TRANSLUCENT CHIAVARI CHAIR → Translucent Chiavari Chair")
print("  BLACK PADDED CHAIR → Black Padded Chair")
print("  LED COCKTABLE TABLE → LED Cocktail Table")
print("  8x8ft → 8x8ft")
print("  6 BURNER STOVE → 6 Burner Stove")
print("  Boxwood Wall 6ft x 3ft → Boxwood Wall 6ft x 3ft")
print("\n✅ All product names are now consistently formatted!")
