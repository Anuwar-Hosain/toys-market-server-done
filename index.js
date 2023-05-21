const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.oattrlg.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const toysCollection = client.db("toyMarket").collection("allToys");

    const indexKeys = { Name: 1 }; // Replace field1 and field2 with your actual field names
    const indexOptions = { name: "title" }; // Replace index_name with the desired index name
    const result = await toysCollection.createIndex(indexKeys, indexOptions);

    // allToys
    app.get("/all-toys", async (req, res) => {
      const jobs = await toysCollection.find({}).toArray();
      res.send(jobs);
    });
    // category by toys
    app.get("/all-toys/:category", async (req, res) => {
      const jobs = await toysCollection
        .find({
          category: req.params.category,
        })
        .toArray();
      res.send(jobs);
    });

    // my toys
    app.get("/my-toys/:email", async (req, res) => {
      console.log(req.params.id);
      const jobs = await toysCollection
        .find({
          Email: req.params.email,
        })
        .toArray();
      res.send(jobs);
    });
    // my toys search
    app.get("/my-toys-get/:text", async (req, res) => {
      const text = req.params.text;
      console.log(text);
      const result = await toysCollection
        .find({
          Name: { $regex: text, $options: "i" },
        })
        .toArray();
      res.send(result);
    });

    // post data
    app.post("/post-toy", async (req, res) => {
      const body = req.body;
      const result = await toysCollection.insertOne(body);
      res.send(result);
    });
    //toy update
    app.put("/updateToy/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      console.log(body, id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          Name: body.Name,
          price: body.price,
          quantity: body.quantity,
          ratting: body.ratting,
        },
      };
      const result = await toysCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // view details
    app.get("/view-detailsToy/:id", async (req, res) => {
      const id = req.params.id;
      console.log(req.params.id);
      const filter = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(filter);
      res.send(result);
    });

    // delete section
    app.delete("/toy-delete/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };

      const result = await toysCollection.deleteOne(filter);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("toys is running");
});

app.listen(port, () => {
  console.log(`car server is running${port}`);
});
