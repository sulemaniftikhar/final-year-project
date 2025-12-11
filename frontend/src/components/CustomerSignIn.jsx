// Customer Sign In Page - Modern split-screen design
// Reference: SRS 3.2.1 - User Account and Authentication (FR-02)

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { auth, db } from "@/lib/firebase"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { toast } from "sonner"
import { Icon } from "@iconify/react"

export default function CustomerSignIn({ onBack, onSwitchToSignUp, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
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
      // Sign in customer with Firebase
      await signInWithEmailAndPassword(auth, formData.email, formData.password)
      const user = auth.currentUser

      // Fetch user data from Firestore to verify role
      const userDocRef = doc(db, "users", user.uid)
      const userDoc = await getDoc(userDocRef)

      if (!userDoc.exists()) {
        await auth.signOut()
        toast.error("Account not found. Please sign up first.", {
          position: "top-center",
        })
        setErrors({ submit: "Account not found" })
        setIsLoading(false)
        return
      }

      const userDataFromDb = userDoc.data()

      // Check if user role is customer
      if (userDataFromDb.role !== "customer") {
        await auth.signOut()
        toast.error(`This is a ${userDataFromDb.role} account. Please use the ${userDataFromDb.role} sign-in page.`, {
          position: "top-center",
        })
        setErrors({ submit: `Wrong login portal. This is a ${userDataFromDb.role} account.` })
        setIsLoading(false)
        return
      }

      // Show success toast
      toast.success("Welcome back!", {
        position: "top-center",
      })

      // Create user data object from Firestore data
      const userData = {
        id: user.uid,
        email: userDataFromDb.email,
        role: userDataFromDb.role,
        name: userDataFromDb.name,
        phone: userDataFromDb.phone,
      }
      login(userData)
      if (onLoginSuccess) {
        onLoginSuccess()
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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-6 py-4 lg:px-10 lg:py-5 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 text-primary flex items-center justify-center bg-card rounded-full">
            <Icon icon="lucide:utensils" className="w-5 h-5" />
          </div>
          <h2 className="text-foreground text-xl font-bold tracking-tight">OrderIQ</h2>
        </div>
        <button
          onClick={onBack}
          className="group flex items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-card border border-transparent hover:border-border transition-all text-foreground text-sm font-bold tracking-wide"
        >
          <span className="truncate group-hover:-translate-x-1 transition-transform">Back to OrderIQ</span>
        </button>
      </header>

      {/* Split Layout Content */}
      <main className="flex-1 flex flex-col lg:flex-row">
        {/* Left Column: Hero/Marketing */}
        <div className="lg:w-1/2 p-6 lg:p-12 xl:p-20 flex flex-col justify-center relative overflow-hidden">
          {/* Decorative Background Blob */}
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="relative z-10 max-w-lg mx-auto lg:mx-0">
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6 text-foreground">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Foodie!</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              Log in to access your saved favorites, track your orders in real-time, and unlock exclusive tasty rewards.
            </p>

            {/* Feature List */}
            <div className="grid gap-4">
              {/* Feature 1 */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border shadow-sm transition-transform hover:scale-[1.01]">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary">
                  <Icon icon="lucide:rocket" className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Fast Ordering</h3>
                  <p className="text-sm text-muted-foreground">Get your food in record time.</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border shadow-sm transition-transform hover:scale-[1.01]">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary">
                  <Icon icon="lucide:trophy" className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Loyalty Points</h3>
                  <p className="text-sm text-muted-foreground">Earn points with every bite.</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border shadow-sm transition-transform hover:scale-[1.01]">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary">
                  <Icon icon="lucide:badge-check" className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Exclusive Deals</h3>
                  <p className="text-sm text-muted-foreground">Offers you won't find anywhere else.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:w-1/2 p-6 lg:p-12 xl:p-20 flex flex-col justify-center bg-card border-t lg:border-t-0 lg:border-l border-border">
          <div className="w-full max-w-md mx-auto">
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-3xl font-bold mb-2 text-foreground">Sign In</h2>
              <p className="text-muted-foreground">Please enter your details to continue.</p>
            </div>

            {/* Sign In Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email Field */}
              <label className="block group">
                <span className="block text-sm font-medium text-foreground mb-2 ml-1">Email Address</span>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full h-14 pl-5 pr-12 rounded-full border border-border bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground placeholder:text-muted-foreground transition-all outline-none"
                    placeholder="Enter your email"
                  />
                  <Icon icon="lucide:mail" className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
                {errors.email && <p className="text-xs text-destructive mt-1 ml-1">{errors.email}</p>}
              </label>

              {/* Password Field */}
              <label className="block group">
                <div className="flex justify-between items-center mb-2 ml-1">
                  <span className="text-sm font-medium text-foreground">Password</span>
                  <a href="#" className="text-sm font-bold text-primary hover:underline">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full h-14 pl-5 pr-12 rounded-full border border-border bg-background focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground placeholder:text-muted-foreground transition-all outline-none"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Icon icon={showPassword ? "lucide:eye" : "lucide:eye-off"} />
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive mt-1 ml-1">{errors.password}</p>}
              </label>

              {/* Error Message */}
              {errors.submit && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {errors.submit}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 mt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="h-14 w-full rounded-full bg-primary hover:brightness-110 active:scale-[0.98] text-primary-foreground font-bold text-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{isLoading ? "Signing In..." : "Sign In"}</span>
                  {!isLoading && <Icon icon="lucide:arrow-right" className="w-5 h-5" />}
                </button>
                <button
                  type="button"
                  onClick={onSwitchToSignUp}
                  className="h-14 w-full rounded-full bg-transparent border-2 border-border hover:border-primary text-foreground font-bold text-lg transition-all active:scale-[0.98]"
                >
                  Create Account
                </button>
              </div>
            </form>

            {/* Demo Credentials Box */}
            <div className="mt-8 p-4 rounded-xl bg-primary/10 border border-primary/20 flex gap-3 items-start">
              <Icon icon="lucide:info" className="text-primary shrink-0 mt-0.5" />
              <div className="text-sm text-foreground">
                <p className="font-bold mb-1">Demo Credentials:</p>
                <p className="font-mono bg-primary/20 px-2 py-1 rounded w-fit mb-1 text-xs">
                  Email: demo@orderiq.com
                </p>
                <p className="font-mono bg-primary/20 px-2 py-1 rounded w-fit text-xs">
                  Pass: password123
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
