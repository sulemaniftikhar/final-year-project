import Navbar from "../Navbar"

export default function PublicLayout({
    children,
    onCustomerClick,
    onRestaurantClick,
    onLoginClick,
    onSignUpClick,
    onAdminClick,
    searchQuery,
    onSearchChange
}) {
    return (
        <div className="min-h-screen bg-background">
            <Navbar
                onCustomerClick={onCustomerClick}
                onRestaurantClick={onRestaurantClick}
                onLoginClick={onLoginClick}
                onSignUpClick={onSignUpClick}
                onAdminClick={onAdminClick}
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
            />
            {children}
        </div>
    )
}
