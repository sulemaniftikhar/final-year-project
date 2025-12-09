
// Auth Choice Page - Users choose Customer or Restaurant when accessing login/signup directly
// Reference: SRS 3.2.1 - User Account and Authentication (FR-02, FR-03)

export default function AuthChoice({ onCustomerChoice, onRestaurantChoice, onBack }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-accent/10 flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
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
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full">
          {/* Title */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-foreground mb-4">How would you like to join?</h1>
            <p className="text-xl text-muted-foreground">Choose your role to get started with OrderIQ</p>
          </div>

          {/* Choice Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Customer Card */}
            <div
              onClick={onCustomerChoice}
              className="group cursor-pointer bg-white rounded-3xl shadow-lg border-2 border-border hover:border-primary hover:shadow-2xl transition-all p-10 transform hover:scale-105"
            >
              <div className="mb-6">
                <div className="text-7xl mb-4 inline-block">👤</div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Customer</h2>
                <p className="text-muted-foreground">Order delicious food from restaurants</p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-foreground">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    />
                  </svg>
                  <span>Browse restaurants</span>
                </div>
                <div className="flex items-center gap-3 text-foreground">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    />
                  </svg>
                  <span>Track orders</span>
                </div>
                <div className="flex items-center gap-3 text-foreground">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    />
                  </svg>
                  <span>Earn loyalty rewards</span>
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground py-3 rounded-xl font-bold text-lg group-hover:opacity-90 transition-opacity">
                Continue as Customer
              </button>
            </div>

            {/* Restaurant Card */}
            <div
              onClick={onRestaurantChoice}
              className="group cursor-pointer bg-white rounded-3xl shadow-lg border-2 border-border hover:border-accent hover:shadow-2xl transition-all p-10 transform hover:scale-105"
            >
              <div className="mb-6">
                <div className="text-7xl mb-4 inline-block">🏪</div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Restaurant</h2>
                <p className="text-muted-foreground">Manage your restaurant on OrderIQ</p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-foreground">
                  <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    />
                  </svg>
                  <span>Manage your menu</span>
                </div>
                <div className="flex items-center gap-3 text-foreground">
                  <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    />
                  </svg>
                  <span>Handle orders</span>
                </div>
                <div className="flex items-center gap-3 text-foreground">
                  <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    />
                  </svg>
                  <span>View analytics</span>
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-accent to-primary text-accent-foreground py-3 rounded-xl font-bold text-lg group-hover:opacity-90 transition-opacity">
                Continue as Restaurant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
