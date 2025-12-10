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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
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
            <h1 className="text-5xl font-bold text-white mb-6">
              Admin <span className="text-emerald-500">Portal</span>
            </h1>
            <p className="text-xl text-slate-400 mb-8">
              Complete control over your multi-vendor food delivery platform.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4 text-slate-300">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  📊
                </div>
                <span>Monitor platform revenue & growth</span>
              </div>
              <div className="flex items-center gap-4 text-slate-300">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                  👥
                </div>
                <span>Manage customers & restaurant partners</span>
              </div>
              <div className="flex items-center gap-4 text-slate-300">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                  ✅
                </div>
                <span>Approve new restaurant registrations</span>
              </div>
            </div>
          </div>

          {/* Right Side: Login Card */}
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white">Admin Login</h2>
              <p className="text-slate-400 text-sm">Sign in to access the control panel</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500 text-white placeholder-slate-600 transition-colors"
                  placeholder="admin@orderiq.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-lg focus:outline-none focus:border-emerald-500 text-white placeholder-slate-600 transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-emerald-900/20"
              >
                {isLoading ? "Authenticating..." : "Access Dashboard"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-xs text-slate-500">
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
