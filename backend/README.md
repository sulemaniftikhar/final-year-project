# OrderIQ Email Service

Backend email service using Node.js and Nodemailer for OrderIQ platform.

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Gmail:**
   - Open `emailService.js`
   - Replace `youremail@gmail.com` with your Gmail address
   - Generate App Password from Google:
     - Go to Google Account → Security
     - Enable 2-Step Verification
     - Go to App Passwords
     - Create new app password for "Mail"
     - Copy the 16-character password
   - Replace `your_app_password` with the generated password

3. **Start the service:**
   ```bash
   npm start
   ```

## Usage in Frontend

Import the email functions in your React components:

```javascript
import { sendOrderConfirmationEmail, sendWelcomeCustomerEmail } from "@/lib/emailAPI";

// Send order confirmation
await sendOrderConfirmationEmail("customer@email.com", {
  orderId: "ORD123",
  restaurantName: "Pizza Palace",
  total: 25.99,
  estimatedTime: "30 mins"
});

// Send welcome email
await sendWelcomeCustomerEmail("newuser@email.com", "John Doe");
```

## Email Types

1. **Order Confirmation** - Sent when customer places order
2. **Order Status Update** - Sent when order status changes (preparing, out for delivery, delivered)
3. **Restaurant Approval** - Sent when admin approves/rejects restaurant
4. **Welcome Customer** - Sent when customer signs up
5. **Welcome Restaurant** - Sent when restaurant signs up

## Integration Points

### Customer Sign Up
File: `components/CustomerSignUp.jsx`
```javascript
import { sendWelcomeCustomerEmail } from "@/lib/emailAPI";

// After successful signup
await sendWelcomeCustomerEmail(email, fullName);
```

### Restaurant Sign Up
File: `components/RestaurantSignUp.jsx`
```javascript
import { sendWelcomeRestaurantEmail } from "@/lib/emailAPI";

// After successful signup
await sendWelcomeRestaurantEmail(email, restaurantName);
```

### Place Order
File: `components/dashboards/CustomerDashboard.jsx`
```javascript
import { sendOrderConfirmationEmail } from "@/lib/emailAPI";

// After placing order
await sendOrderConfirmationEmail(user.email, {
  orderId: newOrder.id,
  restaurantName: restaurant.name,
  total: totalAmount,
  estimatedTime: "30-45 mins"
});
```

### Order Status Update
File: `components/dashboards/RestaurantDashboard.jsx`
```javascript
import { sendOrderStatusEmail } from "@/lib/emailAPI";

// When updating order status
await sendOrderStatusEmail(order.customerEmail, order.id, "Out for Delivery");
```

### Restaurant Approval
File: `components/dashboards/AdminDashboard.jsx`
```javascript
import { sendRestaurantApprovalEmail } from "@/lib/emailAPI";

// When approving restaurant
await sendRestaurantApprovalEmail(restaurant.email, restaurant.name, true);
```

## Running Both Services

**Terminal 1 - Frontend (React + Vite):**
```bash
npm run dev
```

**Terminal 2 - Backend (Email Service):**
```bash
cd backend
npm start
```

## Port Configuration

- Frontend: http://localhost:3000
- Email Service: http://localhost:8080

## Important Notes

- The backend has its own `node_modules` folder - this is **intentional**
- This is a separate microservice with its own dependencies
- Do not delete the backend's node_modules - it's not a redundancy

