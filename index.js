require("dotenv").config();
const express = require("express");
const cors = require("cors");
const PORT = process.env.PORT || 5000;

// create app:
const app = express();
// set cors to give the access from any port:
app.use(cors());
// set the middleware to read the form data and json data from request body:
app.use(express.json());
app.use(express.urlencoded({ extended: true}));


// home route
app.get("/", (req, res) => {
    res.status(200).json({
        status:200,
        server: "running",
        message:"Welcome to the assigment-11 server"
    });
})


// connect the app to the port
app.listen(PORT, () => {
    console.log(`The server is running at http://localhsot:${ PORT }`);
});