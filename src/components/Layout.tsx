import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
export function Layout({ children }: { children?: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1" style={{ position: 'relative', zIndex: 1 }}>
        {children ?? <Outlet />}
      </main>
      <Footer />
    </div>
  )
}
