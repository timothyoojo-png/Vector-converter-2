# Vector Format Converter 2

A modern web application for converting vector files (SVG, AI, PDF) to multiple formats including PNG, JPG, and more. Built with Next.js, React, and Tailwind CSS.

## Features

- **Drag & Drop Interface**: Easy file upload with drag and drop support
- **Multiple Input Formats**: Support for SVG, AI, and PDF files
- **Multiple Output Formats**: Export to SVG, AI, PDF, PNG, and JPG
- **File Preview**: Preview SVG files directly in the browser
- **Batch Export**: Select multiple formats and export them all at once
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

## Supported Formats

### Input Formats
- SVG (Scalable Vector Graphics)
- AI (Adobe Illustrator)
- PDF (Portable Document Format)

### Output Formats
- SVG (Scalable Vector Graphics)
- AI (Note: Creates SVG format due to browser limitations)
- PDF (Converted to raster format)
- PNG (Portable Network Graphics)
- JPG (JPEG)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd vector-converter-2
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Upload a File**: Drag and drop a vector file onto the upload area or click "Choose File"
2. **View File Info**: See file details including name, size, and type
3. **Preview**: For SVG files, you'll see a preview of the content
4. **Select Export Formats**: Choose which formats you want to convert to
5. **Export**: Click "Export Selected Formats" to download your converted files

## Technical Details

### Architecture
- **Frontend**: Next.js 14 with React 18
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui component library
- **Icons**: Lucide React icons
- **File Processing**: HTML5 Canvas API for format conversion

### Key Components
- `VectorConverter`: Main application component
- `Card`: Reusable card component for layout
- `Button`: Interactive button component
- `Checkbox`: Selection component for format choosing
- `Badge`: Information display component
- `Alert`: Notification component

### File Conversion Process
1. **SVG Files**: Read as text and can be exported directly
2. **AI/PDF Files**: Limited browser support, converted to raster formats
3. **Raster Export**: Uses Canvas API to convert SVG to PNG/JPG
4. **PDF Export**: Converts SVG to raster format (PNG)

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Limitations

- **AI Format**: True AI format export is not supported in browsers due to format complexity
- **PDF Export**: Creates raster images rather than true PDF files
- **File Size**: Large files may cause performance issues
- **Complex SVGs**: Very complex SVG files may not render correctly

## Development

### Project Structure
```
vector-converter-2/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/             # React components
│   ├── ui/                # UI components
│   └── VectorConverter.tsx # Main component
├── lib/                    # Utility functions
└── public/                 # Static assets
```

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

### Adding New Formats
To add support for new formats:

1. Add the format to the `allFormats` array in `VectorConverter.tsx`
2. Implement the export function (e.g., `exportAsNewFormat`)
3. Add the case to the `exportSelected` function
4. Update the file type validation in `handleFile`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
