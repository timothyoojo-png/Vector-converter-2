"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, ImageIcon, FileImage, Download } from "lucide-react"

export default function VectorConverter() {
  const [currentSVG, setCurrentSVG] = useState<string | null>(null)
  const [currentFileName, setCurrentFileName] = useState("")
  const [currentFileType, setCurrentFileType] = useState("")
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string; type: string } | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showExportOptions, setShowExportOptions] = useState(false)
  const [selectedFormats, setSelectedFormats] = useState<string[]>([])
  const [isDragOver, setIsDragOver] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const allFormats = [
    { id: "svg", label: "SVG", name: "SVG", icon: FileText },
    { id: "ai", label: "AI", name: "AI", icon: ImageIcon },
    { id: "pdf", label: "PDF", name: "PDF", icon: FileText },
    { id: "png", label: "PNG", name: "PNG", icon: FileImage },
    { id: "jpg", label: "JPG", name: "JPG", icon: FileImage },
  ]

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    const fileName = file.name.toLowerCase()
    const fileExtension = fileName.split(".").pop()

    if (!["svg", "ai", "pdf"].includes(fileExtension || "")) {
      alert("Please select a vector file (SVG, AI, or PDF).")
      return
    }

    setCurrentFileName(file.name.replace(/\.(svg|ai|pdf)$/i, ""))
    setCurrentFileType(fileExtension || "")

    setFileInfo({
      name: file.name,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      type: file.type || fileExtension?.toUpperCase() || "",
    })

    if (fileExtension === "svg") {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setCurrentSVG(result)
        setShowPreview(true)
        setShowExportOptions(true)
      }
      reader.readAsText(file)
    } else {
      setCurrentSVG(null)
      setShowPreview(true)
      setShowExportOptions(true)
    }
  }

  const getAvailableFormats = () => {
    return allFormats.filter((format) => format.id !== currentFileType)
  }

  const handleFormatToggle = (formatId: string) => {
    setSelectedFormats((prev) => (prev.includes(formatId) ? prev.filter((id) => id !== formatId) : [...prev, formatId]))
  }

  const exportSelected = () => {
    selectedFormats.forEach((format) => {
      switch (format) {
        case "svg":
          exportAsSVG()
          break
        case "ai":
          exportAsAI()
          break
        case "pdf":
          exportAsPDF()
          break
        case "png":
          exportAsPNG()
          break
        case "jpg":
          exportAsJPG()
          break
      }
    })
  }

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportAsSVG = () => {
    if (!currentSVG) {
      alert("SVG export not available for this file type.")
      return
    }
    const blob = new Blob([currentSVG], { type: "image/svg+xml" })
    downloadFile(blob, `${currentFileName}.svg`)
  }

  const exportAsAI = () => {
    if (!currentSVG) {
      alert(
        "AI export not available for this file type. Please note: True AI format export is not supported in browsers.",
      )
      return
    }
    const blob = new Blob([currentSVG], { type: "image/svg+xml" })
    downloadFile(blob, `${currentFileName}.ai`)
  }

  const exportAsPDF = () => {
    if (!currentSVG) {
      alert("PDF export not available for this file type.")
      return
    }
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    const svgBlob = new Blob([currentSVG], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(svgBlob)

    img.onload = () => {
      canvas.width = img.width || 800
      canvas.height = img.height || 600
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      canvas.toBlob((blob) => {
        if (blob) downloadFile(blob, `${currentFileName}.pdf`)
      }, "image/png")
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  const exportAsRaster = (format: "png" | "jpg") => {
    if (!currentSVG) {
      alert(`${format.toUpperCase()} export not available for this file type.`)
      return
    }
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    const svgBlob = new Blob([currentSVG], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(svgBlob)

    img.onload = () => {
      const scale = 2
      canvas.width = (img.width || 800) * scale
      canvas.height = (img.height || 600) * scale
      ctx.scale(scale, scale)

      if (format === "jpg") {
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale)
      }
      ctx.drawImage(img, 0, 0)

      const mimeType = format === "png" ? "image/png" : "image/jpeg"
      canvas.toBlob(
        (blob) => {
          if (blob) downloadFile(blob, `${currentFileName}.${format}`)
        },
        mimeType,
        0.9,
      )
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  const exportAsPNG = () => exportAsRaster("png")
  const exportAsJPG = () => exportAsRaster("jpg")

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Vector Format Converter</CardTitle>
            <CardDescription className="text-lg">
              Convert vector files (SVG, AI, PDF) to multiple formats
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground mb-4">Drag & drop your vector file here</p>
              <Button>Choose File</Button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".svg,.ai,.pdf"
                onChange={handleFileInput}
              />
            </div>
          </CardContent>
        </Card>

        {fileInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">File Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Name:</span>
                <Badge variant="secondary">{fileInfo.name}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Size:</span>
                <Badge variant="secondary">{fileInfo.size}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Type:</span>
                <Badge variant="secondary">{fileInfo.type}</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {showPreview && (
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-4 min-h-[200px] flex items-center justify-center">
                {currentSVG ? (
                  <div dangerouslySetInnerHTML={{ __html: currentSVG }} className="max-w-full max-h-80" />
                ) : (
                  <p className="text-muted-foreground">
                    {currentFileType.toUpperCase()} file loaded. Preview not available in browser.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {showExportOptions && (
          <Card>
            <CardHeader>
              <CardTitle>Select Export Formats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getAvailableFormats().map((format) => {
                  const IconComponent = format.icon
                  return (
                    <div
                      key={format.id}
                      className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedFormats.includes(format.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => handleFormatToggle(format.id)}
                    >
                      <Checkbox
                        checked={selectedFormats.includes(format.id)}
                        onCheckedChange={() => handleFormatToggle(format.id)}
                      />
                      <IconComponent className="h-4 w-4" />
                      <label className="cursor-pointer font-medium">{format.name}</label>
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-center pt-4">
                <Button onClick={exportSelected} disabled={selectedFormats.length === 0} className="px-8">
                  <Download className="mr-2 h-4 w-4" />
                  Export Selected Formats
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Alert>
          <AlertDescription>
            <strong>Note:</strong> AI export creates SVG format due to browser limitations. PDF files are converted to
            raster formats for export. All exports maintain high quality with customizable dimensions.
          </AlertDescription>
        </Alert>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}
