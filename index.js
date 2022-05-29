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

        // get all orders for admin
        app.get("/order", async (req, res) => {
            const orders = await orderCollection.find().toArray()
            res.send(orders)
        })

        // get user orders
        app.get("/user/order", async (req, res) => {
            const email = req.query.email
            const filter = { email: email }
            const result = await orderCollection.find(filter).toArray()
            res.send(result)
        })

        // get a user if admin or not
        app.get("/admin/:email", async (req, res) => {
            const email = req.params.email
            const user = await userCollection.findOne({ email: email })
            const isAdmin = user.role === "admin"
            res.send({ admin: isAdmin })
        })

        // get specific user-------------------------------------------------------------
        app.get("/user/:email", async (req, res) => {
            const email = req.params.email
            const user = await userCollection.findOne({ email: email })

            res.send(user)
        })
        // get specific user-------------------------------------------------------------

        // ---------------- Put Methods
        // upsert user to database
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email
            const filter = { email: email };
            const options = { upsert: true };

            const user = req.body

            const updateDoc = { $set: user };

            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send({ result, token })
        })

        // update user to admin (does not insert)
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

        // update user info-------------------------------------------------------------
        app.put('/user/profile/:email', async (req, res) => {
            const email = req.params.email
            const userInfo = req.body

            const filter = { email: email }
            const options = { upsert: true };
            const updateDoc = { $set: userInfo };
            const result = await userCollection.updateOne(filter, updateDoc, options);

            res.send(result)
        })
        // update user info-------------------------------------------------------------

        // -------------------- all post methods
        // order
        app.post('/order', async (req, res) => {

            const order = req.body
            const result = await orderCollection.insertOne(order)

            res.send(result)
        })

        // add a product to toolsCollection
        app.post("/tool", async (req, res) => {
            const tool = req.body
            const result = await toolCollection.insertOne(tool)
            res.send(result)
        })

        // -------------------- all post methods
        // - delete a specific Tool
        app.delete("/tool/:id", async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const result = await toolCollection.deleteOne(filter)

            res.send(result)
        })

        // - delete a specific order
        app.delete("/order/:id", async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const result = await orderCollection.deleteOne(filter)
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
app.get('/kaku', (req, res) => {
    res.send('Heroku ku ku ku World!')
})

app.listen(port, () => {
    console.log(`Listening ${port}`)
})