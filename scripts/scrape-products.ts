
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
    { name: 'Chairs', slug: 'chairs' },
    { name: 'Sofas & Loveseats', slug: 'sofas-loveseats' },
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
    { name: 'Flowers & Centerpieces', slug: 'centerpeices-2' },
    { name: 'Table Linens', slug: 'table-linens' },
    { name: 'Napkins & Rings', slug: 'table-napkins-and-rings' },
    { name: 'Tables', slug: 'dining-tables' },
    { name: 'Tents', slug: 'tent' },
    { name: 'Buffet Service', slug: 'buffet-service' },
    { name: 'Glassware', slug: 'glasswear' },
    { name: 'Chargers', slug: 'chargers' },
    { name: 'Table Settings', slug: 'table-settings' },
];

interface Product {
    name: string;
    price: number; // in cents
    description: string;
    imageUrl: string | null;
    productUrl: string;
    categoryId: string; // slug
    localImagePath?: string;
}

async function fetchSitemapData(): Promise<{ url: string; imageUrl: string | null }[]> {
    console.log('Fetching sitemap...');
    const response = await fetch(SITEMAP_URL);
    const text = await response.text();
    const products: { url: string; imageUrl: string | null }[] = [];

    const urlRegex = /<url>(.*?)<\/url>/gs;
    let match;

    while ((match = urlRegex.exec(text)) !== null) {
        const content = match[1];
        const locMatch = content.match(/<loc>(.*?)<\/loc>/);
        const imgMatch = content.match(/<image:loc>(.*?)<\/image:loc>/);

        if (locMatch) {
            products.push({
                url: locMatch[1].trim(),
                imageUrl: imgMatch ? imgMatch[1].trim() : null
            });
        }
    }
    console.log(`Found ${products.length} products in sitemap.`);
    return products;
}

async function downloadImage(url: string, filename: string): Promise<string | null> {
    try {
        const destPath = path.join(IMAGE_DIR, filename);
        if (fs.existsSync(destPath)) {
            return `/images/products/${filename}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);

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

async function scrapeCategory(category: { name: string; slug: string }): Promise<Product[]> {
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
        const productsMap = new Map<string, Product>();

        const productLinks = $('a[href*="/product-page/"]');

        productLinks.each((_, element) => {
            const href = $(element).attr('href');
            if (!href) return;

            const fullUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;

            let name = '';
            let price = 0;

            const text = $(element).text().trim();
            // Wix often has "Price$123.00" or just "$123.00"
            const priceMatch = text.match(/Price\$([\d,]+\.?\d*)/) || text.match(/\$([\d,]+\.?\d*)/);

            if (priceMatch) {
                const priceStr = priceMatch[1].replace(/,/g, '');
                price = Math.round(parseFloat(priceStr) * 100);

                const splitIndex = text.indexOf(priceMatch[0]) || text.indexOf('Price') || text.indexOf('$');
                if (splitIndex > 0) {
                    name = text.substring(0, splitIndex).trim();
                }
            }

            if (!name) {
                name = $(element).find('h3').text().trim() || $(element).parent().find('h3').text().trim();
            }

            if (!name && text.length > 0 && !text.includes('Quick View')) {
                name = text.replace(/Price$/, '').trim();
            }

            if (name && name !== 'Quick View') {
                name = name.replace(/(Price|Regular|Sale)$/i, '').trim();
                const existing = productsMap.get(fullUrl);
                if (existing) {
                    if (price > 0 && existing.price === 0) {
                        existing.price = price;
                    }
                    if (name && (!existing.name || existing.name.length < name.length)) {
                        existing.name = name;
                    }
                } else {
                    productsMap.set(fullUrl, {
                        name,
                        price,
                        description: `${name}.`,
                        imageUrl: null,
                        productUrl: fullUrl,
                        categoryId: category.slug
                    });
                }
            }
        });

        const products = Array.from(productsMap.values());
        console.log(`Found ${products.length} products in ${category.name}`);
        return products;

    } catch (error) {
        console.error(`Error scraping ${category.name}:`, error);
        return [];
    }
}

async function scrapeProductPage(url: string): Promise<{ name: string; price: number; description: string } | null> {
    console.log(`Scraping product page: ${url}`);
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const html = await response.text();
        const $ = cheerio.load(html);

        // Wix product pages
        let name = $('h1').text().trim() || $('[data-hook="product-title"]').text().trim();
        if (name) {
            name = name.replace(/(Price|Regular|Sale)$/i, '').trim();
        }

        // Try specific Wix price hooks first
        let priceText = $('[data-hook="formatted-primary-price"]').text().trim();
        if (!priceText) {
            priceText = $('[data-hook="formatted-secondary-price"]').text().trim();
        }
        if (!priceText) {
            priceText = $('span:contains("$")').first().text().trim();
        }

        const priceMatch = priceText.match(/\$([\d,]+\.?\d*)/);
        let price = 0;
        if (priceMatch) {
            price = Math.round(parseFloat(priceMatch[1].replace(/,/g, '')) * 100);
        }

        const description = $('pre[data-hook="description"]').text().trim() ||
            $('[data-hook="product-description"]').text().trim() ||
            `${name}.`;

        return { name, price, description };
    } catch (error) {
        console.error(`Error scraping product page ${url}:`, error);
        return null;
    }
}

async function generateSql() {
    const sitemapProducts = await fetchSitemapData();
    const imageMap = new Map(sitemapProducts.map(p => [p.url, p.imageUrl]));

    let allProducts: Product[] = [];
    const scrapedUrls = new Set<string>();

    for (const category of CATEGORIES) {
        const products = await scrapeCategory(category);
        for (const p of products) {
            p.imageUrl = imageMap.get(p.productUrl) || null;
            allProducts.push(p);
            scrapedUrls.add(p.productUrl);
        }
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Find missing products
    const missingUrls = sitemapProducts.filter(p => !scrapedUrls.has(p.url));
    console.log(`Found ${missingUrls.length} missing products in sitemap.`);

    for (const item of missingUrls) {
        const details = await scrapeProductPage(item.url);
        if (details && details.name) {
            allProducts.push({
                ...details,
                imageUrl: item.imageUrl,
                productUrl: item.url,
                categoryId: 'misc'
            });
        }
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Ensure all products have prices
    const productsWithoutPrice = allProducts.filter(p => p.price === 0);
    if (productsWithoutPrice.length > 0) {
        console.log(`Found ${productsWithoutPrice.length} products without price. Scraping individual pages...`);
        for (const p of productsWithoutPrice) {
            const details = await scrapeProductPage(p.productUrl);
            if (details) {
                p.price = details.price;
                if (details.name) p.name = details.name;
                if (details.description) p.description = details.description;
            }
            await new Promise(resolve => setTimeout(resolve, 300));
        }
    }

    console.log(`Total products to process: ${allProducts.length}`);

    // Download images
    for (const product of allProducts) {
        if (product.imageUrl) {
            const filename = sanitizeFilename(product.name);
            const localPath = await downloadImage(product.imageUrl, filename);
            if (localPath) {
                product.localImagePath = localPath;
            }
        }
    }

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

    const categoriesToProcess = [...CATEGORIES];
    if (!categoriesToProcess.find(c => c.slug === 'misc')) {
        categoriesToProcess.push({ name: 'Misc', slug: 'misc' });
    }

    for (const cat of categoriesToProcess) {
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
