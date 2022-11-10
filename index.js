require("dotenv").config();
const jwt=require("jsonwebtoken");
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require("cors");
const PORT = process.env.PORT || 5000;

// create app:
const app = express();
// set cors to give the access from any port:
app.use(cors());
// set the middleware to read the form data and json data from request body:
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// json web token start
function verifyJWT(req, res, next) {
    const auth_header = req.headers.auth_token;
    if(!auth_header){
        return res.status(401).json({message:"unauthorized access! 1"});
    };
    const auth_token = auth_header.split(" ")[1];
    jwt.verify(auth_token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err){
            return res.status(401).send({message:"unauthorized access 2"});
        }
        req.decoded = decoded;
        next(); 
    });

}

// json web token end
// mongodb start
const uri = `mongodb+srv://shamim:${process.env.MONGO_PASSWORD}@cluster0.od9o8tu.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    client.connect(err => {
        if (err) {
            console.log("MongoDb connection failed!");
        } else {
            console.log("MongoDb is connected!");
        };
    });
    const db = client.db('phone-fix');
    const servicesColl = db.collection("services");
    const userreviewColl = db.collection("reviews");
    try {
        // jwt
        app.post("/jwt", (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn:"1h"});
            res.send({token});
        });
        // get all service for services page:
        app.get("/services",async (req, res) => {
            const query = {};
            const services = await servicesColl.find(query).toArray();
            res.status(200).send(services);
        });
        // get all for add-services data
        app.get("/add-service/:email",verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            if( decoded.email !== req.params.email){
                res.status(403).send("Forbidden!");
            };
            const query = {};
            const services = await servicesColl.find(query).toArray();
            res.status(200).send(services);
        });
        // get a single data by _id
        app.get("/services/:id", async (req, res) => {
            const query = { _id: ObjectId(req.params.id) };
            const result = await servicesColl.findOne(query);
            res.status(200).send(result);
        });
        // get three services for home 
        app.get("/home/services", async (req, res) => {
            const query = {};
            const services = await servicesColl.find(query).limit(3).toArray();
            res.status(200).send(services);
        });
        // add single services
        app.post("/add-service", async(req, res) => {
            const newService = req.body;
            const result = await servicesColl.insertOne(newService);
            res.status(200).send(result);
        })
        // update the service by _Id:
        app.put("/service/update/:id", async(req, res) => {
            const query = {_id:ObjectId(req.params.id)};
            const {price, picture, name, description} = req.body;
            const updateDoc = {
                $set: {
                  price: price,
                  picture:picture,
                  name: name,
                  description: description
                }
              };
              console.log(updateDoc);
            const result = await servicesColl.updateOne(query, updateDoc);
            res.status(200).send(result);
        });
        // delete service by _Id
        app.delete("/service/delete/:id", async(req, res) => {
            const query = {_id:ObjectId(req.params.id)};
            const result = await servicesColl.deleteOne(query);
            res.status(200).send(result);
        });

        // for reviews
        app.post("/review", async (req, res) => {
            const userReview = req.body;
            const result = await userreviewColl.insertOne(userReview);
            res.status(200).send(result);
        });
        // get all the reviews
        app.get("/reviews/:email",verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            if(decoded.email !== req.params.email){
                res.status(403).send("Forbidden!");
            };
            const query = {};
            const reviews = await userreviewColl.find(query).toArray();
            res.status(200).send(reviews);
        });
        app.get("/reviews", async(req, res) => {
            const query = {};
            const reviews = await userreviewColl.find(query).toArray();
            res.status(200).send(reviews);
        });
        // update review:
        app.patch("/reviews/update", async(req, res) => {
            const { id, review } = req.body;
            const query = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    review: review
                },
            };
            const result = await userreviewColl.updateOne(query, updateDoc);
            res.status(200).send(result);
        });
        // get a single review by _id:
        app.get("/review/:id", async (req, res) => {
            const query = { _id: ObjectId(req.params.id) };
            const result = await userreviewColl.findOne(query);
            res.status(200).send(result);
        });
        // delete review by id:
        app.delete("/review/delete/:id", async (req, res) => {
            const query = { _id: ObjectId(req.params.id) };
            const result = await userreviewColl.deleteOne(query);
            res.send(result);
        });
        // delete review from my review private route:
        app.delete("/my-review/delete/:id", async (req, res) => {
            const query = { productId: req.params.id };
            const result = await userreviewColl.deleteOne(query);
            res.status(200).send(result);
        });
        // update review from my-review page.
    } finally {
        // client.close(); 
    }
};
run().catch(err => console.log(err));
// mongodb end

// home route
app.get("/", (req, res) => {
    res.status(200).json({
        status: 200,
        server: "running",
        message: "Welcome to the assigment-11 server"
    });
})


// connect the app to the port
app.listen(PORT, () => {
    console.log(`The server is running at http://localhsot:${PORT}`);
});