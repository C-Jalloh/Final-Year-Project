"use client"

import React, { useState, useCallback, useMemo } from 'react'
import Cropper from 'react-easy-crop'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'

// Debounce utility for performance
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(null, args), wait)
  }
}

interface ImageCropModalProps {
  isOpen: boolean
  onClose: () => void
  imageSrc: string | null
  onCropComplete: (croppedImage: string) => void
}

export function ImageCropModal({ isOpen, onClose, imageSrc, onCropComplete }: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)

  // Memoize expensive crop operations
  const debouncedOnCropComplete = useMemo(
    () => debounce((croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels)
    }, 100),
    []
  )

  const onCropCompleteInternal = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    debouncedOnCropComplete(croppedArea, croppedAreaPixels)
  }, [debouncedOnCropComplete])

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (error) => reject(error))
      image.setAttribute('crossOrigin', 'anonymous')
      image.src = url
    })

  const getCroppedImg = useCallback(async (
    imageSrc: string,
    pixelCrop: any,
    rotation = 0
  ): Promise<string> => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      return ''
    }

    const maxSize = Math.max(image.width, image.height)
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

    canvas.width = safeArea
    canvas.height = safeArea

    ctx.translate(safeArea / 2, safeArea / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.translate(-safeArea / 2, -safeArea / 2)

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    )

    const data = ctx.getImageData(0, 0, safeArea, safeArea)

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    )

    return new Promise((resolve) => {
      canvas.toBlob((file) => {
        if (file) {
          resolve(URL.createObjectURL(file))
        } else {
          resolve('')
        }
      }, 'image/jpeg')
    })
  }, [])

  const handleCropConfirm = async () => {
    if (imageSrc && croppedAreaPixels) {
      try {
        const croppedImageUrl = await getCroppedImg(imageSrc, croppedAreaPixels)
        onCropComplete(croppedImageUrl)
        handleClose()
      } catch (error) {
        console.error('Error cropping image:', error)
      }
    }
  }

  const handleClose = () => {
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crop Your Profile Picture</DialogTitle>
          <DialogDescription>
            Adjust the crop area to fit your profile picture perfectly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative h-64 w-full bg-gray-100 rounded-lg overflow-hidden">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropCompleteInternal}
                cropShape="round"
                showGrid={false}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="zoom">Zoom: {zoom.toFixed(1)}x</Label>
            <Slider
              id="zoom"
              min={1}
              max={3}
              step={0.1}
              value={[zoom]}
              onValueChange={(value) => setZoom(value[0])}
              className="w-full"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleCropConfirm}>
              Apply Crop
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
