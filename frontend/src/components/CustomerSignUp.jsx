// Customer Sign Up Page - Modern split-screen design
// Reference: SRS 3.2.1 - User Account and Authentication (FR-02)

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { auth, db } from "@/lib/firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { setDoc, doc } from "firebase/firestore"
import { sendWelcomeCustomerEmail } from "@/lib/emailAPI"
import { toast } from "sonner"
import { isValidEmail, getPasswordStrength } from "@/lib/validation"
import { Icon } from "@iconify/react"

export default function CustomerSignUp({ onBack, onSwitchToSignIn, onSignupSuccess }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    countryCode: "+1",
    phone: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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

  const passwordInfo = getPasswordStrength(formData.password)

  const validateForm = () => {
    const newErrors = {}
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!isValidEmail(formData.email)) newErrors.email = "Invalid email format"
    if (!formData.countryCode) newErrors.countryCode = "Country code is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone is required"
    else if (!/^\d{6,15}$/.test(formData.phone)) newErrors.phone = "Phone must be numeric (6-15 digits)"
    if (!formData.password.trim()) newErrors.password = "Password is required"
    else if (formData.password.length < 8) newErrors.password = "Must be at least 8 characters"
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
      await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = auth.currentUser

      if (user) {
        const fullPhone = `${formData.countryCode}${formData.phone}`
        await setDoc(doc(db, "users", user.uid), {
          email: formData.email,
          name: formData.fullName,
          phone: fullPhone,
          role: "customer",
          createdAt: new Date().toISOString(),
        })
      }

      try {
        await sendWelcomeCustomerEmail(formData.email, formData.fullName)
        toast.success("Welcome email sent!")
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError)
      }

      const userData = {
        id: user.uid,
        email: formData.email,
        role: "customer",
        name: formData.fullName,
        phone: `${formData.countryCode}${formData.phone}`,
        isAuthenticated: true,
      }
      login(userData)
      toast.success("Account created successfully!")
      if (onSignupSuccess) {
        onSignupSuccess("customer")
      }
    } catch (error) {
      console.error("Customer sign-up error:", error.message)
      toast.error(error.message)
      setErrors({ submit: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4 lg:px-10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 text-primary flex items-center justify-center bg-background rounded-lg p-1.5">
            <Icon icon="lucide:bar-chart-2" className="w-full h-full" />
          </div>
          <h2 className="text-foreground text-xl font-bold leading-tight tracking-tight">OrderIQ</h2>
        </div>
        <button
          onClick={onBack}
          className="flex min-w-[84px] items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-background hover:bg-muted transition-colors text-foreground text-sm font-bold"
        >
          <span className="truncate">Back to OrderIQ</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row">
        {/* Left Column: Hero/Marketing */}
        <div className="lg:w-5/12 xl:w-1/2 p-6 lg:p-12 xl:p-20 flex flex-col justify-center bg-background relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 10% 20%, #2bee79 0%, transparent 20%), radial-gradient(circle at 90% 80%, #2bee79 0%, transparent 20%)' }}></div>

          <div className="relative z-10 max-w-lg mx-auto lg:mx-0">
            <h1 className="text-foreground tracking-tight text-4xl lg:text-5xl font-bold leading-tight mb-8">
              Join OrderIQ Today
            </h1>

            <div className="flex flex-col gap-4">
              {/* Feature 1 */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border shadow-sm">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Icon icon="lucide:rocket" className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Quick Setup</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">Get started in minutes. No credit card required for trial.</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border shadow-sm">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Icon icon="lucide:lock" className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Secure Payment</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">Your data is encrypted and safe with us. We prioritize privacy.</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border shadow-sm">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Icon icon="lucide:sparkles" className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Personalized Experience</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">AI-driven recommendations tailored just for your taste buds.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sign Up Form */}
        <div className="lg:w-7/12 xl:w-1/2 bg-card flex flex-col justify-center p-6 lg:p-12 xl:p-20 border-l border-border">
          <div className="max-w-[560px] mx-auto w-full">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Create your account</h2>
              <p className="text-muted-foreground">Fill in your details below to get started with OrderIQ.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Full Name */}
              <label className="flex flex-col w-full">
                <span className="text-foreground text-sm font-medium leading-normal pb-2 ml-1">Full Name</span>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="form-input flex w-full rounded-xl border border-border bg-background px-5 h-14 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                  placeholder="e.g. Jane Doe"
                />
                {errors.fullName && <span className="text-destructive text-xs font-medium mt-1.5 ml-1">{errors.fullName}</span>}
              </label>

              {/* Email */}
              <label className="flex flex-col w-full">
                <span className="text-foreground text-sm font-medium leading-normal pb-2 ml-1">Email Address</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input flex w-full rounded-xl border border-border bg-background px-5 h-14 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                  placeholder="jane@example.com"
                />
                {errors.email && <span className="text-destructive text-xs font-medium mt-1.5 ml-1">{errors.email}</span>}
              </label>

              {/* Phone Number with Country Code */}
              <label className="flex flex-col w-full">
                <span className="text-foreground text-sm font-medium leading-normal pb-2 ml-1">Phone Number</span>
                <div className="flex gap-3">
                  <div className="relative w-28">
                    <select
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleInputChange}
                      className="appearance-none w-full h-14 rounded-xl border border-border bg-background px-4 text-base text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
                    >
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+92">🇵🇰 +92</option>
                      <option value="+61">🇦🇺 +61</option>
                      <option value="+49">🇩🇪 +49</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-foreground">
                      <Icon icon="lucide:chevron-down" className="w-4 h-4" />
                    </div>
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-input flex-1 w-full rounded-xl border border-border bg-background px-5 h-14 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    placeholder="(555) 000-0000"
                  />
                </div>
                {errors.phone && <span className="text-destructive text-xs font-medium mt-1.5 ml-1">{errors.phone}</span>}
              </label>

              {/* Password */}
              <div className="flex flex-col w-full">
                <label className="flex flex-col w-full">
                  <span className="text-foreground text-sm font-medium leading-normal pb-2 ml-1">Password</span>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="form-input flex w-full rounded-xl border border-border bg-background px-5 h-14 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all pr-12"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Icon icon={showPassword ? "lucide:eye" : "lucide:eye-off"} />
                    </button>
                  </div>
                </label>
                {errors.password && <span className="text-destructive text-xs font-medium mt-1.5 ml-1">{errors.password}</span>}

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-3 px-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-muted-foreground">Strength</span>
                      <span className={`text-xs font-bold ${passwordInfo.color}`}>{passwordInfo.label}</span>
                    </div>
                    <div className="flex gap-2 h-1.5 w-full">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-full flex-1 rounded-full ${i <= Math.ceil(passwordInfo.pct / 25) ? passwordInfo.color : 'bg-border'
                            }`}
                        ></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <label className="flex flex-col w-full">
                <span className="text-foreground text-sm font-medium leading-normal pb-2 ml-1">Confirm Password</span>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="form-input flex w-full rounded-xl border border-border bg-background px-5 h-14 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Icon icon={showConfirmPassword ? "lucide:eye" : "lucide:eye-off"} />
                  </button>
                </div>
                {errors.confirmPassword && <span className="text-destructive text-xs font-medium mt-1.5 ml-1">{errors.confirmPassword}</span>}
              </label>

              {/* Actions */}
              <div className="flex flex-col gap-4 mt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center overflow-hidden rounded-full h-14 px-6 bg-primary hover:brightness-110 text-primary-foreground text-base font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </button>
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={onSwitchToSignIn}
                    className="text-foreground font-bold hover:underline decoration-primary decoration-2 underline-offset-4"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
