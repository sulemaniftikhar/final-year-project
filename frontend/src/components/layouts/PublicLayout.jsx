import Navbar from "../Navbar"

export default function PublicLayout({
    children,
    onCustomerClick,
    onRestaurantClick,
    onLoginClick,
    onSignUpClick,
    onAdminClick
}) {
    return (
        <div className="min-h-screen bg-background">
            <Navbar
                onCustomerClick={onCustomerClick}
                onRestaurantClick={onRestaurantClick}
                onLoginClick={onLoginClick}
                onSignUpClick={onSignUpClick}
                onAdminClick={onAdminClick}
            />
            {children}
        </div>
    )
}
