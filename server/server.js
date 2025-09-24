import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRouter.js";
import ownerRouter from "./routes/ownerRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import paymentRouter from "./routes/payment.js";
import reviewRoutes from "./routes/reviewRoutes.js";

// Initialize Express App
const app = express();

// Connect to the database
await connectDB();

// CORS Configuration
const allowed = [
  process.env.FRONTEND_URL || 'http://localhost:5173', // Vite default
  'https://your-site.netlify.app' // Replace later with actual Netlify URL
];

// CORS middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // If you want to send cookies
}));

// Middleware
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

// Test route
app.get('/', (req, res) => res.send("Server is running"));

// API Routes
app.use('/api/user', userRouter);
app.use('/api/owner', ownerRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/cars', reviewRoutes);

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
