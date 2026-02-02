import { useState, useRef } from "react"
import { Upload, X, AlertCircle } from "lucide-react"
import { useStore } from "@/store/useStore"
import { Button } from "@/components/ui/button"

import { API_BASE_URL, UPLOAD_SINGLE } from "@/utils/constants"

interface FileUploadProps {
  fieldName?: string
  multiple?: boolean
  accept?: string
  maxSize?: number
  placeholder?: string
  description?: string
}

export function FileUpload({
  fieldName = "images",
  multiple = true,
  accept = "image/*,application/pdf,video/*",
  maxSize = 10,
  placeholder = "Drag & Drop your files or Browse",
  description,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { apiJson, updateApiJson } = useStore()

  const existingUrls: string[] = Array.isArray(apiJson[fieldName])
    ? (apiJson[fieldName] as string[])
    : typeof apiJson[fieldName] === "string" && apiJson[fieldName]
      ? [apiJson[fieldName] as string]
      : []

  const getToken = (): string | null => {
    return localStorage.getItem("token")
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    handleFiles(multiple ? files : [files[0]])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleFiles = async (files: File[]) => {
    if (!files.length) return
    setIsUploading(true)
    setError(null)

    try {
      const uploadPromises = files.map((file) => uploadSingleFile(file))
      const uploadResults = await Promise.all(uploadPromises)

      const successfulUrls = uploadResults
        .filter((r) => r.success && r.data?.url)
        .map((r) => r.data!.url)

      const failedCount = uploadResults.filter((r) => !r.success).length
      if (failedCount > 0) {
        setError(`${failedCount} file(s) failed to upload.`)
      }

      if (successfulUrls.length > 0) {
        if (multiple) {
          const allUrls = [...existingUrls, ...successfulUrls]
          updateApiJson(fieldName, allUrls)
        } else {
          // Single mode: replace with the new image
          updateApiJson(fieldName, [successfulUrls[0]])
        }
      }
    } catch (err) {
      setError("Failed to upload files. Please try again.")
      console.error("Upload error:", err)
    } finally {
      setIsUploading(false)
    }
  }

  const uploadSingleFile = async (
    file: File
  ): Promise<{ success: boolean; data?: { url: string }; error?: string }> => {
    try {
      if (file.size > maxSize * 1024 * 1024) {
        return { success: false, error: `File size exceeds ${maxSize}MB limit` }
      }

      const formData = new FormData()
      formData.append("file", file)

      const token = getToken()

      const response = await fetch(`${API_BASE_URL}${UPLOAD_SINGLE}`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        return { success: true, data: { url: data.data.url } }
      } else {
        return { success: false, error: data.message || "Upload failed" }
      }
    } catch (err) {
      console.error("File upload error:", err)
      return { success: false, error: err instanceof Error ? err.message : "Upload failed" }
    }
  }

  const removeImage = (index: number) => {
    const newUrls = existingUrls.filter((_, i) => i !== index)
    updateApiJson(fieldName, newUrls)
  }

  const clearAll = () => {
    updateApiJson(fieldName, [])
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  // For single mode, hide the upload zone if an image already exists
  const showUploadZone = multiple || existingUrls.length === 0

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
          <span className="text-destructive text-sm">{error}</span>
        </div>
      )}

      {showUploadZone && (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 cursor-pointer
            ${isDragOver ? "border-primary bg-primary/5" : "border-border bg-muted/50 hover:border-muted-foreground hover:bg-muted"}
            ${isUploading ? "pointer-events-none opacity-70" : ""}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            onChange={handleFileSelect}
            className="hidden"
            accept={accept}
          />

          <div className="flex flex-col items-center gap-2">
            <div
              className={`p-2.5 rounded-full transition-colors duration-300 ${
                isDragOver ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              <Upload className="w-5 h-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                {placeholder.includes("or") ? (
                  <>
                    <span className="font-medium">{placeholder.split(" or ")[0]}</span> or{" "}
                    <span className="text-primary font-medium underline">{placeholder.split(" or ")[1]}</span>
                  </>
                ) : (
                  <span className="font-medium">{placeholder}</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {description || `Max ${maxSize}MB`}
              </p>
            </div>
          </div>

          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                <span className="text-sm text-muted-foreground">Uploading...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {existingUrls.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            {existingUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Uploaded ${index + 1}`}
                  className="h-16 w-16 object-contain border rounded-md p-1"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {!multiple && existingUrls.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearAll}
            >
              Remove Image
            </Button>
          )}

          {multiple && existingUrls.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearAll}
            >
              Clear All
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
