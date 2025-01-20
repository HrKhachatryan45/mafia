const express = require('express');
require('dotenv').config();
const path = require('path');
const roomRoutes = require('./routes/roomRoutes');
const {app,server} = require('./socket/socket');
const mongoose = require("mongoose");
app.use(express.json());

app.use('/room',roomRoutes)


const __name = path.resolve()

app.use(express.static(path.join(__name, "frontend", "build")));

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("connected to mongoDB")
    server.listen(process.env.PORT || 8080, () => {
        console.log(`Server started on port ${process.env.PORT || 8080}`);
    })
})
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });