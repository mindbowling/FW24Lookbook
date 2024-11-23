'use client'
import { useState, useEffect, useCallback } from 'react'
import { Slider } from "@/components/ui/slider"
import { SkipBack, SkipForward, Play, Pause } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from 'next/image'

export default function Component() {
  const [photoCollections, setPhotoCollections] = useState([])
  const [currentCollectionIndex, setCurrentCollectionIndex] = useState(0)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [slideshowSpeed, setSlideshowSpeed] = useState(50) // Default speed (1-100)

  useEffect(() => {
    fetch('/api/photo-collections')
      .then(response => response.json())
      .then(data => setPhotoCollections(data))

    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)

    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 6000)

    return () => {
      window.removeEventListener('resize', checkMobile)
      clearTimeout(timer)
    }
  }, [])

  const nextPhoto = useCallback(() => {
    setCurrentPhotoIndex((prevIndex) => 
      (prevIndex + 1) % photoCollections[currentCollectionIndex].photos.length
    )
  }, [currentCollectionIndex, photoCollections])

  const prevPhoto = useCallback(() => {
    setCurrentPhotoIndex((prevIndex) => 
      (prevIndex - 1 + photoCollections[currentCollectionIndex].photos.length) % photoCollections[currentCollectionIndex].photos.length
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
    let slideshowInterval
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

  if (photoCollections.length === 0) {
    return <div>Loading...</div>
  }

  const currentCollection = photoCollections[currentCollectionIndex]
  const currentPhoto = currentCollection.photos[currentPhotoIndex]

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-background z-50"
          >
            <motion.div
              className="relative w-32 h-32 mb-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              <Image
                src="/images/logo.png"
                alt="FW24 LOOKBOOK"
                layout="fill"
                objectFit="contain"
              />
            </motion.div>
            <motion.h1
              className="text-2xl font-bold"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            >
              FW24 LOOKBOOK
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className={`bg-background shadow-xl rounded-lg overflow-hidden ${isMobile ? 'w-full' : 'w-full max-w-sm'}`}
      >
        <div className="relative pb-[150%]"> {/* 2:3 aspect ratio */}
          <img
            src={currentPhoto}
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