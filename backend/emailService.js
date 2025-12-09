const http = require("http");
const nodemailer = require("nodemailer");
const url = require("url");

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
      user: "realorderiq@gmail.com",
      pass: "pysv awtj lepn dchy",
    },
  });
};

// Email templates for different scenarios
const emailTemplates = {
  orderConfirmation: (orderDetails) => ({
    subject: "Order Confirmed - OrderIQ",
    html: `
      <h2>Your Order Has Been Confirmed!</h2>
      <p>Order ID: <strong>${orderDetails.orderId}</strong></p>
      <p>Restaurant: ${orderDetails.restaurantName}</p>
      <p>Total: $${orderDetails.total}</p>
      <p>Estimated Delivery: ${orderDetails.estimatedTime}</p>
      <p>Thank you for using OrderIQ!</p>
    `,
  }),

  orderStatusUpdate: (status, orderId) => ({
    subject: `Order ${status} - OrderIQ`,
    html: `
      <h2>Order Status Update</h2>
      <p>Your order <strong>#${orderId}</strong> is now: <strong>${status}</strong></p>
      <p>Track your order on OrderIQ dashboard.</p>
    `,
  }),

  restaurantApproval: (restaurantName, approved) => ({
    subject: approved ? "Restaurant Approved - OrderIQ" : "Restaurant Application Update",
    html: approved
      ? `
        <h2>Congratulations!</h2>
        <p>Your restaurant <strong>${restaurantName}</strong> has been approved.</p>
        <p>You can now start accepting orders on OrderIQ.</p>
      `
      : `
        <h2>Application Status</h2>
        <p>Thank you for your interest in joining OrderIQ.</p>
        <p>We'll review your application and get back to you soon.</p>
      `,
  }),

  welcomeCustomer: (customerName) => ({
    subject: "Welcome to OrderIQ!",
    html: `
      <h2>Welcome ${customerName}!</h2>
      <p>Thank you for joining OrderIQ.</p>
      <p>Start exploring restaurants and place your first order today!</p>
    `,
  }),

  welcomeRestaurant: (restaurantName) => ({
    subject: "Welcome to OrderIQ - Restaurant Partner",
    html: `
      <h2>Welcome ${restaurantName}!</h2>
      <p>Your restaurant is now part of OrderIQ family.</p>
      <p>Set up your menu and start receiving orders!</p>
    `,
  }),

  otpVerification: (otp) => ({
    subject: "Your OrderIQ Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2563eb; text-align: center;">Email Verification</h2>
          <p style="font-size: 16px; color: #333;">Your verification code for OrderIQ is:</p>
          <div style="background-color: #eff6ff; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #2563eb; font-size: 36px; letter-spacing: 10px; margin: 0;">${otp}</h1>
          </div>
          <p style="font-size: 14px; color: #666;">This code will expire in 10 minutes.</p>
          <p style="font-size: 14px; color: #666;">If you didn't request this code, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">OrderIQ - AI-Powered Food Ordering System</p>
        </div>
      </div>
    `,
  }),
};

// HTTP Server to handle email requests
const server = http.createServer((request, response) => {
  // Enable CORS
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") {
    response.writeHead(200);
    response.end();
    return;
  }

  // GET request - Show service status
  if (request.method === "GET") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({
      status: "running",
      service: "OrderIQ Email Service",
      port: 8080,
      endpoints: {
        "POST /": "Send email (requires type, to, details in body)"
      },
      emailTypes: [
        "orderConfirmation",
        "orderStatusUpdate",
        "restaurantApproval",
        "welcomeCustomer",
        "welcomeRestaurant"
      ]
    }));
    return;
  }

  if (request.method === "POST") {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk.toString();
    });

    request.on("end", () => {
      try {
        const data = JSON.parse(body);
        const { type, to, details } = data;

        const auth = createTransporter();
        let emailContent;

        // Select email template based on type
        switch (type) {
          case "orderConfirmation":
            emailContent = emailTemplates.orderConfirmation(details);
            break;
          case "orderStatusUpdate":
            emailContent = emailTemplates.orderStatusUpdate(details.status, details.orderId);
            break;
          case "restaurantApproval":
            emailContent = emailTemplates.restaurantApproval(details.restaurantName, details.approved);
            break;
          case "welcomeCustomer":
            emailContent = emailTemplates.welcomeCustomer(details.customerName);
            break;
          case "welcomeRestaurant":
            emailContent = emailTemplates.welcomeRestaurant(details.restaurantName);
            break;
          case "otpVerification":
            emailContent = emailTemplates.otpVerification(details.otp);
            break;
          default:
            response.writeHead(400, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ error: "Invalid email type" }));
            return;
        }

        const mailOptions = {
          from: "RealOrderIQ@gmail.com", // Replace with your email
          to: to,
          subject: emailContent.subject,
          html: emailContent.html,
        };

        auth.sendMail(mailOptions, (error, emailResponse) => {
          if (error) {
            console.error("Email error:", error);
            response.writeHead(500, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ error: "Failed to send email", details: error.message }));
          } else {
            console.log("Email sent successfully to:", to);
            response.writeHead(200, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ success: true, message: "Email sent successfully" }));
          }
        });
      } catch (error) {
        console.error("Request parsing error:", error);
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ error: "Invalid request body" }));
      }
    });
  } else {
    response.writeHead(405, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Method not allowed" }));
  }
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Email Service running on http://localhost:${PORT}`);
  console.log("Ready to send emails for OrderIQ");
});
