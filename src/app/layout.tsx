import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Finance App",
  description: "Personal finance management application",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}

