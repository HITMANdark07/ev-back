const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const expressValidator = require('express-validator');
require('dotenv').config();

//require routes
const userRoutes = require('./routes/user');
const deviceRoutes = require('./routes/device');
const paytmRoutes = require('./routes/paytm');

// app
const app = express();

// database
mongoose.connect(`mongodb+srv://root:${process.env.DATABASE_PWD}@cluster0.nzqly.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(() => {
    console.log("DATABASE CONNECTED");
}).catch((err) => {
    console.log("ERROR CONNECTION DATABSE",err);
})

// middlewares
app.use(require('morgan')('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());


// route middlewares
app.use("/api", userRoutes);
app.use("/api/device",deviceRoutes);
app.use("/api/transaction",paytmRoutes);

app.get("/", (req, res) => {
    res.send("EVCHARGE BACKEND");
})


const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log("SERVER IS LISTENING ON PORT 3000");
})