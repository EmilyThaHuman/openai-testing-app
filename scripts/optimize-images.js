const sharp = require('sharp')
const glob = require('glob')
const path = require('path')

async function optimizeImages() {
  const images = glob.sync('public/images/**/*.{png,jpg,jpeg}')
  
  for (const image of images) {
    const webpPath = image.replace(/\.(png|jpg|jpeg)$/, '.webp')
    
    await sharp(image)
      .webp({ quality: 80 })
      .toFile(webpPath)
      
    console.log(`Optimized: ${path.basename(image)} -> ${path.basename(webpPath)}`)
  }
}

optimizeImages().catch(console.error) 