
// Restaurant Sign In Page - Stylish modern design
// Reference: SRS 3.2.1 - User Account and Authentication (FR-02)

import { useState } from "react"
import { isValidEmail } from "@/lib/validation"
import { useAuth } from "@/context/AuthContext"
import { auth } from "@/lib/firebase"
import { signInWithEmailAndPassword } from "firebase/auth"

export default function RestaurantSignIn({ onBack, onSwitchToSignUp, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const emailValid = formData.email ? isValidEmail(formData.email) : null

  const validateForm = () => {
    const newErrors = {}
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!formData.password.trim()) newErrors.password = "Password is required"
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    try {
      // Sign in restaurant with Firebase
      await signInWithEmailAndPassword(auth, formData.email, formData.password)
      const user = auth.currentUser

      // Create user data object
      const userData = {
        id: user.uid,
        email: formData.email,
        role: "restaurant",
        restaurantName: user.displayName || "Demo Restaurant",
      }
      login(userData)
      if (onLoginSuccess) {
        onLoginSuccess("restaurant")
      }
    } catch (error) {
      console.error("Restaurant sign-in error:", error.message)
      setErrors({ submit: "Invalid email or password" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/5 to-primary/5">
      <div className="border-b border-border bg-white sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-foreground hover:text-accent transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to OrderIQ
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="hidden md:block">
            <h1 className="text-5xl font-bold text-foreground mb-6">
              Welcome Back, <span className="text-accent">Restaurant Owner!</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Sign in to manage your restaurant, menu, and orders all in one place.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Real-time Analytics</h3>
                  <p className="text-sm text-muted-foreground">Track sales and customer insights</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🍜</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Easy Menu Management</h3>
                  <p className="text-sm text-muted-foreground">Update prices and items instantly</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📱</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Multi-channel Orders</h3>
                  <p className="text-sm text-muted-foreground">Manage orders from web and WhatsApp</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-border">
            <h2 className="text-3xl font-bold text-foreground mb-2">Restaurant Sign In</h2>
            <p className="text-muted-foreground mb-8">Access your restaurant dashboard</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="restaurant@example.com"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-accent transition-colors ${
                    errors.email ? "border-destructive" : "border-border"
                  } bg-background`}
                />
                {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                {emailValid !== null && (
                  <p className={`text-xs mt-1 ${emailValid ? 'text-green-600' : 'text-destructive'}`}>
                    {emailValid ? 'Valid email' : 'Invalid email format'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-accent transition-colors ${
                    errors.password ? "border-destructive" : "border-border"
                  } bg-background`}
                />
                {errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-accent to-primary text-accent-foreground py-3 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 mt-6"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-muted-foreground">New restaurant?</span>
              </div>
            </div>

            <button
              onClick={onSwitchToSignUp}
              className="w-full border-2 border-accent text-accent py-3 rounded-lg font-bold hover:bg-accent/5 transition-colors"
            >
              Register Restaurant
            </button>

            <div className="mt-6 p-4 bg-accent/5 rounded-lg border border-accent/20">
              <p className="text-xs font-semibold text-accent mb-2">DEMO LOGIN:</p>
              <p className="text-xs text-foreground">restaurant@demo.com / demo123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
