//wsW4977n401ML1qC

const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use("/",(req, res, next) => {
    res.send("It is running");
})

mongoose.connect("mongodb+srv://admin:wsW4977n401ML1qC@schoolmanagementsystem.pokpet9.mongodb.net/")
.then(() => console.log("Connected to MongoDB"))
.then(() => {
    app.listen(5000);
})
.catch((err) => console.log(err));