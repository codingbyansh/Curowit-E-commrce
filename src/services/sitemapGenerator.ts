import { PRODUCTS, CREATORS, WORKSHOPS, STORIES, CATEGORIES, Product, Creator, Workshop, Story } from '../data/mockData';

export type SitemapUrlType = 'core' | 'product' | 'workshop' | 'creator' | 'story' | 'category';

export interface SitemapImage {
  loc: string;
  title?: string;
  caption?: string;
}

export interface SitemapUrlEntry {
  loc: string;
  path: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  type: SitemapUrlType;
  title: string;
  subtitle?: string;
  images?: SitemapImage[];
}

export interface SitemapStats {
  totalUrls: number;
  productsCount: number;
  workshopsCount: number;
  creatorsCount: number;
  storiesCount: number;
  categoriesCount: number;
  coreCount: number;
  imagesCount: number;
  averagePriority: number;
  lastGenerated: string;
}

/**
 * Resolves the active base URL from environment or client window
 */
export function resolveBaseUrl(customBaseUrl?: string): string {
  if (customBaseUrl && customBaseUrl.trim()) {
    return customBaseUrl.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }
  return 'https://curowit.in';
}

/**
 * Escapes XML special characters for safe sitemap generation
 */
function escapeXml(unsafe: string): string {
  return (unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Builds the complete list of sitemap URL entries mapped across
 * products, workshops, creators, stories, and core storefront pages.
 */
export function generateSitemapEntries(options?: {
  baseUrl?: string;
  products?: Product[];
  workshops?: Workshop[];
  creators?: Creator[];
  stories?: Story[];
}): SitemapUrlEntry[] {
  const base = resolveBaseUrl(options?.baseUrl);
  const products = options?.products || PRODUCTS;
  const workshops = options?.workshops || WORKSHOPS;
  const creators = options?.creators || CREATORS;
  const stories = options?.stories || STORIES;

  const today = new Date().toISOString().split('T')[0];
  const entries: SitemapUrlEntry[] = [];

  // 1. CORE DISCOVERY PAGES
  entries.push({
    loc: `${base}/`,
    path: '/',
    lastmod: today,
    changefreq: 'daily',
    priority: 1.0,
    type: 'core',
    title: 'Curowit — Home of Creatives | Handmade Artisan Marketplace',
    subtitle: 'Storefront Homepage',
  });

  entries.push({
    loc: `${base}/?view=shop`,
    path: '/?view=shop',
    lastmod: today,
    changefreq: 'daily',
    priority: 0.9,
    type: 'core',
    title: 'All Handmade Products & Artisan Catalog',
    subtitle: 'Catalog Directory',
  });

  entries.push({
    loc: `${base}/?view=creators`,
    path: '/?view=creators',
    lastmod: today,
    changefreq: 'weekly',
    priority: 0.9,
    type: 'core',
    title: 'Meet Independent Creators & Verified Ateliers',
    subtitle: 'Makers Directory',
  });

  entries.push({
    loc: `${base}/?view=workshops`,
    path: '/?view=workshops',
    lastmod: today,
    changefreq: 'weekly',
    priority: 0.9,
    type: 'core',
    title: 'Live & Studio Craft Workshops',
    subtitle: 'Workshops Directory',
  });

  entries.push({
    loc: `${base}/?view=stories`,
    path: '/?view=stories',
    lastmod: today,
    changefreq: 'weekly',
    priority: 0.8,
    type: 'core',
    title: 'Editorial Stories & Maker Journals',
    subtitle: 'Studio Journal',
  });

  entries.push({
    loc: `${base}/foundingcreator`,
    path: '/foundingcreator',
    lastmod: today,
    changefreq: 'weekly',
    priority: 0.85,
    type: 'core',
    title: 'Founding Creator Program — 70% Revenue Share',
    subtitle: 'Creator Application & Onboarding',
  });

  entries.push({
    loc: `${base}/track`,
    path: '/track',
    lastmod: today,
    changefreq: 'monthly',
    priority: 0.6,
    type: 'core',
    title: 'Live Order Courier & Milestone Tracking',
    subtitle: 'Order Tracking',
  });

  // 2. SHOP CATEGORIES
  CATEGORIES.forEach((cat) => {
    entries.push({
      loc: `${base}/?category=${encodeURIComponent(cat.id)}`,
      path: `/?category=${cat.id}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.85,
      type: 'category',
      title: `${cat.name} — Handcrafted slow-made creations`,
      subtitle: `${cat.itemCount} curated pieces`,
    });
  });

  // 3. SHOP PRODUCTS (AUTOMATIC MAPPING WITH GOOGLE IMAGE SITEMAP EXTENSIONS)
  products.forEach((prod) => {
    const images: SitemapImage[] = [];
    if (prod.image) {
      const fullImg = prod.image.startsWith('http') ? prod.image : `${base}${prod.image.startsWith('/') ? '' : '/'}${prod.image}`;
      images.push({
        loc: fullImg,
        title: prod.name,
        caption: `${prod.name} by ${prod.creatorName} — Handcrafted on Curowit`,
      });
    }

    if (Array.isArray(prod.gallery)) {
      prod.gallery.forEach((gImg, idx) => {
        if (gImg && gImg !== prod.image) {
          const fullGImg = gImg.startsWith('http') ? gImg : `${base}${gImg.startsWith('/') ? '' : '/'}${gImg}`;
          images.push({
            loc: fullGImg,
            title: `${prod.name} (View ${idx + 1})`,
            caption: `Slow-crafted ${prod.category} piece`,
          });
        }
      });
    }

    const isHighPriority = Boolean(prod.featured || prod.trending || prod.rating >= 4.8);

    entries.push({
      loc: `${base}/?product=${encodeURIComponent(prod.id)}`,
      path: `/?product=${prod.id}`,
      lastmod: today,
      changefreq: 'daily',
      priority: isHighPriority ? 0.95 : 0.85,
      type: 'product',
      title: prod.name,
      subtitle: `₹${prod.price.toLocaleString('en-IN')} · ${prod.creatorName} (${prod.category})`,
      images,
    });
  });

  // 4. WORKSHOP PAGES (AUTOMATIC MAPPING)
  workshops.forEach((ws) => {
    const images: SitemapImage[] = [];
    if (ws.image) {
      const fullImg = ws.image.startsWith('http') ? ws.image : `${base}${ws.image.startsWith('/') ? '' : '/'}${ws.image}`;
      images.push({
        loc: fullImg,
        title: ws.title,
        caption: `${ws.title} with ${ws.creatorName} (${ws.format})`,
      });
    }

    entries.push({
      loc: `${base}/?workshop=${encodeURIComponent(ws.id)}`,
      path: `/?workshop=${ws.id}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.8,
      type: 'workshop',
      title: ws.title,
      subtitle: `${ws.date} · ${ws.creatorName} (${ws.format})`,
      images,
    });
  });

  // 5. CREATOR PROFILES (AUTOMATIC MAPPING)
  creators.forEach((cr) => {
    const images: SitemapImage[] = [];
    if (cr.avatar) {
      const fullAvatar = cr.avatar.startsWith('http') ? cr.avatar : `${base}${cr.avatar.startsWith('/') ? '' : '/'}${cr.avatar}`;
      images.push({
        loc: fullAvatar,
        title: `${cr.name} Atelier Avatar`,
        caption: `${cr.name} · ${cr.specialty} based in ${cr.location}`,
      });
    }

    entries.push({
      loc: `${base}/?creator=${encodeURIComponent(cr.id)}`,
      path: `/?creator=${cr.id}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.85,
      type: 'creator',
      title: `${cr.name} — ${cr.specialty}`,
      subtitle: `${cr.location} · ${cr.salesCount}+ pieces crafted`,
      images,
    });
  });

  // 6. EDITORIAL STORIES (AUTOMATIC MAPPING)
  stories.forEach((st) => {
    const images: SitemapImage[] = [];
    if (st.image) {
      const fullImg = st.image.startsWith('http') ? st.image : `${base}${st.image.startsWith('/') ? '' : '/'}${st.image}`;
      images.push({
        loc: fullImg,
        title: st.title,
        caption: `By ${st.author} · ${st.tag}`,
      });
    }

    entries.push({
      loc: `${base}/?story=${encodeURIComponent(st.id)}`,
      path: `/?story=${st.id}`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.75,
      type: 'story',
      title: st.title,
      subtitle: `${st.author} · ${st.readTime} read`,
      images,
    });
  });

  return entries;
}

/**
 * Builds the standard XML string adhering to sitemaps.org and Google Image Sitemap specifications
 */
export function buildSitemapXml(entries: SitemapUrlEntry[]): string {
  const lines: string[] = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push(
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml">'
  );

  entries.forEach((entry) => {
    lines.push('  <url>');
    lines.push(`    <loc>${escapeXml(entry.loc)}</loc>`);
    lines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
    lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
    lines.push(`    <priority>${entry.priority.toFixed(2)}</priority>`);

    if (entry.images && entry.images.length > 0) {
      entry.images.forEach((img) => {
        lines.push('    <image:image>');
        lines.push(`      <image:loc>${escapeXml(img.loc)}</image:loc>`);
        if (img.title) {
          lines.push(`      <image:title>${escapeXml(img.title)}</image:title>`);
        }
        if (img.caption) {
          lines.push(`      <image:caption>${escapeXml(img.caption)}</image:caption>`);
        }
        lines.push('    </image:image>');
      });
    }

    lines.push('  </url>');
  });

  lines.push('</urlset>');
  return lines.join('\n');
}

/**
 * Computes analytics and index counts for the generated sitemap
 */
export function getSitemapStats(entries: SitemapUrlEntry[]): SitemapStats {
  let productsCount = 0;
  let workshopsCount = 0;
  let creatorsCount = 0;
  let storiesCount = 0;
  let categoriesCount = 0;
  let coreCount = 0;
  let imagesCount = 0;
  let totalPriority = 0;

  entries.forEach((e) => {
    totalPriority += e.priority;
    if (e.images) imagesCount += e.images.length;
    switch (e.type) {
      case 'product':
        productsCount++;
        break;
      case 'workshop':
        workshopsCount++;
        break;
      case 'creator':
        creatorsCount++;
        break;
      case 'story':
        storiesCount++;
        break;
      case 'category':
        categoriesCount++;
        break;
      case 'core':
        coreCount++;
        break;
    }
  });

  return {
    totalUrls: entries.length,
    productsCount,
    workshopsCount,
    creatorsCount,
    storiesCount,
    categoriesCount,
    coreCount,
    imagesCount,
    averagePriority: entries.length ? Number((totalPriority / entries.length).toFixed(2)) : 0.8,
    lastGenerated: new Date().toISOString(),
  };
}

/**
 * Downloads the sitemap.xml file directly in the browser
 */
export function downloadSitemapFile(xmlContent: string, fileName = 'sitemap.xml'): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Copies the sitemap XML string to the user clipboard
 */
export async function copySitemapXmlToClipboard(xmlContent: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return false;
  try {
    await navigator.clipboard.writeText(xmlContent);
    return true;
  } catch (err) {
    console.warn('Clipboard write error:', err);
    return false;
  }
}

export const sitemapGenerator = {
  generateEntries: generateSitemapEntries,
  buildXml: buildSitemapXml,
  getStats: getSitemapStats,
  download: downloadSitemapFile,
  copyToClipboard: copySitemapXmlToClipboard,
  resolveBaseUrl,
};
