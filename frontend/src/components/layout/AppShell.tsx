import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Menu } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { MobileDrawer } from './MobileDrawer'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 border-b border-border bg-white flex items-center px-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 ml-3">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-primary-foreground">
            <span className="text-xs font-bold">IM</span>
          </div>
          <span className="text-base font-semibold text-foreground">InventoryMS</span>
        </div>
      </div>

      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

        <main
          className={cn(
            'flex-1 min-w-0 transition-all duration-300 pt-14 lg:pt-0',
            collapsed ? 'lg:ml-16' : 'lg:ml-60'
          )}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
