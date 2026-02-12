import type { Metadata } from 'next'
import "./globals.css";
export const metadata: Metadata = {
  title: 'QUISEF CMS',
  description: 'Content Management System',
  icons: {
    icon: {
      url: '/images/QSEF-03.PNG', // Path relative to public
      sizes: '512x512',         // Specify size (e.g., 32x32 pixels)
      type: 'image/jpg',      // MIME type
    },
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
    
      <body>   
          {children}
      </body>
      
    </html>
  )
}