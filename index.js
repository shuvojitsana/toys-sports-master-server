const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m8fciuv.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    const toysCollection = client.db('sportsMaster').collection('toys');
    const sportsBookingCollection = client.db('sportsMaster').collection('sports');



    app.get('/toys', async (req, res) => {
      const cursor = toysCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    app.get('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const options = {
        // Include only the `title` and `imdb` fields in the returned document
        projection: { title: 1, picture: 1, balance: 1, rating: 1, total_view: 1, about: 1, service_id: 1 },
      };
      const result = await toysCollection.findOne(query, options)
      res.send(result)
    })

    // sportsBooking
    app.get('/booking', async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      const result = await sportsBookingCollection.find(query).toArray();
      res.send(result)
    })

    app.post('/booking', async (req, res) => {
      const booking = req.body;
      console.log(booking);
      const result = await sportsBookingCollection.insertOne(booking);
      res.send(result);
    })

    app.patch('/booking/:id', async(req, res) =>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const updateBooking = req.body;
      console.log(updateBooking);
      const updateDoc = {
        $set: {
          status: updateBooking.status
        },
      };
      const result = await sportsBookingCollection.updateOne(filter, updateDoc);
      res.send(result);

    })


    app.delete('/booking/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await sportsBookingCollection.deleteOne(query);
      res.send(result)
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
  res.send("toys sports master running soon")
})

app.listen(port, () => {
  console.log(`Sports Master server is running on port ${port}`)
})