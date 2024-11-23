import { promises as fs } from 'fs'
import path from 'path'

export default async function handler(req, res) {
  try {
    const imagesDirectory = path.join(process.cwd(), 'public/images')
    const orderFilePath = path.join(process.cwd(), 'directory-order.txt')
    
    let orderedDirectories = []
    try {
      const orderFileContent = await fs.readFile(orderFilePath, 'utf8')
      orderedDirectories = orderFileContent.split('\n').map(dir => dir.trim()).filter(Boolean)
    } catch (error) {
      console.warn('Failed to read directory-order.txt. Falling back to alphabetical order.')
    }

    const collections = await getPhotoCollections(imagesDirectory, orderedDirectories)
    res.status(200).json(collections)
  } catch (error) {
    console.error('Error in photo collections API:', error)
    res.status(500).json({ error: 'Failed to fetch photo collections' })
  }
}

async function getPhotoCollections(directory, orderedDirectories) {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  let collections = []

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const collectionPath = path.join(directory, entry.name)
      const photos = await getPhotosInDirectory(collectionPath)
      collections.push({
        name: entry.name,
        photos: photos.map(photo => `/images/${entry.name}/${photo}`)
      })
    }
  }

  // Sort collections based on the order in the text file
  if (orderedDirectories.length > 0) {
    collections.sort((a, b) => {
      const indexA = orderedDirectories.indexOf(a.name)
      const indexB = orderedDirectories.indexOf(b.name)
      if (indexA === -1 && indexB === -1) return 0
      if (indexA === -1) return 1
      if (indexB === -1) return -1
      return indexA - indexB
    })
  }

  return collections
}

async function getPhotosInDirectory(directory) {
  const files = await fs.readdir(directory)
  return files.filter(file => 
    /\.(jpg|jpeg|png|gif)$/i.test(file)
  )
}