import { createContext, useContext, useState } from 'react'

const DashboardContext = createContext()

export function DashboardProvider({ children }) {
    const [activeView, setActiveView] = useState('overview')
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)
    const closeMobileMenu = () => setIsMobileMenuOpen(false)

    return (
        <DashboardContext.Provider value={{
            activeView,
            setActiveView,
            isMobileMenuOpen,
            toggleMobileMenu,
            closeMobileMenu
        }}>
            {children}
        </DashboardContext.Provider>
    )
}

export function useDashboard() {
    const context = useContext(DashboardContext)
    if (!context) {
        throw new Error('useDashboard must be used within a DashboardProvider')
    }
    return context
}
