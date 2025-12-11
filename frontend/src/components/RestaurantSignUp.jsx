// Restaurant Sign Up Page - Modern split-screen design
// Reference: SRS 3.2.1 - User Account and Authentication (FR-01)

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { auth, db } from "@/lib/firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { setDoc, doc } from "firebase/firestore"
import { sendWelcomeRestaurantEmail } from "@/lib/emailAPI"
import { toast } from "sonner"
import { isValidEmail, getPasswordStrength } from "@/lib/validation"
import { saveRestaurant } from "@/lib/supabase";
import { Icon } from "@iconify/react";

export default function RestaurantSignUp({ onBack, onSwitchToSignIn, onSignupSuccess }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    restaurantName: "",
    ownerName: "",
    countryCode: "+1",
    phone: "",
    address: "",
    cuisine: "",
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

  const passwordInfo = getPasswordStrength(formData.password)

  const validateForm = () => {
    const newErrors = {}
    if (!formData.restaurantName.trim()) newErrors.restaurantName = "Restaurant name is required"
    else if (/^\d+$/.test(formData.restaurantName.trim())) newErrors.restaurantName = "Restaurant name cannot be only numbers"

    if (!formData.ownerName.trim()) newErrors.ownerName = "Owner name is required"
    else if (/^\d+$/.test(formData.ownerName.trim())) newErrors.ownerName = "Owner name cannot be only numbers"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!isValidEmail(formData.email)) newErrors.email = "Invalid email format"
    if (!formData.countryCode) newErrors.countryCode = "Country code is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone is required"
    else if (!/^\d{6,15}$/.test(formData.phone)) newErrors.phone = "Phone must be numeric (6-15 digits)"
    if (!formData.address.trim()) newErrors.address = "Address is required"
    if (!formData.cuisine) newErrors.cuisine = "Please select a cuisine type"
    else if (/^\d+$/.test(formData.cuisine.trim())) newErrors.cuisine = "Cuisine type cannot be only numbers"
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
        const fullPhone = `${formData.countryCode}${formData.phone}`;
        await setDoc(doc(db, "users", user.uid), {
          email: formData.email,
          name: formData.ownerName,
          restaurantName: formData.restaurantName,
          phone: fullPhone,
          address: formData.address,
          cuisine: formData.cuisine,
          role: "restaurant",
          createdAt: new Date().toISOString(),
        });

        // Save to Supabase (NEW)
        await saveRestaurant(user.uid, {
          email: formData.email,
          restaurantName: formData.restaurantName,
          ownerName: formData.ownerName,
          phone: fullPhone,
          countryCode: formData.countryCode,
          phoneLocal: formData.phone,
          address: formData.address,
          cuisine: formData.cuisine,
        });
      }

      try {
        await sendWelcomeRestaurantEmail(formData.email, formData.restaurantName)
        toast.success("Welcome email sent!")
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError)
      }

      const userData = {
        id: user.uid,
        email: formData.email,
        role: "restaurant",
        name: formData.ownerName,
        restaurantName: formData.restaurantName,
        phone: `${formData.countryCode}${formData.phone}`,
        address: formData.address,
        cuisine: formData.cuisine,
      }
      login(userData)
      toast.success("Restaurant registered successfully!")
      if (onSignupSuccess) {
        onSignupSuccess("restaurant")
      }
    } catch (error) {
      console.error("Restaurant sign-up error:", error.message)
      toast.error(error.message)
      setErrors({ submit: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-card px-6 lg:px-10 py-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 text-primary">
            <Icon icon="lucide:bar-chart-2" className="w-full h-full" />
          </div>
          <h2 className="text-foreground text-xl font-bold leading-tight tracking-tight">OrderIQ</h2>
        </div>
        <button
          onClick={onBack}
          className="flex min-w-[84px] items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-primary/20 hover:bg-primary/30 text-foreground transition-colors text-sm font-bold"
        >
          <span className="truncate">Back to OrderIQ</span>
        </button>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 justify-center py-8 lg:py-12 px-4 md:px-8">
        <div className="max-w-[1280px] w-full flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* Left Column: Hero / Marketing */}
          <div className="flex flex-col flex-1 lg:max-w-[480px] lg:pt-8 gap-8">
            <div className="flex flex-col gap-4">
              <h1 className="text-foreground text-4xl lg:text-5xl font-black leading-tight tracking-tight">
                Grow Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Restaurant</span>
              </h1>
              <p className="text-muted-foreground text-lg font-normal leading-normal">
                Partner with OrderIQ to unlock exclusive tools and reach thousands of new hungry customers.
              </p>
            </div>

            {/* Value Props */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-card shadow-sm border border-border">
                <span className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-2xl">💰</span>
                <div>
                  <h3 className="font-bold text-foreground">0% Commission</h3>
                  <p className="text-sm text-muted-foreground">Keep all your earnings for the first month</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-card shadow-sm border border-border">
                <span className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-2xl">📈</span>
                <div>
                  <h3 className="font-bold text-foreground">Increase Sales</h3>
                  <p className="text-sm text-muted-foreground">Boost your orders by up to 30%</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-card shadow-sm border border-border">
                <span className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-2xl">🛠️</span>
                <div>
                  <h3 className="font-bold text-foreground">Simple Tools</h3>
                  <p className="text-sm text-muted-foreground">Manage menus and orders easily</p>
                </div>
              </div>
            </div>

            {/* Success Story Image */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg mt-4 group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
              <div className="absolute bottom-4 left-4 right-4 z-20 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Icon icon="lucide:badge-check" className="text-primary" />
                  <span className="font-bold text-sm tracking-wide uppercase">Success Story</span>
                </div>
                <p className="font-medium">"OrderIQ transformed our takeout business overnight!"</p>
              </div>
              <img
                alt="Restaurant Owner"
                className="object-cover w-full h-full transform transition-transform duration-700 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCllNN21pVZ3c7Rqv7p74Qcvc5dEMlv3emjSLKIsEAf_BdmP9guFJZkV_erQVVfBaUNjRhmci4NMvAvbQnxfiZuzsVikjHlI-6CZ_NcjWQ5aNu8h5pSmPbJe8D2d5Qd3kCU68FsDGMLjsInwarv9UAL9Buswj7lJETkezZD_sfhBBJG9bMObYMJhN5Dtk5L6kaRp_xG3X8kHzysoyyKyXL07BWGY2gINtLytEMRJRyoujy_M8HAAd4zrjXFCf2qsjn4br9I9suKIL0h"
              />
            </div>
          </div>

          {/* Right Column: Sign Up Form */}
          <div className="flex flex-col flex-1 w-full max-w-[640px] lg:mt-0">
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 lg:p-10 shadow-sm">
              <div className="mb-8">
                <h2 className="text-foreground text-2xl md:text-3xl font-bold leading-tight mb-2">Create your partner account</h2>
                <p className="text-muted-foreground">Fill in your details to get started.</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Row 1 */}
                <div className="flex flex-col md:flex-row gap-5">
                  <label className="flex flex-col flex-1 gap-2">
                    <span className="text-foreground text-sm font-medium">Restaurant Name</span>
                    <input
                      type="text"
                      name="restaurantName"
                      value={formData.restaurantName}
                      onChange={handleInputChange}
                      className="form-input w-full rounded-xl border border-border bg-background text-foreground h-12 px-4 placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      placeholder="Tasty Bites"
                    />
                    {errors.restaurantName && <span className="text-destructive text-xs font-medium">{errors.restaurantName}</span>}
                  </label>
                  <label className="flex flex-col flex-1 gap-2">
                    <span className="text-foreground text-sm font-medium">Owner Name</span>
                    <input
                      type="text"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleInputChange}
                      className="form-input w-full rounded-xl border border-border bg-background text-foreground h-12 px-4 placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      placeholder="John Doe"
                    />
                    {errors.ownerName && <span className="text-destructive text-xs font-medium">{errors.ownerName}</span>}
                  </label>
                </div>

                {/* Row 2 */}
                <div className="flex flex-col md:flex-row gap-5">
                  <label className="flex flex-col flex-1 gap-2">
                    <span className="text-foreground text-sm font-medium">Work Email</span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input w-full rounded-xl border border-border bg-background text-foreground h-12 px-4 placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      placeholder="contact@restaurant.com"
                    />
                    {errors.email && <span className="text-destructive text-xs font-medium">{errors.email}</span>}
                  </label>
                  <label className="flex flex-col flex-1 gap-2">
                    <span className="text-foreground text-sm font-medium">Phone Number</span>
                    <div className="flex gap-2">
                      <select
                        name="countryCode"
                        value={formData.countryCode}
                        onChange={handleInputChange}
                        className="form-select w-[100px] rounded-xl border border-border bg-background text-foreground h-12 pl-3 pr-8 focus:border-primary focus:ring-1 focus:ring-primary"
                      >
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+92">🇵🇰 +92</option>
                        <option value="+61">🇦🇺 +61</option>
                      </select>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="form-input flex-1 rounded-xl border border-border bg-background text-foreground h-12 px-4 placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        placeholder="(555) 000-0000"
                      />
                    </div>
                    {errors.phone && <span className="text-destructive text-xs font-medium">{errors.phone}</span>}
                  </label>
                </div>

                {/* Row 3 */}
                <div className="flex flex-col md:flex-row gap-5">
                  <label className="flex flex-col flex-1 gap-2">
                    <span className="text-foreground text-sm font-medium">Cuisine Type</span>
                    <select
                      name="cuisine"
                      value={formData.cuisine}
                      onChange={handleInputChange}
                      className="form-select w-full rounded-xl border border-border bg-background text-foreground h-12 px-4 focus:border-primary focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Select cuisine...</option>
                      <option>Italian</option>
                      <option>American</option>
                      <option>Japanese</option>
                      <option>Mexican</option>
                      <option>Indian</option>
                      <option>Pakistani</option>
                      <option>Chinese</option>
                      <option>Fast Food</option>
                      <option>Other</option>
                    </select>
                    {errors.cuisine && <span className="text-destructive text-xs font-medium">{errors.cuisine}</span>}
                  </label>
                  <label className="flex flex-col flex-[1.5] gap-2">
                    <span className="text-foreground text-sm font-medium">Restaurant Address</span>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="form-input w-full rounded-xl border border-border bg-background text-foreground h-12 px-4 placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      placeholder="123 Main St, City"
                    />
                    {errors.address && <span className="text-destructive text-xs font-medium">{errors.address}</span>}
                  </label>
                </div>

                {/* Row 4: Password */}
                <div className="flex flex-col gap-5 border-t border-border pt-5 mt-2">
                  <div className="flex flex-col md:flex-row gap-5">
                    <label className="flex flex-col flex-1 gap-2">
                      <span className="text-foreground text-sm font-medium">Create Password</span>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="form-input w-full rounded-xl border border-border bg-background text-foreground h-12 px-4 placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        placeholder="••••••••"
                      />
                      {errors.password && <span className="text-destructive text-xs font-medium">{errors.password}</span>}
                    </label>
                    <label className="flex flex-col flex-1 gap-2">
                      <span className="text-foreground text-sm font-medium">Confirm Password</span>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`form-input w-full rounded-xl border ${errors.confirmPassword ? 'border-destructive bg-destructive/10' : 'border-border bg-background'} text-foreground h-12 px-4 placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-colors`}
                        placeholder="••••••••"
                      />
                      {errors.confirmPassword && <span className="text-destructive text-xs font-medium">{errors.confirmPassword}</span>}
                    </label>
                  </div>

                  {/* Password Strength */}
                  {formData.password && (
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground font-medium">
                          Password Strength: <span className={passwordInfo.color}>{passwordInfo.label}</span>
                        </span>
                      </div>
                      <div className="flex gap-2 h-1.5 w-full">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-full w-1/4 rounded-full ${i <= Math.ceil(passwordInfo.pct / 25) ? passwordInfo.color : 'bg-border'
                              }`}
                          ></div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Use 8 or more characters with a mix of letters, numbers & symbols.
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-4 mt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-primary hover:brightness-110 text-primary-foreground text-base font-bold transition-all transform active:scale-[0.98] disabled:opacity-50"
                  >
                    {isLoading ? "Registering..." : "Register Restaurant"}
                  </button>
                  <p className="text-center text-foreground text-sm font-medium">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={onSwitchToSignIn}
                      className="text-primary hover:underline font-bold ml-1"
                    >
                      Sign In
                    </button>
                  </p>
                </div>

                {/* Terms */}
                <p className="text-center text-xs text-muted-foreground mt-2">
                  By clicking "Register Restaurant", you agree to our{" "}
                  <a className="underline" href="#">Terms</a> and{" "}
                  <a className="underline" href="#">Privacy Policy</a>.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
