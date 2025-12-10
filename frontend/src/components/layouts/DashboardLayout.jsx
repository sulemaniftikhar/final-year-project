import { DashboardProvider, useDashboard } from "@/context/DashboardContext"
import Sidebar from "../Sidebar"
import { Icon } from '@iconify/react'

function DashboardContent({ children }) {
    const { toggleMobileMenu } = useDashboard()

    return (
        <div className="min-h-screen bg-background lg:pl-64 transition-all duration-300">
            {/* Mobile Toggle Button - Floating or top left */}
            <div className="lg:hidden p-4 sticky top-0 z-30 pointer-events-none">
                <button
                    onClick={toggleMobileMenu}
                    className="pointer-events-auto bg-card p-2 rounded-md shadow-md border border-border text-foreground"
                >
                    <Icon icon="lucide:menu" className="text-2xl" />
                </button>
            </div>

            <main className="p-4 md:p-8">
                {children}
            </main>
        </div>
    )
}

export default function DashboardLayout({ children }) {
    return (
        <DashboardProvider>
            <Sidebar />
            <DashboardContent>
                {children}
            </DashboardContent>
        </DashboardProvider>
    )
}
