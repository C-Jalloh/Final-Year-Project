"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Upload, X, File, Image, FileText } from "lucide-react"

interface FileInputProps {
  value?: File[]
  onChange?: (files: File[]) => void
  accept?: string
  multiple?: boolean
  maxFiles?: number
  maxSize?: number // in bytes
  disabled?: boolean
  className?: string
  placeholder?: string
  showPreview?: boolean
  dragDrop?: boolean
}

const FileInput = React.forwardRef<HTMLDivElement, FileInputProps>(
  ({
    value = [],
    onChange,
    accept,
    multiple = false,
    maxFiles = 5,
    maxSize = 5 * 1024 * 1024, // 5MB default
    disabled = false,
    className,
    placeholder = "Choose files or drag and drop",
    showPreview = true,
    dragDrop = true,
    ...props
  }, ref) => {
    const [isDragOver, setIsDragOver] = React.useState(false)
    const [files, setFiles] = React.useState<File[]>(value)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
      setFiles(value)
    }, [value])

    const validateFile = (file: File): string | null => {
      if (maxSize && file.size > maxSize) {
        return `File size exceeds ${formatFileSize(maxSize)}`
      }
      return null
    }

    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return "0 Bytes"
      const k = 1024
      const sizes = ["Bytes", "KB", "MB", "GB"]
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    const getFileIcon = (file: File) => {
      if (file.type.startsWith("image/")) {
        return <Image className="h-4 w-4" />
      } else if (file.type.includes("pdf") || file.type.includes("document")) {
        return <FileText className="h-4 w-4" />
      }
      return <File className="h-4 w-4" />
    }

    const handleFiles = (fileList: FileList | null) => {
      if (!fileList) return

      const newFiles = Array.from(fileList)
      const validFiles: File[] = []
      const errors: string[] = []

      for (const file of newFiles) {
        const error = validateFile(file)
        if (error) {
          errors.push(`${file.name}: ${error}`)
        } else {
          validFiles.push(file)
        }
      }

      if (errors.length > 0) {
        alert(`Some files were not added:\n${errors.join("\n")}`)
      }

      let updatedFiles = multiple ? [...files, ...validFiles] : validFiles

      // Enforce maxFiles limit
      if (updatedFiles.length > maxFiles) {
        updatedFiles = updatedFiles.slice(0, maxFiles)
      }

      setFiles(updatedFiles)
      onChange?.(updatedFiles)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files)
    }

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      if (dragDrop && !disabled) {
        setIsDragOver(true)
      }
    }

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      if (dragDrop && !disabled) {
        handleFiles(e.dataTransfer.files)
      }
    }

    const removeFile = (index: number) => {
      const updatedFiles = files.filter((_, i) => i !== index)
      setFiles(updatedFiles)
      onChange?.(updatedFiles)
    }

    const openFileDialog = () => {
      fileInputRef.current?.click()
    }

    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragOver && "border-primary bg-primary/5",
            disabled && "cursor-not-allowed opacity-50",
            !disabled && "hover:border-primary/50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-1">{placeholder}</p>
          <p className="text-xs text-muted-foreground">
            Max {maxFiles} files, up to {formatFileSize(maxSize)} each
          </p>
        </div>

        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        {showPreview && files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Selected Files:</p>
            <div className="space-y-1">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted rounded-md"
                >
                  <div className="flex items-center space-x-2">
                    {getFileIcon(file)}
                    <div>
                      <p className="text-sm font-medium truncate max-w-48">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(index)
                    }}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }
)

FileInput.displayName = "FileInput"

export { FileInput }
