"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"

export default function AdminSignIn({ onBack }) {
  const { login } = useAuth()
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
    setIsLoading(true)

    // Admin credentials validation
    if (formData.email === "admin@orderiq.com" && formData.password === "admin123") {
      const adminData = {
        id: "admin1",
        email: "admin@orderiq.com",
        name: "Admin",
        role: "admin",
      }
      login(adminData)
    } else {
      setError("Invalid admin credentials")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-950 dark:to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-2xl p-8 border border-border">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-orange-100 dark:bg-orange-900 rounded-full mb-4">
              <span className="text-5xl">🔐</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Admin Login</h2>
            <p className="text-muted-foreground">Access the admin control panel</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-foreground"
                placeholder="admin@orderiq.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all text-foreground"
                placeholder="Enter admin password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isLoading ? "Signing In..." : "Sign In as Admin"}
            </button>
          </form>

          {/* Back Button */}
          <button
            onClick={onBack}
            className="w-full mt-6 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            ← Back to Home
          </button>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Demo Credentials:</strong>
              <br />
              Email: admin@orderiq.com
              <br />
              Password: admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
