// Package require & Use
const express = require('express');
const app = express();
require('dotenv').config()
const session = require('express-session')
const passport = require("passport")

const path = require('path');
const viewPath = path.join(__dirname + '/src/views')

app.set("view engine", "ejs")
app.set('views', viewPath)
app.use(session({ secret: 'fblogintestapi' }));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
// Database conn require
require("./src/Configs/DatabaseConfig")

// Router require ...   sachin
const userRouter = require('./src/Routes/UserRoute');
app.use(userRouter);

// Port open
const port = process.env.port;
app.listen(port, () => {
    console.log(`node application live at ${port} ✅`);
})