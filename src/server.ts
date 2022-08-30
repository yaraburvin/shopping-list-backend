import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  toDo,
  addDbItem,
  getAllDbItems,
  getDbItemById,
  DbItem,
  updateDbItemById,
  deleteDbItemById,
  DbItemWithId,
} from "./db";
import filePath from "./filePath";





const app = express();
app.use(express.json());
/** To allow 'Cross-Origin Resource Sharing': https://en.wikipedia.org/wiki/Cross-origin_resource_sharing */
app.use(cors());
app.use(express.json())

// read in contents of any environment variables in the .env file
dotenv.config();

// use the environment variable PORT, or 4000 as a fallback
const PORT_NUMBER = process.env.PORT ?? 4000;

const baseUrl = process.env.NODE_ENV === "production"
	? "your-project.herokuapp.com"
	: "localhost:4000"

// API info page
app.get("/", (req, res) => {
  const pathToFile = filePath("../public/index.html");
  res.sendFile(pathToFile);
});

// GET /items
app.get("/tasks", (req, res) => {
  res.json(
    toDo
  )
});



// POST /items
app.post<{}, {}, DbItem>("/tasks", (req, res) => {
  const postData = req.body;
  const createdSignature = addDbItem(postData);
  res.status(201).json(createdSignature);
});



// Get /tasks/:id
app.get<{ TaskId: string }>("/tasks/:TaskId", (req, res) => {
  const targetTaskId = parseInt(req.params.TaskId)
  const matchingTask = toDo.find((task) => task.id === targetTaskId);
  if (matchingTask) {
    res.json(matchingTask)
  } else {
    res.status(404).send("No matching task found");
  }
});

app.delete<{ TaskId: string }>("/tasks/:TaskId", (req, res) => {
  const targetTaskId = parseInt(req.params.TaskId)
  if (targetTaskId) {
    let updtedtoDos = toDo.filter((task) => task.id !== targetTaskId);
    res.json(updtedtoDos)
  } else {
    res.status(404).send("Task couldnot have been deleted as no matching task found");
  }
});


app.listen(PORT_NUMBER, () => {
  console.log(`Server is listening on port ${PORT_NUMBER}!`);
});
