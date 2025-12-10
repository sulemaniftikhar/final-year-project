import { useAuth } from "@/context/AuthContext"
import { Icon } from "@iconify/react"

export default function FloatingLogoutButton() {
    const { isAuthenticated, logout, user } = useAuth()

    if (!isAuthenticated) return null

    return (
        <button
            onClick={logout}
            className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-destructive to-red-600 text-white rounded-full shadow-2xl hover:shadow-destructive/50 hover:scale-105 transition-all duration-200 font-semibold group"
            title="Logout"
        >
            <Icon icon="lucide:log-out" className="w-5 h-5" />
            <span className="hidden sm:inline">Logout</span>
        </button>
    )
}
