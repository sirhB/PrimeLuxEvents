import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';

const BASE_URL = 'https://www.primeluxevents.com';
const SITEMAP_URL = 'https://www.primeluxevents.com/store-products-sitemap.xml';
const IMAGE_DIR = path.join(process.cwd(), 'public', 'images', 'products');

// Ensure image directory exists
if (!fs.existsSync(IMAGE_DIR)) {
    fs.mkdirSync(IMAGE_DIR, { recursive: true });
}

// Category Mapping based on User Image and Sitemap
const CATEGORIES = [
    { name: 'Backdrops & Panels', slug: 'backdrops-panels' },
    { name: 'Flower Walls', slug: 'flower-walls' },
    { name: 'Shimmer Walls', slug: 'shimmer-walls' },
    { name: 'Soft Touch Walls', slug: 'soft-touch-walls' },
    { name: 'Bar Counters', slug: 'bar-counters' },
    { name: 'Bar Stools', slug: 'bar-stools' },
    { name: 'Bar Tables', slug: 'bar-tables' },
    { name: 'Benches & Ottomans', slug: 'benches-ottomans' },
    { name: 'Cake Tables & Stands', slug: 'cake-tables-stands' },
    { name: 'Chafing Dishes', slug: 'chafing-dishes' },
    { name: 'Cooking & Prep', slug: 'cooking-prep' },
    { name: 'Decorations & Props', slug: 'decorations-props' },
    { name: 'Flooring & Staging', slug: 'flooring-staging' },
    { name: 'Chairs', slug: 'chairs' }, // Seating
    { name: 'Sofas & Loveseats', slug: 'sofas-loveseats' }, // Seating
    { name: 'Kids Backdrops', slug: 'kids-backdrops' },
    { name: 'Kids Chairs', slug: 'kids-chairs' },
    { name: 'Kids Tables', slug: 'kids-tables' },
    { name: 'Kids Thrones', slug: 'kids-thrones' },
    { name: 'LED Signs', slug: 'led-signs' },
    { name: 'Lit Letters & Numbers', slug: 'lit-letters-and-numbers' },
    { name: 'Luxury Thrones', slug: 'thrones' },
    { name: 'Misc', slug: 'misc' },
    { name: 'Pedestals & Plinths', slug: 'pedestals-plinths' },
    { name: 'Shelves', slug: 'shelves' },
    { name: 'Sweets Carts', slug: 'sweets-carts' },
    { name: 'Charger Plates', slug: 'charger-plates' },
    { name: 'Dinnerware', slug: 'dinnerware' },
    { name: 'Flowers & Centerpieces', slug: 'centerpeices-2' }, // Deduced from sitemap
    { name: 'Table Linens', slug: 'table-linens' },
    { name: 'Napkins & Rings', slug: 'table-napkins-and-rings' },
    { name: 'Tables', slug: 'dining-tables' }, // Deduced
    { name: 'Tents', slug: 'tent' },
    { name: 'Buffet Service', slug: 'buffet-service' }, // Guessing, might need check
];

interface Product {
    name: string;
    price: number; // in cents
    description: string;
    imageUrl: string | null;
    productUrl: string;
    categoryId: string; // slug for now
    localImagePath?: string;
}

async function fetchSitemapImages(): Promise<Map<string, string>> {
    console.log('Fetching sitemap...');
    const response = await fetch(SITEMAP_URL);
    const text = await response.text();
    const map = new Map<string, string>();

    // Simple regex to parse XML sitemap for <loc> and <image:loc>
    // Structure: <url><loc>URL</loc>...<image:image><image:loc>IMG_URL</image:loc></image:image></url>
    const urlRegex = /<url>(.*?)<\/url>/gs;
    let match;

    while ((match = urlRegex.exec(text)) !== null) {
        const content = match[1];
        const locMatch = content.match(/<loc>(.*?)<\/loc>/);
        const imgMatch = content.match(/<image:loc>(.*?)<\/image:loc>/);

        if (locMatch && imgMatch) {
            map.set(locMatch[1].trim(), imgMatch[1].trim());
        }
    }
    console.log(`Found ${map.size} images in sitemap.`);
    return map;
}

async function downloadImage(url: string, filename: string): Promise<string | null> {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);

        const destPath = path.join(IMAGE_DIR, filename);
        const fileStream = createWriteStream(destPath);

        if (!response.body) throw new Error('No response body');

        // @ts-ignore
        await pipeline(response.body, fileStream);
        return `/images/products/${filename}`;
    } catch (error) {
        console.warn(`Failed to download image ${url}:`, error);
        return null;
    }
}

function sanitizeFilename(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '.jpg';
}

