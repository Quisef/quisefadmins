import type { Metadata } from 'next'
// @ts-ignore
import "./globals.css";
export const metadata: Metadata = {
  title: 'QUISEF NGO',
  description: 'QUISEF NGO is a non-profit organization dedicated to empowering communities through education, healthcare, and sustainable development initiatives. Our mission is to create lasting positive change and improve the quality of life for individuals and families in need.',
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