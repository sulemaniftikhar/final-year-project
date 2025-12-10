
// Customer Sign In Page - Stylish modern design
// Reference: SRS 3.2.1 - User Account and Authentication (FR-02)

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { auth } from "@/lib/firebase"
import { signInWithEmailAndPassword } from "firebase/auth"
import { toast } from "sonner"
import { isValidEmail } from "@/lib/validation"

export default function CustomerSignIn({ onBack, onSwitchToSignUp, onLoginSuccess }) {
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
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format"
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
      // Sign in user with Firebase
      await signInWithEmailAndPassword(auth, formData.email, formData.password)
      const user = auth.currentUser
      
      // Show success toast
      toast.success("User logged in successfully!", {
        position: "top-center",
      })

      // Create user data object
      const userData = {
        id: user.uid,
        email: formData.email,
        role: "customer",
        name: user.displayName || formData.email.split("@")[0],
        isAuthenticated: true,
      }
      login(userData)
      if (onLoginSuccess) {
        onLoginSuccess("customer")
      }
    } catch (error) {
      console.error("Customer sign-in error:", error.message)
      toast.error(error.message, {
        position: "top-center",
      })
      setErrors({ submit: "Invalid email or password" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-accent/5">
      {/* Header with Back Button */}
      <div className="border-b border-border bg-white sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to OrderIQ
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Hero Content */}
          <div className="hidden md:block">
            <h1 className="text-5xl font-bold text-foreground mb-6">
              Welcome Back, <span className="text-primary">Foodie!</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Sign in to your account and discover amazing restaurants waiting to serve you.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🍽️</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Fast Ordering</h3>
                  <p className="text-sm text-muted-foreground">Order from your favorite restaurants in seconds</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⭐</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Loyalty Points</h3>
                  <p className="text-sm text-muted-foreground">Earn rewards on every order</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎁</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Exclusive Deals</h3>
                  <p className="text-sm text-muted-foreground">Access special offers and discounts</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-border">
            <h2 className="text-3xl font-bold text-foreground mb-2">Sign In</h2>
            <p className="text-muted-foreground mb-8">Enter your details to access your account</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-primary transition-colors ${
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

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-primary transition-colors ${
                    errors.password ? "border-destructive" : "border-border"
                  } bg-background`}
                />
                {errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground py-3 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 mt-6"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-muted-foreground">New to OrderIQ?</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <button
              onClick={onSwitchToSignUp}
              className="w-full border-2 border-primary text-primary py-3 rounded-lg font-bold hover:bg-primary/5 transition-colors"
            >
              Create Account
            </button>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-xs font-semibold text-primary mb-2">DEMO LOGIN:</p>
              <p className="text-xs text-foreground">customer@demo.com / demo123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
