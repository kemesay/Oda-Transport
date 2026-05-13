/**
 * Script to update sitemap.xml with current date
 * Run this script after deploying updates: node scripts/update-sitemap.js
 */

const fs = require('fs');
const path = require('path');

const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

try {
  // Read the sitemap file
  let sitemap = fs.readFileSync(sitemapPath, 'utf8');
  
  // Replace all lastmod dates with current date
  sitemap = sitemap.replace(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g, `<lastmod>${currentDate}</lastmod>`);
  
  // Write back to file
  fs.writeFileSync(sitemapPath, sitemap, 'utf8');
  
  console.log('✅ Sitemap updated successfully!');
  console.log(`📅 All lastmod dates set to: ${currentDate}`);
  console.log(`📁 File location: ${sitemapPath}`);
} catch (error) {
  console.error('❌ Error updating sitemap:', error.message);
  process.exit(1);
}
