const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
var jwt = require('jsonwebtoken');


// middleware 
app.use(cors())
app.use(express.json());

//jwt verify
const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ error: true, message: 'unauthorized access' });
    }

    // bearer token
    const token = authorization.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: true, message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
    })
}



// console.log(process.env.DB_USER)
// console.log(process.env.DB_PASS)



// const uri = `mongodb+srv://petAdoptation:UEyiTAzzNamRuuKF@cluster0.1gxcng8.mongodb.net/?retryWrites=true&w=majority`;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1gxcng8.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const categoryCollection = client.db("petAdoptation").collection("category");
        const petsCollection = client.db("petAdoptation").collection("pets");
        const adoptPetsCollection = client.db("petAdoptation").collection("adoptPets");
        const createDonationCollection = client.db("petAdoptation").collection("createDonation");


        app.post('/createdonation', async (req, res) => {
            const item = req.body;
            const result = await createDonationCollection.insertOne(item);
            res.send(result);
        });

        app.get('/createdonation', async (req, res) => {
            const cursor = createDonationCollection.find().sort({ date: -1 });
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/createdonation/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await createDonationCollection.findOne(query);
            res.send(result);
        })

        // post Adopt pets
        app.post('/adoptPets', async (req, res) => {
            const item = req.body;
            const result = await adoptPetsCollection.insertOne(item);
            res.send(result);
        });

        app.get('/adoptPets', async (req, res) => {
            const cursor = adoptPetsCollection.find()
            const result = await cursor.toArray();
            res.send(result);
        })

        // pets api
        app.post('/pets', async (req, res) => {
            const item = req.body;
            const result = await petsCollection.insertOne(item);
            res.send(result);
        });

        app.get('/pets', async (req, res) => {
            const cursor = petsCollection.find().sort({ date: -1 });
            const result = await cursor.toArray();
            res.send(result);
        });
        app.get('/pets/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await petsCollection.findOne(query);
            res.send(result);
        });

        // category api
        app.get('/category', async (req, res) => {
            const cursor = categoryCollection.find()
            const result = await cursor.toArray();
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('pet-adoptation server is running.....')
})

app.listen(port, () => {
    console.log(`pet-adoptation Server is running on port : ${port}`)
})
