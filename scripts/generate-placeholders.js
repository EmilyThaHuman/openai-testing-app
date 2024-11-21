const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const COLORS = {
  primary: '#0099ff',
  secondary: '#66c2ff',
  background: '#ffffff'
}

async function generatePlaceholder(width, height, text, outputPath) {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${COLORS.background}"/>
      <rect width="100%" height="100%" fill="${COLORS.primary}" opacity="0.1"/>
      <text 
        x="50%" 
        y="50%" 
        font-family="Arial" 
        font-size="24" 
        fill="${COLORS.primary}"
        text-anchor="middle" 
        dominant-baseline="middle"
      >
        ${text}
      </text>
    </svg>
  `

  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath)
}

async function generateAssets() {
  // Generate logos
  await generatePlaceholder(180, 40, 'ReedAI Light', 'public/images/logo/light.png')
  await generatePlaceholder(180, 40, 'ReedAI Dark', 'public/images/logo/dark.png')

  // Generate icons
  await generatePlaceholder(32, 32, 'R', 'public/images/icons/favicon.png')
  await generatePlaceholder(180, 180, 'R', 'public/images/icons/apple-touch-icon.png')
  await generatePlaceholder(512, 512, 'R', 'public/images/icons/app-icon.png')

  // Generate feature images
  const features = ['open-canvas', 'chat-interface', 'code-editor', 'api-testing']
  for (const feature of features) {
    await generatePlaceholder(
      800, 
      450, 
      feature.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      `public/images/features/${feature}.png`
    )
  }

  // Generate API documentation images
  const apis = ['chat', 'assistants', 'images', 'audio']
  for (const api of apis) {
    const apiDir = `public/images/api/${api}`
    if (!fs.existsSync(apiDir)) {
      fs.mkdirSync(apiDir, { recursive: true })
    }
    
    const actions = ['create', 'stream', 'functions']
    for (const action of actions) {
      await generatePlaceholder(
        800,
        450,
        `${api} ${action}`,
        path.join(apiDir, `${action}.png`)
      )
    }
  }

  // Generate screenshots
  const screens = ['dashboard', 'settings', 'profile', 'canvas']
  for (const screen of screens) {
    await generatePlaceholder(
      1200,
      675,
      screen.charAt(0).toUpperCase() + screen.slice(1),
      `public/images/screenshots/${screen}.png`
    )
  }
}

generateAssets().catch(console.error) 