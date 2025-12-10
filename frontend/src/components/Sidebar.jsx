import { useAuth } from "@/context/AuthContext"
import { useDashboard } from "@/context/DashboardContext"
import { Icon } from '@iconify/react'

export default function Sidebar() {
    const { user, logout } = useAuth()
    const { activeView, setActiveView, isMobileMenuOpen, closeMobileMenu } = useDashboard()

    const role = user?.role || 'customer'

    const menus = {
        customer: [
            { id: 'browse', label: 'Browse', icon: 'lucide:store' },
            { id: 'orders', label: 'My Orders', icon: 'lucide:shopping-bag' },
            { id: 'rewards', label: 'Rewards', icon: 'lucide:gift' },
            { id: 'profile', label: 'Profile', icon: 'lucide:user' },
        ],
        restaurant: [
            { id: 'dashboard', label: 'Dashboard', icon: 'lucide:layout-dashboard' },
            { id: 'orders', label: 'Orders', icon: 'lucide:clipboard-list' },
            { id: 'menu', label: 'Menu Management', icon: 'lucide:utensils' },
            { id: 'profile', label: 'Profile', icon: 'lucide:user' },
            { id: 'analytics', label: 'Analytics', icon: 'lucide:bar-chart' },
        ],
        admin: [
            { id: 'dashboard', label: 'Overview', icon: 'lucide:layout-dashboard' },
            { id: 'users', label: 'Users', icon: 'lucide:users' },
            { id: 'approvals', label: 'Approvals', icon: 'lucide:check-square' },
            { id: 'orders', label: 'Global Orders', icon: 'lucide:package' },
            { id: 'analytics', label: 'Reports', icon: 'lucide:pie-chart' },
        ]
    }

    const items = menus[role] || menus.customer

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={closeMobileMenu}></div>
            )}

            {/* Sidebar */}
            <aside className={`
          fixed top-0 left-0 z-50 h-screen w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-border flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                            <Icon icon="lucide:bar-chart-2" className="text-primary-foreground text-xl" />
                        </div>
                        <span className="text-xl font-bold text-foreground">OrderIQ</span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                        {items.map(item => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveView(item.id)
                                    closeMobileMenu()
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium
                             ${activeView === item.id
                                        ? "bg-primary text-primary-foreground shadow-md"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }
                         `}
                            >
                                <Icon icon={item.icon} className="text-xl" />
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    {/* User / Logout */}
                    <div className="p-4 border-t border-border">
                        <div className="flex items-center gap-3 mb-4 px-2">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground font-bold">
                                {user?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-foreground truncate">{user?.name}</p>
                                <p className="text-xs text-muted-foreground capitalize">{role}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                            <Icon icon="lucide:log-out" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>
        </>
    )
}
