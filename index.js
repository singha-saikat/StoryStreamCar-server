const express = require("express");
const cors = require("cors");
const { ObjectId } = require("mongodb");
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
    const commentCollection = client.db("StoryStream").collection("comments");
    const wishListCollection = client.db("StoryStream").collection("items");

    app.post("/api/v1/user/create-blog", async (req, res) => {
      const blog = req.body;

      const bdTimezone = "Asia/Dhaka";
      const createdAt = DateTime.now().setZone(bdTimezone).toISO();

      blog.createdAt = createdAt;

      const result = await blogCollection.insertOne(blog);
      res.send(result);
    });

    app.get("/api/v1/recentBlogs", async (req, res) => {
      const latestBlogs = await blogCollection
        .find()
        .sort({ createdAt: -1 })
        .limit(6)
        .toArray();

      res.send(latestBlogs);
    });
    app.get("/api/v1/allBlogs", async (req, res) => {
      const cursor = blogCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/api/v1/blogsDetails/:_id", async (req, res) => {
      const id = req.params._id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await blogCollection.findOne(query);
      res.send(result);
    });

    app.post('/api/v1/comments', async (req, res) => {
      const { blogId, userName, userProfilePic, comment } = req.body;
      
      const newComment = {
        blogId,
        userName,
        userProfilePic,
        comment,
      };
      const result = await commentCollection.insertOne(newComment);
      console.log(result);
      res.send(result);


    });
    app.get("/api/v1/allComments", async (req, res) => {
      const cursor = commentCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/api/v1/update-blog/:_id", async (req, res) => {
      const id = req.params._id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await blogCollection.findOne(query);
      res.send(result);
    });

    app.patch("/api/v1/user/update-blog/:id", async (req, res) => {
      const { id } = req.params;
      const updates = req.body;
      const query = {
        _id: new ObjectId(id),
      };
      const options = { upsert: true };
      const updatedData = {
        $set: updates,
      };

      const result = await blogCollection.updateOne( query,
        updatedData,
        options);
        console.log(result);
      res.send(result);
    });
    app.post('/api/v1/user/wishlist', async (req, res) => {
      
      try {
        const wishItem = req.body;
      console.log(req.body);
      const result = await wishListCollection.insertOne(wishItem);
      
      res.send(result);
      } catch (error) {
        console.log(error);
      }
     
     


    });
    app.get("/api/v1/wishlist", async (req, res) => {
      const email = req.query?.email ;
      // || 'saikatsingha50@gmail.com'
      const query = {
        user: email 
      
      };
      const result = await wishListCollection.find(query).toArray();
      console.log('dataget',result);
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
