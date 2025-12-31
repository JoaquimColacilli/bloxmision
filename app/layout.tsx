import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/contexts/auth-context"
import { AcademyProvider } from "@/contexts/academy-context"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BloxMision - Aprende a programar como un pirata",
  description: "Aventura de programacion visual para ninos con Jorc el Pirata",
  generator: "v0.app",
  icons: {
    icon: "/BM_LOGO.png",
    apple: "/BM_LOGO.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <AuthProvider>
          <AcademyProvider>{children}</AcademyProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
