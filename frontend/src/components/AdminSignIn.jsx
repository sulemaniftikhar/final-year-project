"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"

export default function AdminSignIn({ onBack }) {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
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
      navigate('/admin') // Navigate to admin dashboard
    } else {
      setError("Invalid admin credentials")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to OrderIQ
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side: Illustration / Text */}
          <div className="hidden md:block">
            <h1 className="text-5xl font-bold text-foreground mb-6">
              Admin <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Portal</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Complete control over your multi-vendor food delivery platform.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-2xl">
                  📊
                </div>
                <span>Monitor platform revenue & growth</span>
              </div>
              <div className="flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent text-2xl">
                  👥
                </div>
                <span>Manage customers & restaurant partners</span>
              </div>
              <div className="flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-2xl">
                  ✅
                </div>
                <span>Approve new restaurant registrations</span>
              </div>
            </div>
          </div>

          {/* Right Side: Login Card */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl">
                🔐
              </div>
              <h2 className="text-2xl font-bold text-foreground">Admin Login</h2>
              <p className="text-muted-foreground text-sm mt-2">Sign in to access the control panel</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground transition-all"
                  placeholder="admin@orderiq.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-bold py-3 rounded-lg transition-all shadow-lg disabled:opacity-50"
              >
                {isLoading ? "Authenticating..." : "Access Dashboard"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">
                Restricted access. Authorized personnel only.
              </p>
              <div className="mt-4 inline-block px-3 py-1 bg-white/5 rounded text-xs text-slate-400">
                Demo: admin@orderiq.com / admin1234
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
