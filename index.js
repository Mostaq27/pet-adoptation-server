const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
// var jwt = require('jsonwebtoken');


// middleware 
app.use(cors())
app.use(express.json());

//jwt verify
// const verifyJWT = (req, res, next) => {
//     const authorization = req.headers.authorization;
//     if (!authorization) {
//         return res.status(401).send({ error: true, message: 'unauthorized access' });
//     }

//     // bearer token
//     const token = authorization.split(' ')[1];

//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//         if (err) {
//             return res.status(401).send({ error: true, message: 'unauthorized access' })
//         }
//         req.decoded = decoded;
//         next();
//     })
// }



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
        const usersCollection = client.db("petAdoptation").collection("users");
        const adoptPetsCollection = client.db("petAdoptation").collection("adoptPets");
        const createDonationCollection = client.db("petAdoptation").collection("createDonation");
        const myDonationCollection = client.db("petAdoptation").collection("myDonation");


        app.post('/mydonation', async (req, res) => {
            const item = req.body;
            const result = await myDonationCollection.insertOne(item);
            res.send(result);
        });

        app.get('/mydonation', async (req, res) => {
            const cursor = myDonationCollection.find().sort({ date: -1 });
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/mydonation/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await myDonationCollection.findOne(query);
            res.send(result);
        })

        app.delete('/mydonation/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await myDonationCollection.deleteOne(query);
            res.send(result);
        })

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

        // delete donation campaigns api
        app.delete('/createdonation/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await createDonationCollection.deleteOne(query);
            res.send(result);
        })
        // update donation data id
        app.patch('/createdonation/:id', async (req, res) => {
            const id = req.params.id
            const pet = req.body
            const filter = { _id: new ObjectId(id) }
            // console.log(id,pet)
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: pet.name,
                    maximumAmount: pet.maximumAmount,
                    lastDate: pet.lastDate,
                    short_details: pet.short_details,
                    long_details: pet.long_details,
                    photo: pet.photo,
                    date: pet.date
                },
            };
            const result = await createDonationCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })



        app.patch('/pets/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                  adopted: true
                },
            };
            const result = await petsCollection.updateOne(filter, updateDoc);
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
        // user api
        app.post('/users', async (req, res) => {
            const item = req.body;
            const result = await usersCollection.insertOne(item);
            res.send(result);
        });

        app.patch("/users/admin/:id", async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    role: "admin"
                },
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result)

        })

        // user api get
        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find()
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/users/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const cursor = usersCollection.find(query)
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;

            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let admin = false;
            if (user) {
                admin = user?.role === 'admin';
            }
            res.send({ admin });
        })

        app.get('/pets/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await petsCollection.findOne(query);
            res.send(result);
        });

        // update pet data id
        app.patch('/pets/:id', async (req, res) => {
            const id = req.params.id
            const pet = req.body
            const filter = { _id: new ObjectId(id) }
            // console.log(id,pet)
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    // quantity: book.quantity
                    name: pet.name,
                    age: pet.age,
                    category: pet.category,
                    location: pet.location,
                    short_details: pet.short_details,
                    long_details: pet.long_details,
                    photo: pet.photo
                },
            };
            const result = await petsCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })


        // delete pets from data base
        app.delete('/pets/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await petsCollection.deleteOne(query);
            res.send(result);
        })

        // category api
        app.get('/category', async (req, res) => {
            const cursor = categoryCollection.find()
            const result = await cursor.toArray();
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
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
