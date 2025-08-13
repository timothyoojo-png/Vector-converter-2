import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vector Format Converter',
  description: 'Convert vector files (SVG, AI, PDF) to multiple formats including PNG, JPG, and more. Free online tool with drag & drop support.',
  keywords: 'vector converter, svg converter, ai converter, pdf converter, format converter, image converter',
  authors: [{ name: 'Vector Converter Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'Vector Format Converter',
    description: 'Convert vector files to multiple formats with our free online tool',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vector Format Converter',
    description: 'Convert vector files to multiple formats with our free online tool',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#000000" />
        <script src="//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
