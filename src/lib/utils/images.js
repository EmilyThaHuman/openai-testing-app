import { IMAGE_MANIFEST } from '@/lib/constants/image-manifest'

export function getImagePath(path) {
  return path.startsWith('/') ? path : `/${path}`
}

export function getImageUrl(key) {
  const parts = key.split('.')
  let current = IMAGE_MANIFEST
  
  for (const part of parts) {
    if (!current[part]) {
      throw new Error(`Image path not found: ${key}`)
    }
    current = current[part]
  }
  
  return getImagePath(current)
}

export function getDocImage(category, name) {
  return getImageUrl(`docs.${category}.${name}`)
}

export function getFeatureImage(name) {
  return getImageUrl(`features.${name}`)
}

export function getApiImage(category, name) {
  return getImageUrl(`api.${category}.${name}`)
}

export function getScreenshot(name) {
  return getImageUrl(`screenshots.${name}`)
} 