async function scrapeCategory(category: { name: string; slug: string }, imageMap: Map<string, string>): Promise<Product[]> {
    const url = `${BASE_URL}/${category.slug}`;
    console.log(`Scraping category: ${category.name} (${url})`);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`Failed to fetch ${url}: ${response.status}`);
            return [];
        }
        const html = await response.text();
        const $ = cheerio.load(html);
        const products: Product[] = [];

        // Selectors based on Wix stores usually
        // We need to find the product list. Based on the markdown output, it seems to be a list.
        // Wix often uses [data-hook="product-list-grid-item"]

        // Let's try a generic approach finding links that look like products
        // The markdown showed "### PRODUCT NAME" followed by a link "[Quick View](...)" and "[NAMEPrice$XX](...)"

        // In HTML, this is likely an <a> tag wrapping the product info or separate elements.
        // We'll look for elements that contain product info.

        // Strategy: Look for the specific structure found in the markdown dump
        // The markdown implies headers (h3) for product names.
        // Let's try to find the product items container.

        // Since I can't see the exact HTML classes without a browser, I'll try to be flexible.
        // I'll look for links that contain "/product-page/"

        const productLinks = $('a[href*="/product-page/"]');
        const processedUrls = new Set<string>();

        productLinks.each((_, element) => {
            const href = $(element).attr('href');
            if (!href) return;

            const fullUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;
            if (processedUrls.has(fullUrl)) return;

            // Find the container for this product. usually a parent `li` or `div`
            const container = $(element).closest('li') || $(element).closest('div[data-hook="product-item-root"]');

            // If we can't find a structured container, we might parse the text inside the link or siblings.
            // The markdown showed: "[CLEAR ROUND ELEGANCEPrice$7.50]"
            // This suggests the name and price are in the same text block in the HTML.

            let name = '';
            let price = 0;

            // Try to extract from text
            const text = $(element).text().trim(); // e.g. "CLEAR ROUND ELEGANCEPrice$7.50"

            // Regex to split Name and Price
            // Looking for "Price$" or just "$"
            const priceMatch = text.match(/Price\$([\d,]+\.?\d*)/) || text.match(/\$([\d,]+\.?\d*)/);

            if (priceMatch) {
                const priceStr = priceMatch[1].replace(/,/g, '');
                price = Math.round(parseFloat(priceStr) * 100);

                // Name is everything before "Price" or "$"
                const splitIndex = text.indexOf(priceMatch[0]) || text.indexOf('Price') || text.indexOf('$');
                if (splitIndex > 0) {
                    name = text.substring(0, splitIndex).trim();
                }
            }

            // Fallback: Look for specific elements if the text parsing failed or name is empty
            if (!name) {
                // Try finding an h3 or similar inside the container
                name = $(element).find('h3').text().trim() || $(element).parent().find('h3').text().trim();
            }

            // If we still don't have a name, maybe it's just the text
            if (!name && text.length > 0 && !text.includes('Quick View')) {
                name = text;
            }

            if (name && name !== 'Quick View') {
                // Clean up name
                name = name.replace(/Price$/, '').trim();

                const imageUrl = imageMap.get(fullUrl) || null;

                products.push({
                    name,
                    price,
                    description: `${name}.`, // Default description
                    imageUrl,
                    productUrl: fullUrl,
                    categoryId: category.slug
                });
                processedUrls.add(fullUrl);
            }
        });

        console.log(`Found ${products.length} products in ${category.name}`);
        return products;

    } catch (error) {
        console.error(`Error scraping ${category.name}:`, error);
        return [];
    }
}

async function generateSql() {
    const imageMap = await fetchSitemapImages();
    let allProducts: Product[] = [];

    for (const category of CATEGORIES) {
        const products = await scrapeCategory(category, imageMap);

        // Download images for this batch
        for (const product of products) {
            if (product.imageUrl) {
                const filename = sanitizeFilename(product.name);
                const localPath = await downloadImage(product.imageUrl, filename);
                if (localPath) {
                    product.localImagePath = localPath;
                }
            }
        }

        allProducts = allProducts.concat(products);
        // Be nice to the server
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`Total products scraped: ${allProducts.length}`);

    let sql = `-- Seed data generated from PrimeLuxEvents.com\n\n`;

    // 1. Insert Categories
    sql += `-- Categories\n`;
    sql += `DO $$\nDECLARE\n`;
    CATEGORIES.forEach(cat => {
        sql += `  cat_${cat.slug.replace(/-/g, '_')} uuid;\n`;
    });
    sql += `BEGIN\n\n`;

    CATEGORIES.forEach(cat => {
        const varName = `cat_${cat.slug.replace(/-/g, '_')}`;
        sql += `  INSERT INTO categories (name, slug, description, image_url, is_featured)\n`;
        sql += `  VALUES ('${cat.name.replace(/'/g, "''")}', '${cat.slug}', '${cat.name} rental.', 'https://placehold.co/600x400?text=${encodeURIComponent(cat.name)}', false)\n`;
        sql += `  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name\n`;
        sql += `  RETURNING id INTO ${varName};\n\n`;
    });

    // 2. Insert Products
    sql += `  -- Products\n`;

    // Group by category to use the variable
    for (const cat of CATEGORIES) {
        const catProducts = allProducts.filter(p => p.categoryId === cat.slug);
        if (catProducts.length === 0) continue;

        const varName = `cat_${cat.slug.replace(/-/g, '_')}`;
        sql += `  -- ${cat.name}\n`;
        sql += `  INSERT INTO products (name, description, price, category_id, image_url, rental_price_daily, quantity_available, modifiers) VALUES\n`;

        const values = catProducts.map((p, index) => {
            const safeName = p.name.replace(/'/g, "''");
            const safeDesc = p.description.replace(/'/g, "''");
            // Use local image path if available, otherwise fallback to placeholder
            const imageUrl = p.localImagePath ? `'${p.localImagePath}'` : `'https://placehold.co/600x400?text=${encodeURIComponent(p.name)}'`;
            const isLast = index === catProducts.length - 1;
            return `  ('${safeName}', '${safeDesc}', ${p.price}, ${varName}, ${imageUrl}, ${p.price}, 10, '[]'::jsonb)${isLast ? ';' : ','}`;
        }).join('\n');

        sql += values + `\n\n`;
    }

    sql += `END $$;\n`;

    fs.writeFileSync('supabase/migrations/20251123_import_scraped_data_v2.sql', sql);
    console.log('SQL file generated: supabase/migrations/20251123_import_scraped_data_v2.sql');
}

generateSql().catch(console.error);
