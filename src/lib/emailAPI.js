// Email API Helper for Frontend
// Use this to send emails from your React components

const EMAIL_SERVICE_URL = "http://localhost:8080";

export const sendEmail = async (type, to, details) => {
  try {
    const response = await fetch(EMAIL_SERVICE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type,
        to,
        details,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to send email");
    }

    return result;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};

// Specific email functions for easy use

export const sendOrderConfirmationEmail = async (customerEmail, orderDetails) => {
  return sendEmail("orderConfirmation", customerEmail, orderDetails);
};

export const sendOrderStatusEmail = async (customerEmail, orderId, status) => {
  return sendEmail("orderStatusUpdate", customerEmail, { orderId, status });
};

export const sendRestaurantApprovalEmail = async (restaurantEmail, restaurantName, approved) => {
  return sendEmail("restaurantApproval", restaurantEmail, { restaurantName, approved });
};

export const sendWelcomeCustomerEmail = async (customerEmail, customerName) => {
  return sendEmail("welcomeCustomer", customerEmail, { customerName });
};

export const sendWelcomeRestaurantEmail = async (restaurantEmail, restaurantName) => {
  return sendEmail("welcomeRestaurant", restaurantEmail, { restaurantName });
};
