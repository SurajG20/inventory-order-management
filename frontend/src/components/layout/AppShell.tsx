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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 h-16 bg-white border-b border-border flex items-center px-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-2 ml-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">IM</span>
          </div>
          <span className="text-lg font-semibold text-foreground">
            InventoryMS
          </span>
        </div>
      </div>

      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <main
        className={cn(
          'transition-all duration-300',
          'lg:ml-60',
          collapsed && 'lg:ml-16'
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 pt-20 lg:pt-6">
          {children}
        </div>
      </main>
    </div>
  )
}
