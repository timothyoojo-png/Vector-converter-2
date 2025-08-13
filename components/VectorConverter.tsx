"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, ImageIcon, FileImage, Download, File } from "lucide-react"

// PDF.js setup
let pdfjsLib: any = null

export default function VectorConverter() {
  const [currentSVG, setCurrentSVG] = useState<string | null>(null)
  const [currentFileName, setCurrentFileName] = useState("")
  const [currentFileType, setCurrentFileType] = useState("")
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string; type: string } | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showExportOptions, setShowExportOptions] = useState(false)
  const [selectedFormats, setSelectedFormats] = useState<string[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [pdfPages, setPdfPages] = useState<HTMLCanvasElement[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Initialize PDF.js
  useEffect(() => {
    const initPDF = async () => {
      try {
        // Wait for the CDN script to load
        if (typeof window !== 'undefined') {
          // Check if PDF.js is already loaded from CDN
          if (window.pdfjsLib) {
            pdfjsLib = window.pdfjsLib
            pdfjsLib.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
            console.log('PDF.js loaded from CDN')
            return
          }
          
          // Wait a bit for CDN script to load
          let attempts = 0
          const maxAttempts = 10
          const checkPDF = () => {
            if (window.pdfjsLib) {
              pdfjsLib = window.pdfjsLib
              pdfjsLib.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
              console.log('PDF.js loaded from CDN after waiting')
              return
            }
            attempts++
            if (attempts < maxAttempts) {
              setTimeout(checkPDF, 500)
            } else {
              console.log('CDN loading failed, trying npm package')
              loadFromNPM()
            }
          }
          checkPDF()
        }
      } catch (error) {
        console.error('Failed to load PDF.js:', error)
        loadFromNPM()
      }
    }

    const loadFromNPM = async () => {
      try {
        const pdfjs = await import('pdfjs-dist')
        pdfjsLib = pdfjs
        if (pdfjs.version) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`
        }
        console.log('PDF.js loaded from npm package')
      } catch (error) {
        console.error('Failed to load PDF.js from npm:', error)
        // Final fallback - manual CDN loading
        const script = document.createElement('script')
        script.src = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
        script.onload = () => {
          if (window.pdfjsLib) {
            pdfjsLib = window.pdfjsLib
            pdfjsLib.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
            console.log('PDF.js loaded from manual CDN script')
          }
        }
        script.onerror = () => {
          console.error('All PDF.js loading methods failed')
        }
        document.head.appendChild(script)
      }
    }

    initPDF()
  }, [])

  const allFormats = [
    { id: "svg", label: "SVG", name: "SVG", icon: FileText },
    { id: "ai", label: "AI", name: "AI", icon: ImageIcon },
    { id: "pdf", label: "PDF", name: "PDF", icon: File },
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

  const processPDF = async (file: File) => {
    if (!pdfjsLib) {
      console.error('PDF.js library not loaded')
      alert("PDF processing library not loaded. Please refresh the page and try again.")
      return
    }

    setIsLoading(true)
    try {
      console.log('Starting PDF processing...')
      const arrayBuffer = await file.arrayBuffer()
      console.log('File converted to array buffer')
      
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      console.log(`PDF loaded with ${pdf.numPages} pages`)
      
      const pages: HTMLCanvasElement[] = []
      const maxPages = Math.min(pdf.numPages, 5)

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        console.log(`Processing page ${pageNum}...`)
        const page = await pdf.getPage(pageNum)
        const viewport = page.getViewport({ scale: 1.5 })
        
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        if (!context) {
          throw new Error(`Failed to get canvas context for page ${pageNum}`)
        }
        
        canvas.height = viewport.height
        canvas.width = viewport.width

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        }

        await page.render(renderContext).promise
        pages.push(canvas)
        console.log(`Page ${pageNum} processed successfully`)
      }

      console.log(`All ${pages.length} pages processed`)
      setPdfPages(pages)
      setCurrentPage(0)
      setCurrentSVG(null) // PDF doesn't have SVG content
      setShowPreview(true)
      setShowExportOptions(true)
    } catch (error) {
      console.error('PDF processing error:', error)
      let errorMessage = 'Failed to process PDF file. '
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid PDF')) {
          errorMessage += 'The file appears to be corrupted or not a valid PDF.'
        } else if (error.message.includes('password')) {
          errorMessage += 'The PDF may be password protected.'
        } else if (error.message.includes('size')) {
          errorMessage += 'The file may be too large or corrupted.'
        } else {
          errorMessage += `Error: ${error.message}`
        }
      }
      
      alert(errorMessage + ' Please try a different file.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFile = async (file: File) => {
    const fileName = file.name.toLowerCase()
    const fileExtension = fileName.split(".").pop()

    if (!["svg", "ai", "pdf"].includes(fileExtension || "")) {
      alert("Please select a vector file (SVG, AI, or PDF).")
      return
    }

    setCurrentFileName(file.name.replace(/\.(svg|ai|pdf)$/i, ""))
    setCurrentFileType(fileExtension || "")
    setPdfPages([])
    setCurrentPage(0)

    setFileInfo({
      name: file.name,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      type: file.type || fileExtension?.toUpperCase() || "",
    })

    if (fileExtension === "svg") {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        console.log('SVG content loaded:', result.substring(0, 200) + '...')
        console.log('SVG length:', result.length)
        
        // Validate SVG content
        if (result.includes('<svg') && result.includes('</svg>')) {
          setCurrentSVG(result)
          setShowPreview(true)
          setShowExportOptions(true)
          console.log('SVG set successfully')
        } else {
          console.error('Invalid SVG content')
          alert('The file appears to be corrupted or not a valid SVG file.')
        }
      }
      reader.onerror = () => {
        console.error('Failed to read SVG file')
        alert('Failed to read the SVG file. Please try again.')
      }
      reader.readAsText(file)
    } else if (fileExtension === "pdf") {
      await processPDF(file)
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
    console.log('exportSelected called with formats:', selectedFormats)
    
    selectedFormats.forEach((format) => {
      console.log(`Processing format: ${format}`)
      switch (format) {
        case "svg":
          console.log('Calling exportAsSVG')
          exportAsSVG()
          break
        case "ai":
          console.log('Calling exportAsAI')
          exportAsAI()
          break
        case "pdf":
          console.log('Calling exportAsPDF')
          exportAsPDF()
          break
        case "png":
          console.log('Calling exportAsPNG')
          exportAsPNG()
          break
        case "jpg":
          console.log('Calling exportAsJPG')
          exportAsJPG()
          break
        default:
          console.warn(`Unknown format: ${format}`)
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

  const exportAsPDF = async () => {
    console.log('exportAsPDF called')
    console.log('currentFileType:', currentFileType)
    console.log('currentSVG exists:', !!currentSVG)
    console.log('pdfPages length:', pdfPages.length)
    
    if (currentFileType === "pdf") {
      // For PDF files, export the current page as PDF
      if (pdfPages.length > 0) {
        const canvas = pdfPages[currentPage]
        canvas.toBlob((blob) => {
          if (blob) downloadFile(blob, `${currentFileName}_page${currentPage + 1}.pdf`)
        }, "application/pdf")
      }
      return
    }

    if (!currentSVG) {
      console.error('No SVG content available for PDF export')
      alert("PDF export not available for this file type.")
      return
    }

    try {
      // Import jsPDF dynamically to avoid build issues
      const { jsPDF } = await import('jspdf')
      
      // Create canvas and render SVG
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const img = new Image()
      const svgBlob = new Blob([currentSVG], { type: "image/svg+xml;charset=utf-8" })
      const url = URL.createObjectURL(svgBlob)

      img.onload = () => {
        // Set canvas dimensions with good resolution
        const scale = 2
        canvas.width = (img.width || 800) * scale
        canvas.height = (img.height || 600) * scale
        
        // Clear canvas and set white background
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Scale and draw image
        ctx.scale(scale, scale)
        ctx.drawImage(img, 0, 0)
        
        // Convert canvas to data URL
        const imageDataUrl = canvas.toDataURL('image/png', 1.0)
        
        // Create PDF with jsPDF
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [canvas.width / scale, canvas.height / scale]
        })
        
        // Add the image to PDF
        pdf.addImage(imageDataUrl, 'PNG', 0, 0, canvas.width / scale, canvas.height / scale)
        
        // Save the PDF
        pdf.save(`${currentFileName}.pdf`)
        
        URL.revokeObjectURL(url)
      }
      
      img.onerror = () => {
        alert("Failed to process SVG for PDF export. Please try a different SVG file.")
        URL.revokeObjectURL(url)
      }
      
      img.src = url
    } catch (error) {
      console.error('PDF export error:', error)
      // Fallback to high-quality PNG if PDF creation fails
      try {
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
          
          ctx.fillStyle = "white"
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.scale(scale, scale)
          ctx.drawImage(img, 0, 0)
          
          canvas.toBlob((pngBlob) => {
            if (pngBlob) {
              downloadFile(pngBlob, `${currentFileName}_highres.png`)
              alert(`PDF creation failed, but high-resolution PNG exported! You can convert this to PDF using online tools.`)
            }
          }, "image/png", 1.0)
          
          URL.revokeObjectURL(url)
        }
        
        img.src = url
      } catch (fallbackError) {
        console.error('Fallback export also failed:', fallbackError)
        alert("PDF export failed. Please try a different file or format.")
      }
    }
  }

  const exportAsRaster = (format: "png" | "jpg") => {
    if (currentFileType === "pdf" && pdfPages.length > 0) {
      // Export current PDF page as raster
      const canvas = pdfPages[currentPage]
      const mimeType = format === "png" ? "image/png" : "image/jpeg"
      
      if (format === "jpg") {
        const tempCanvas = document.createElement('canvas')
        const tempCtx = tempCanvas.getContext('2d')
        if (tempCtx) {
          tempCanvas.width = canvas.width
          tempCanvas.height = canvas.height
          tempCtx.fillStyle = "white"
          tempCtx.fillRect(0, 0, canvas.width, canvas.height)
          tempCtx.drawImage(canvas, 0, 0)
          tempCanvas.toBlob((blob) => {
            if (blob) downloadFile(blob, `${currentFileName}_page${currentPage + 1}.${format}`)
          }, mimeType, 0.9)
        }
      } else {
        canvas.toBlob((blob) => {
          if (blob) downloadFile(blob, `${currentFileName}_page${currentPage + 1}.${format}`)
        }, mimeType, 0.9)
      }
      return
    }

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

  const nextPage = () => {
    if (currentPage < pdfPages.length - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

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
              {currentFileType === "pdf" && pdfPages.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Pages:</span>
                  <Badge variant="secondary">{pdfPages.length}</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {showPreview && (
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              {currentFileType === "pdf" && pdfPages.length > 1 && (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={prevPage} 
                    disabled={currentPage === 0}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage + 1} of {pdfPages.length}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={nextPage} 
                    disabled={currentPage === pdfPages.length - 1}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-4 min-h-[200px] flex items-center justify-center">
                {isLoading ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Processing PDF...</p>
                  </div>
                ) : currentSVG ? (
                  <div className="text-center">
                    <div className="mb-2">
                      <div 
                        dangerouslySetInnerHTML={{ __html: currentSVG }} 
                        className="max-w-full max-h-80 mx-auto border rounded bg-white"
                        style={{ 
                          display: 'inline-block',
                          minHeight: '200px',
                          minWidth: '200px'
                        }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      SVG Preview - Ready for export
                    </p>
                  </div>
                ) : currentFileType === "pdf" && pdfPages.length > 0 ? (
                  <div className="text-center">
                    <div className="mb-2">
                      <img 
                        src={pdfPages[currentPage].toDataURL()} 
                        alt={`Page ${currentPage + 1}`}
                        className="max-w-full max-h-80 mx-auto border rounded"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      PDF Page {currentPage + 1} - Ready for export
                    </p>
                  </div>
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
            <strong>Note:</strong> AI export creates SVG format due to browser limitations. PDF files are now fully supported for PNG/JPG export with multi-page navigation. All exports maintain high quality with customizable dimensions.
          </AlertDescription>
        </Alert>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}
