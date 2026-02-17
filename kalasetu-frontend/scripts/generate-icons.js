/* eslint-env node */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Paths
const inputLogo = path.join(__dirname, '..', 'kalasetu logo.png');
const outputDir = path.join(__dirname, '..', 'public', 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('✅ Created icons directory');
}

// Check if logo exists
if (!fs.existsSync(inputLogo)) {
  console.error('❌ Error: kalasetu logo.png not found in kalasetu-frontend/');
  console.error('   Please place your 512x512 logo in: kalasetu-frontend/kalasetu logo.png');
  process.exit(1);
}

// Generate all icon sizes
async function generateIcons() {
  console.log('🎨 Generating PWA icons from kalasetu logo.png...\n');

  for (const size of sizes) {
    try {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      
      await sharp(inputLogo)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Error generating ${size}x${size}:`, error.message);
    }
  }

  console.log('\n✨ All icons generated successfully!');
  console.log(`📁 Icons saved to: ${outputDir}`);
}

generateIcons().catch(console.error);
