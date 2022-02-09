import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/happyThoughts";
mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
mongoose.Promise = Promise;

// Defines the port the app will run on.
//   PORT=9000 npm start
const port = process.env.PORT || 9000;
const app = express();

const ThoughtsSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    unique: true,
    minLength: 5,
    maxLength: 140,
    trim: true,
  },
  hearts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Number,
    default: () => Date.now(),
  },
});

const Thought = mongoose.model("Thought", ThoughtsSchema);

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

// Start defining your routes here
app.get("/", (req, res) => {
  res.send(
    "Hello world! This is my API for the project Happy Thoughts, view it live at https://anna-happy-thoughts.netlify.app/ "
  );
});

app.get("/thoughts", async (req, res) => {
  const thoughts = await Thought.find().sort({ createdAt: "desc" }).limit(20);
  res.json(thoughts);
});

app.post("/thoughts", async (req, res) => {
  const { message } = req.body;

  try {
    const newThought = await new Thought({ message }).save();
    res.status(201).json({ response: newThought, success: true });
  } catch (error) {
    res.status(400).json({
      response: error,
      success: false,
    });
  }
});

app.post("/thoughts/:id/like", async (req, res) => {
  const { id } = req.params;

  try {
    const updatedHearts = await Thought.findByIdAndUpdate(
      // Argument 1 - id
      id,
      // Argument 2 - properties to change
      {
        $inc: {
          hearts: 1,
        },
      },
      // Argument 3 - options (not mandatory)
      {
        new: true,
      }
    );
    res.status(200).json({ response: updatedHearts, success: true });
  } catch (error) {
    res.status(400).json({ response: error, success: false });
  }
});

////////////////// delete

app.delete("/thoughts/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedThought = await Thought.findOneAndDelete({ _id: id });
    if (deletedThought) {
      res.status(200).json({ response: deletedThought, success: true });
    } else {
      res.status(404).json({ response: error, success: false });
    }
  } catch (error) {
    res.status(400).json({ response: error, success: false });
  }
});

app.patch("/thoughts/:id", async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  const { hearts } = req.params;

  try {
    const updatedThought = await Thought.findOneAndUpdate(
      { _id: id },
      { message },
      { hearts },
      { new: true }
    );
    if (updatedThought) {
      res.status(200).json({ response: updatedThought, success: true });
    } else {
      res.status(404).json({ response: "thought not found", success: false });
    }
  } catch (error) {
    res.status(400).json({ response: error, success: false });
  }
});

/////// finished

// Start the server
app.listen(port, () => {
  // eslint-disable-next-line
  console.log(`Server running on http://localhost:${port}`);
});
