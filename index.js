const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const { DateTime } = require("luxon");
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ggrwjrl.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    const blogCollection = client.db("StoryStream").collection("blog");

    app.post("/api/v1/user/create-blog", async (req, res) => {
      const blog = req.body;

      const bdTimezone = "Asia/Dhaka";
      const createdAt = DateTime.now().setZone(bdTimezone).toISO();

      blog.createdAt = createdAt;

      const result = await blogCollection.insertOne(blog);
      res.send(result);
    });

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
  res.send("StoryStream application is running");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
