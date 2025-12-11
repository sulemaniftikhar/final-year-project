// Restaurant Sign In Page - Modern split-screen design
// Reference: SRS 3.2.1 - User Account and Authentication (FR-02)

import { useState } from "react"
import { isValidEmail } from "@/lib/validation"
import { useAuth } from "@/context/AuthContext"
import { auth, db } from "@/lib/firebase"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { toast } from "sonner"
import { Icon } from "@iconify/react"

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
      await signInWithEmailAndPassword(auth, formData.email, formData.password)
      const user = auth.currentUser

      const userDocRef = doc(db, "users", user.uid)
      const userDoc = await getDoc(userDocRef)

      if (!userDoc.exists()) {
        await auth.signOut()
        toast.error("Account not found. Please sign up first.")
        setErrors({ submit: "Account not found" })
        setIsLoading(false)
        return
      }

      const userDataFromDb = userDoc.data()

      if (userDataFromDb.role !== "restaurant") {
        await auth.signOut()
        toast.error(`This is a ${userDataFromDb.role} account. Please use the ${userDataFromDb.role} sign-in page.`)
        setErrors({ submit: `Wrong login portal. This is a ${userDataFromDb.role} account.` })
        setIsLoading(false)
        return
      }

      toast.success("Restaurant logged in successfully!")

      const userData = {
        id: user.uid,
        email: userDataFromDb.email,
        role: userDataFromDb.role,
        name: userDataFromDb.name || userDataFromDb.ownerName,
        restaurantName: userDataFromDb.restaurantName,
        phone: userDataFromDb.phone,
        address: userDataFromDb.address,
        cuisine: userDataFromDb.cuisine,
      }
      login(userData)
      if (onLoginSuccess) {
        onLoginSuccess("restaurant")
      }
    } catch (error) {
      console.error("Restaurant sign-in error:", error.message)
      toast.error(error.message)
      setErrors({ submit: "Invalid email or password" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-6 py-4 md:px-10 lg:px-40">
        <div className="flex items-center gap-3 text-foreground">
          <div className="flex items-center justify-center text-primary">
            <Icon icon="lucide:utensils-crossed" className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold leading-tight tracking-tight">OrderIQ</h2>
        </div>
        <button
          onClick={onBack}
          className="flex min-w-[84px] items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-transparent hover:bg-muted text-foreground text-sm font-bold transition-colors"
        >
          <Icon icon="lucide:arrow-left" className="mr-2 w-5 h-5" />
          <span className="truncate">Back to OrderIQ</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-10 md:px-10 lg:px-40">
        <div className="w-full max-w-7xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-24 items-center">
            {/* Left Column: Marketing & Welcome */}
            <div className="flex flex-col gap-8 order-2 lg:order-1">
              <div className="flex flex-col gap-4">
                <h1 className="text-foreground text-4xl md:text-5xl font-black leading-tight tracking-tight">
                  Welcome Back,<br />Restaurant Owner!
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-lg">
                  Manage your entire food business from one powerful dashboard. Streamline operations and boost your sales today.
                </p>
              </div>

              {/* Feature List */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <Icon icon="lucide:line-chart" className="w-5 h-5" />
                  </div>
                  <span className="text-base font-medium text-foreground">Real-time Analytics & Sales Reports 📊</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <Icon icon="lucide:utensils" className="w-5 h-5" />
                  </div>
                  <span className="text-base font-medium text-foreground">Easy Menu Management 🍔</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <Icon icon="lucide:network" className="w-5 h-5" />
                  </div>
                  <span className="text-base font-medium text-foreground">Multi-channel Orders Integration 🚀</span>
                </div>
              </div>


            </div>

            {/* Right Column: Sign In Form */}
            <div className="flex flex-col order-1 lg:order-2">
              <div className="rounded-2xl bg-card shadow-lg border border-border p-6 md:p-10">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-foreground">Sign in to Dashboard</h2>
                  <p className="text-sm text-muted-foreground mt-2">Enter your details to access your restaurant account.</p>
                </div>

                {/* Demo Credentials Alert */}
                <div className="mb-6 rounded-lg bg-primary/10 border border-primary/20 p-4">
                  <div className="flex gap-3">
                    <Icon icon="lucide:info" className="text-primary shrink-0 mt-0.5" />
                    <div className="text-sm text-foreground">
                      <p className="font-bold">Demo Credentials:</p>
                      <p>Email: <span className="font-mono">owner@cafe.com</span></p>
                      <p>Password: <span className="font-mono">cafe1234</span></p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {/* Email Field */}
                  <label className="flex flex-col gap-2">
                    <span className="text-foreground text-sm font-medium">Email Address</span>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="form-input flex w-full rounded-lg text-foreground focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border bg-background focus:border-primary h-12 px-4 text-base transition-all"
                        placeholder="restaurant@example.com"
                      />
                      {formData.email && isValidEmail(formData.email) && (
                        <Icon icon="lucide:check-circle" className="absolute right-3 top-3 text-primary text-xl pointer-events-none" />
                      )}
                    </div>
                    {errors.email && <span className="text-destructive text-xs font-medium">{errors.email}</span>}
                  </label>

                  {/* Password Field */}
                  <label className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-foreground text-sm font-medium">Password</span>
                      <a href="#" className="text-sm font-medium text-primary hover:underline">
                        Forgot Password?
                      </a>
                    </div>
                    <div className="relative">
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="form-input flex w-full rounded-lg text-foreground focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border bg-background focus:border-primary h-12 px-4 text-base transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                    {errors.password && <span className="text-destructive text-xs font-medium">{errors.password}</span>}
                  </label>

                  {/* Error Message */}
                  {errors.submit && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                      {errors.submit}
                    </div>
                  )}

                  {/* Sign In Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary hover:brightness-110 text-primary-foreground text-base font-bold transition-all shadow-sm mt-2 disabled:opacity-50"
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </button>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-border"></div>
                    <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs uppercase font-bold">Or</span>
                    <div className="flex-grow border-t border-border"></div>
                  </div>

                  {/* Register Button */}
                  <button
                    type="button"
                    onClick={onSwitchToSignUp}
                    className="flex w-full items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-transparent border-2 border-border hover:border-primary hover:text-primary text-foreground text-base font-bold transition-all"
                  >
                    Register Restaurant
                  </button>
                </form>
              </div>

              {/* Footer Links */}
              <div className="mt-8 flex justify-center gap-6 text-sm text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-foreground transition-colors">Help Center</a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
