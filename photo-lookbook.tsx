import { useState, useEffect, useCallback } from 'react'
import { Slider } from "@/components/ui/slider"
import { SkipBack, SkipForward, Play, Pause } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import Image from 'next/image'

// Define interfaces for our data structures
interface Photo {
  url: string;
}

interface PhotoCollection {
  name: string;
  photos: Photo[];
}

export default function Component() {
  const [photoCollections, setPhotoCollections] = useState<PhotoCollection[]>([])
  const [currentCollectionIndex, setCurrentCollectionIndex] = useState(0)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [slideshowSpeed, setSlideshowSpeed] = useState(50) // Default speed (1-100)

  useEffect(() => {
    fetch('/api/photo-collections')
      .then(response => response.json())
      .then((data: PhotoCollection[]) => {
        setPhotoCollections(data)
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Failed to fetch photo collections:', error)
        setIsLoading(false)
      })

    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  const nextPhoto = useCallback(() => {
    setCurrentPhotoIndex((prevIndex) => 
      (prevIndex + 1) % (photoCollections[currentCollectionIndex]?.photos.length || 1)
    )
  }, [currentCollectionIndex, photoCollections])

  const prevPhoto = useCallback(() => {
    setCurrentPhotoIndex((prevIndex) => 
      (prevIndex - 1 + (photoCollections[currentCollectionIndex]?.photos.length || 1)) % (photoCollections[currentCollectionIndex]?.photos.length || 1)
    )
  }, [currentCollectionIndex, photoCollections])

  const nextCollection = useCallback(() => {
    setCurrentCollectionIndex((prevIndex) => 
      (prevIndex + 1) % photoCollections.length
    )
    setCurrentPhotoIndex(0)
  }, [photoCollections])

  const prevCollection = useCallback(() => {
    setCurrentCollectionIndex((prevIndex) => 
      (prevIndex - 1 + photoCollections.length) % photoCollections.length
    )
    setCurrentPhotoIndex(0)
  }, [photoCollections])

  useEffect(() => {
    let slideshowInterval: NodeJS.Timeout
    if (isPlaying) {
      slideshowInterval = setInterval(() => {
        nextPhoto()
      }, 5000 - (slideshowSpeed * 45))
    }
    return () => clearInterval(slideshowInterval)
  }, [isPlaying, slideshowSpeed, nextPhoto])

  const toggleSlideshow = () => {
    setIsPlaying(!isPlaying)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p>Loading...</p>
      </div>
    )
  }

  if (photoCollections.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p>No photo collections found.</p>
      </div>
    )
  }

  const currentCollection = photoCollections[currentCollectionIndex]
  const currentPhoto = currentCollection.photos[currentPhotoIndex]

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className={`bg-background shadow-xl rounded-lg overflow-hidden ${isMobile ? 'w-full' : 'w-full max-w-sm'}`}
      >
        <div className="relative pb-[150%]"> {/* 2:3 aspect ratio */}
          <img
            src={currentPhoto.url}
            alt={`Photo from ${currentCollection.name}`}
            className="absolute top-0 left-0 w-full h-full object-contain"
          />
          <button 
            className="absolute left-0 top-0 bottom-0 w-1/2 opacity-0 hover:opacity-50 bg-black transition-opacity"
            onClick={prevPhoto}
          >
            <span className="sr-only">Previous photo</span>
          </button>
          <button 
            className="absolute right-0 top-0 bottom-0 w-1/2 opacity-0 hover:opacity-50 bg-black transition-opacity"
            onClick={nextPhoto}
          >
            <span className="sr-only">Next photo</span>
          </button>
        </div>
        <div className="p-3">
          <h2 className="text-lg font-bold mb-1 truncate">{currentCollection.name}</h2>
          <p className="text-xs text-muted-foreground mb-2">
            Photo {currentPhotoIndex + 1} of {currentCollection.photos.length}
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">
                {currentPhotoIndex + 1}
              </span>
              <Slider 
                value={[currentPhotoIndex]} 
                max={currentCollection.photos.length - 1} 
                step={1} 
                className="w-[70%]"
                onValueChange={(value) => setCurrentPhotoIndex(value[0])}
              />
              <span className="text-xs font-medium">
                {currentCollection.photos.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <button 
                className="text-xl text-muted-foreground hover:text-foreground transition-colors"
                onClick={prevCollection}
              >
                <SkipBack size={20} />
              </button>
              <button 
                className="bg-primary text-primary-foreground rounded-full p-1.5 hover:bg-primary/90 transition-colors"
                onClick={toggleSlideshow}
                aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button 
                className="text-xl text-muted-foreground hover:text-foreground transition-colors"
                onClick={nextCollection}
              >
                <SkipForward size={20} />
              </button>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-muted-foreground mr-2">Speed</span>
              <Slider 
                value={[slideshowSpeed]} 
                max={100} 
                step={1} 
                className="flex-grow"
                onValueChange={(value) => setSlideshowSpeed(value[0])}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}