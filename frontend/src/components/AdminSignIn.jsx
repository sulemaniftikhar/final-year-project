import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"
import { Icon } from "@iconify/react"

export default function AdminSignIn({ onBack }) {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value,
    })
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Basic validation
    if (!formData.email || !formData.password) {
      setError("Please enter both email and password")
      return
    }

    setIsLoading(true)

    // Admin credentials validation
    if (formData.email === "admin@orderiq.com" && formData.password === "admin1234") {
      const adminData = {
        id: "admin1",
        email: "admin@orderiq.com",
        name: "Admin",
        role: "admin",
        isAuthenticated: true
      }
      login(adminData)
      navigate('/admin')
    } else {
      setError("The credentials provided do not match our records.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <nav className="w-full border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 text-primary">
                <Icon icon="lucide:bar-chart-2" className="w-full h-full" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                OrderIQ{" "}
                <span className="text-primary text-sm font-medium ml-1 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                  Admin
                </span>
              </span>
            </div>
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors bg-card px-4 py-2 rounded-full border border-border hover:border-primary"
            >
              <Icon icon="lucide:arrow-left" className="text-lg" />
              Back to OrderIQ
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row h-full">
        {/* Left Panel - Features */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-card border-r border-border overflow-hidden items-center justify-center p-12">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>

          <div className="relative z-10 max-w-lg space-y-12">
            <div className="space-y-4">
              <h2 className="text-4xl xl:text-5xl font-black text-foreground leading-tight">
                Powering your kitchen,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  empowering your business.
                </span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Access your admin dashboard to manage orders, restaurants, and analyze platform performance in real-time.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-lg">
                  <Icon icon="lucide:activity" className="text-primary text-2xl" />
                </div>
                <div>
                  <h3 className="text-foreground font-bold text-lg">Real-time Analytics</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Track sales, revenue, and customer growth as it happens.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-lg">
                  <Icon icon="lucide:utensils" className="text-primary text-2xl" />
                </div>
                <div>
                  <h3 className="text-foreground font-bold text-lg">Restaurant Management</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Approve restaurants, manage menus, and monitor performance across all partners.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-lg">
                  <Icon icon="lucide:shield-check" className="text-primary text-2xl" />
                </div>
                <div>
                  <h3 className="text-foreground font-bold text-lg">Secure & Reliable</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enterprise-grade security to keep your business data safe.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Sign In Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 relative bg-background">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl lg:hidden"></div>

          <div className="w-full max-w-md space-y-8 z-10">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl font-black text-foreground">Sign In</h1>
              <p className="mt-2 text-sm text-muted-foreground">Welcome back! Please enter your details.</p>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/50 rounded-xl p-4 flex items-start gap-3">
                <Icon icon="lucide:alert-circle" className="text-destructive text-xl mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-destructive">Authentication Failed</h4>
                  <p className="text-xs text-destructive/80 mt-1">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-foreground" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Icon icon="lucide:mail" className="text-muted-foreground" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3.5 rounded-full border border-border bg-card text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/50 transition-colors sm:text-sm shadow-sm"
                    placeholder="admin@orderiq.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-bold text-foreground" htmlFor="password">
                    Password
                  </label>
                  <a href="#" className="text-xs font-bold text-primary hover:text-accent transition-colors">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Icon icon="lucide:lock" className="text-muted-foreground" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3.5 rounded-full border border-border bg-card text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/50 transition-colors sm:text-sm shadow-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary focus:ring-primary border-border rounded bg-card"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-muted-foreground">
                  Remember me for 30 days
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-full shadow-[0_0_15px_rgba(43,238,121,0.2)] hover:shadow-[0_0_20px_rgba(43,238,121,0.4)] text-sm font-bold text-primary-foreground bg-primary hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing In..." : "Sign In to Dashboard"}
              </button>
            </form>

            <div className="pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Having trouble signing in?{" "}
                <a href="#" className="font-bold text-foreground hover:text-primary transition-colors">
                  Contact Support
                </a>
              </p>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground/60">
                Demo: admin@orderiq.com / admin1234
              </p>
            </div>
          </div>

          <div className="mt-auto pt-10 text-center">
            <p className="text-xs text-muted-foreground/60">© 2024 OrderIQ Inc. All rights reserved.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
