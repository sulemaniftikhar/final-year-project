
// Customer Sign Up Page - Stylish modern design
// Reference: SRS 3.2.1 - User Account and Authentication (FR-01)

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { auth, db } from "@/lib/firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { setDoc, doc } from "firebase/firestore"
import { sendWelcomeCustomerEmail } from "@/lib/emailAPI"
import { toast } from "sonner"

export default function CustomerSignUp({ onBack, onSwitchToSignIn, onSignupSuccess }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
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

  const validateForm = () => {
    const newErrors = {}
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format"
    if (!formData.phone.trim()) newErrors.phone = "Phone is required"
    if (!formData.password.trim()) newErrors.password = "Password is required"
    else if (formData.password.length < 6) newErrors.password = "Must be at least 6 characters"
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match"
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
      // Register user with Firebase
      await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = auth.currentUser
      
      // Save user data to Firestore
      if (user) {
        await setDoc(doc(db, "users", user.uid), {
          email: formData.email,
          fullName: formData.fullName,
          phone: formData.phone,
          role: "customer",
          createdAt: new Date().toISOString(),
        })
      }
      
      // Send welcome email
      try {
        await sendWelcomeCustomerEmail(formData.email, formData.fullName)
        toast.success("Welcome email sent!")
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError)
        // Don't block signup if email fails
      }

      // Create user data object
      const userData = {
        id: user.uid,
        email: formData.email,
        role: "customer",
        name: formData.fullName,
        phone: formData.phone,
        isAuthenticated: true,
      }
      login(userData)
      if (onSignupSuccess) {
        onSignupSuccess("customer")
      }
    } catch (error) {
      console.error("Customer sign-up error:", error.message)
      setErrors({ submit: error.message })
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
              Join <span className="text-primary">OrderIQ</span> Today
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Create an account to start ordering delicious food from the best restaurants.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🚀</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Quick Setup</h3>
                  <p className="text-sm text-muted-foreground">Get started in less than a minute</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💳</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Secure Payment</h3>
                  <p className="text-sm text-muted-foreground">Your data is encrypted and secure</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Personalized Experience</h3>
                  <p className="text-sm text-muted-foreground">Recommendations based on your taste</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-border">
            <h2 className="text-3xl font-bold text-foreground mb-2">Create Account</h2>
            <p className="text-muted-foreground mb-8">Fill in your details to get started</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-primary transition-colors ${
                    errors.fullName ? "border-destructive" : "border-border"
                  } bg-background`}
                />
                {errors.fullName && <p className="text-destructive text-sm mt-1">{errors.fullName}</p>}
              </div>

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
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="03001234567"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-primary transition-colors ${
                    errors.phone ? "border-destructive" : "border-border"
                  } bg-background`}
                />
                {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone}</p>}
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

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-primary transition-colors ${
                    errors.confirmPassword ? "border-destructive" : "border-border"
                  } bg-background`}
                />
                {errors.confirmPassword && <p className="text-destructive text-sm mt-1">{errors.confirmPassword}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground py-3 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 mt-6"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-muted-foreground">Already have account?</span>
              </div>
            </div>

            {/* Sign In Link */}
            <button
              onClick={onSwitchToSignIn}
              className="w-full border-2 border-primary text-primary py-3 rounded-lg font-bold hover:bg-primary/5 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
