const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const expressValidator = require("express-validator");
require("dotenv").config();

//require routes
const userRoutes = require("./routes/user");
const deviceRoutes = require("./routes/device");
const paytmRoutes = require("./routes/paytm");
const razorpayRoutes = require("./routes/razorpay");
const trasactionRoutes = require("./routes/transaction");
const withdrawlRequestRoutes = require("./routes/withdrawlReq");
const chargeRoutes = require("./routes/charge");
const hostReqRoutes = require("./routes/hostreq");
const pingRoutes = require("./routes/ping");
const partnerRoutes = require("./routes/partner");
const adminRoutes = require("./routes/admin");

// app
const app = express();

// database
mongoose
  .connect(
    `mongodb+srv://root:${process.env.DATABASE_PWD}@cluster0.nzqly.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("DATABASE CONNECTED");
  })
  .catch((err) => {
    console.log("ERROR CONNECTION DATABSE", err);
  });

// middlewares
app.use(require("morgan")("dev"));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());

// route middlewares
app.use("/api", userRoutes);
app.use("/api/device", deviceRoutes);
app.use("/api/transaction", paytmRoutes);
app.use("/api/razorpay", razorpayRoutes);
app.use("/api/transactions", trasactionRoutes);
app.use("/api/withdrawl", withdrawlRequestRoutes);
app.use("/api/charge", chargeRoutes);
app.use("/api/host", hostReqRoutes);
app.use("/api/partner", partnerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/pg", pingRoutes);

app.get("/", (req, res) => {
  res.send("EVCHARGE BACKEND");
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log("SERVER IS LISTENING ON PORT 8000");
});
