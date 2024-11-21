import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Sample code files
const sampleFiles = {
  'example-react-component.jsx': `
import React, { useState } from 'react'
import { Button } from './ui/button'

export function ExampleComponent() {
  const [count, setCount] = useState(0)
  
  return (
    <div className="p-4">
      <h1>Count: {count}</h1>
      <Button onClick={() => setCount(prev => prev + 1)}>
        Increment
      </Button>
    </div>
  )
}
`,

  'api-example.js': `
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data')
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching data:', error)
    throw error
  }
}
`,

  'readme.md': `
# Project Documentation

This is an example project showcasing various features:
- React components
- API integration
- Error handling
- Documentation
`,

  'config.json': `
{
  "apiVersion": "v1",
  "environment": "development",
  "features": {
    "darkMode": true,
    "analytics": false,
    "notifications": true
  }
}
`,

  'code-snippet-1.js': `
function calculateTotal(items) {
  return items.reduce((total, item) => total + item.price, 0)
}

const cart = [
  { id: 1, name: 'Item 1', price: 10 },
  { id: 2, name: 'Item 2', price: 20 }
]

console.log('Total:', calculateTotal(cart))
`,

  'api-response.json': `
{
  "status": "success",
  "data": {
    "users": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      },
      {
        "id": 2,
        "name": "Jane Smith",
        "email": "jane@example.com"
      }
    ]
  }
}
`,

  'error-log.txt': `
[2024-03-21 10:15:30] ERROR: Failed to connect to database
[2024-03-21 10:15:31] INFO: Retrying connection...
[2024-03-21 10:15:32] SUCCESS: Database connection established
`
}

// Create directories
const directories = [
  'public/storage/avatars',
  'public/storage/workspace-files',
  'public/storage/chat-attachments'
]

directories.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir)
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true })
  }
})

// Generate default avatars
const avatarColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
const avatarSizes = [128, 128]

avatarColors.forEach((color, index) => {
  const svg = `
<svg width="${avatarSizes[0]}" height="${avatarSizes[1]}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${color}"/>
  <text x="50%" y="50%" font-family="Arial" font-size="64" fill="white" text-anchor="middle" dominant-baseline="middle">
    U${index + 1}
  </text>
</svg>
`
  fs.writeFileSync(
    path.join(process.cwd(), 'public/storage/avatars', `default-avatar-${index + 1}.png`),
    Buffer.from(svg)
  )
})

// Write sample files
Object.entries(sampleFiles).forEach(([filename, content]) => {
  const directory = filename.endsWith('.js') || filename.endsWith('.jsx')
    ? 'workspace-files'
    : filename.includes('api') || filename.includes('error')
    ? 'chat-attachments'
    : 'workspace-files'

  fs.writeFileSync(
    path.join(process.cwd(), 'public/storage', directory, filename),
    content.trim()
  )
})

console.log('Storage assets generated successfully!') 