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
const app = express()

// connect databse
await connectDB();

// Middleware
app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

app.get('/', (req, res)=> res.send("server is running"))
app.use('/api/user', userRouter)
app.use('/api/owner', ownerRouter)
app.use('/api/bookings', bookingRouter)
app.use('/api/payments', paymentRouter)
app.use('/api/cars', reviewRoutes)



const PORT = process.env.PORT || 3001;

app.listen(PORT,()=> console.log(`Server running on port ${PORT}`))