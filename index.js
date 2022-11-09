require("dotenv").config();
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
        app.get("/services", async (req, res) => {
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
        app.get("/reviews", async (req, res) => {
            const query = {};
            const reviews = await userreviewColl.find(query).toArray();
            res.status(200).send(reviews);
        });
        // update review:
        app.patch("/review/update", async(req, res) => {
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
        app.get("/reviews/:id", async (req, res) => {
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