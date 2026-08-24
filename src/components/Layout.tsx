import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { SideDecorations } from './SideDecorations'

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <SideDecorations />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
