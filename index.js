const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qycxf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const toolCollection = client.db("garden_master").collection("tools")
        const userCollection = client.db("garden_master").collection("users")
        const orderCollection = client.db("garden_master").collection("order")

        // ---------------- Get Methods
        // get all products
        app.get("/tool", async (req, res) => {
            const tools = await toolCollection.find().toArray()
            res.send(tools)
        })
        // get specific tool
        app.get("/tool/:id", async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const tool = await toolCollection.findOne(filter)
            res.send(tool)
        })

        // get users
        app.get('/user', async (req, res) => {
            const users = await userCollection.find().toArray()
            res.send(users)
        })

        // ---------------- Put Methods
        // upsert user to database
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email
            const filter = { email: email };
            const options = { upsert: true };

            const user = req.body

            const updateDoc = {
                $set: user
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })

        // update user to admin (dont insert)
        app.put('/user/admin/:email', async (req, res) => {
            const email = req.params.email
            const filter = { email: email }
            const updateDoc = {
                $set: {
                    role: 'admin'
                }
            };
            const result = await userCollection.updateOne(filter, updateDoc)
            res.send(result)
        })



        console.log("connected");
    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Heroku World!')
})

app.listen(port, () => {
    console.log(`Listening ${port}`)
})