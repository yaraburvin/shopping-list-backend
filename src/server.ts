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
import {Client} from "pg"
import { database } from "faker";


const client = new Client({database: "to-do-list"})
client.connect()


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
app.get("/tasks", async (req, res) => {
  const task = 'select * from todo'
  const taksList: object[]= (await client.query(task)).rows
  res.status(200).json(
      taksList
  
  )
});



// POST /items
app.post<{}, {}, DbItem>("/tasks", async (req, res) => {
  const {task, dueDate} = req.body;
  if (typeof task === 'string') {
    const tasks = 'insert into todo (task, duedate) values ($1,$2)'
    const pullNewTask = 'select * from toDo where task = $1 and duedate = $2'
    const values = [task, dueDate];
    await client.query(tasks,values)
    const newTask = (await client.query(pullNewTask,values)).rows
  
    res.status(201).json({
      status: 'success',
      data: {
        signature: newTask
      }
    });
  }
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

app.delete<{ TaskId: string }>("/tasks/:TaskId", async (req, res) => {
  const targetTaskId = parseInt(req.params.TaskId)
  if (targetTaskId) {
    const task = 'delete from todo where id = $1'
    const values = [targetTaskId]
    await client.query(task,values)
    res.status(200).json({status : "success"})
  } else {
    res.status(404).send("Task couldnot have been deleted as no matching task found");
  }
});


app.listen(PORT_NUMBER, () => {
  console.log(`Server is listening on port ${PORT_NUMBER}!`);
});
