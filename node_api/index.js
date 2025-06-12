const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json()); // ← add this line

const username = encodeURIComponent("pvignesh358");
const password = encodeURIComponent("Vicky@123");
const CONNECTION_STRING = `mongodb+srv://${username}:${password}@mangodbcluster.ouyhuss.mongodb.net/?retryWrites=true&w=majority&appName=Mangodbcluster`;
const DATABASE_NAME = "TodoApp";

const client = new MongoClient(CONNECTION_STRING);

async function main() {
  try {
    await client.connect();
    const database = client.db(DATABASE_NAME);
    const collection = database.collection("Todoappcollection");
    const categories = database.collection("TodoCategories");

    console.log("✅ Connected to MongoDB");

    app.get("/", (req, res) => {
      res.send("Hello World from root route!");
    });

    app.get("/api/todoapp/getNotes", async (req, res) => {
      try {
        const todos = await collection.find({}).toArray();
        res.json(todos);
      } catch (err) {
        console.error("Error querying collection:", err);
        res.status(500).send("Internal Server Error");
      }
    });

    app.get("/api/todoapp/categories", async (req, res) => {
        try {
          const cats = await categories.find({}).toArray();
          let raw = cats[0]?.categories;
      
          if (typeof raw === "string") {
            // Remove any trailing commas before closing brackets
            raw = raw.replace(/,\s*\]/, "]");
            const parsedCategories = JSON.parse(raw);
            res.json(parsedCategories);
          } else {
            res.json(raw);
          }
        } catch (err) {
          console.error("Error querying collection:", err);
          res.status(500).send("Internal Server Error");
        }
      });
      

    app.post("/api/todoapp/addNotes", async (req, res) => {
      console.log("Request body:", req);

      try {
        const { id, text, category, completed, alarmTime, alarmTriggered } =
          req.body;

        if (!text || !category) {
          return res
            .status(400)
            .json({ error: "Text and category are required" });
        }

        const result = await collection.insertOne({
          id,
          text,
          category,
          completed,
          alarmTime,
          alarmTriggered,
        });

        res.status(201).json({ message: "Todo added", _id: result.insertedId });
      } catch (err) {
        console.error("Error adding todo:", err);
        res.status(500).send("Internal Server Error");
      }
    });

    app.put("/api/todoapp/editNote/:id", async (req, res) => {
      const { id } = req.params;
      const { text, category, completed, alarmTime, alarmTriggered } = req.body;

      try {
        const result = await collection.updateOne(
          { id: Number(id) },
          {
            $set: {
              text,
              category,
              completed,
              alarmTime,
              alarmTriggered,
            },
          }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "Todo not found" });
        }

        res.json({ message: "Todo updated" });
      } catch (err) {
        console.error("Error updating todo:", err);
        res.status(500).send("Internal Server Error");
      }
    });

    app.delete("/api/todoapp/deleteNote/:id", async (req, res) => {
      const { id } = req.params;

      try {
        const result = await collection.deleteOne({ id: Number(id) });

        if (result.deletedCount === 0) {
          return res.status(404).json({ error: "Todo not found" });
        }

        res.json({ message: "Todo deleted" });
      } catch (err) {
        console.error("Error deleting todo:", err);
        res.status(500).send("Internal Server Error");
      }
    });

    // Start listening after DB is ready
    app.listen(5000, () => {
      console.log("🚀 Server is running on http://localhost:5000");
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
  }
}

main();
