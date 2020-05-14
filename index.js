const express = require('express');
const myRoutes = require('./routes/router');
const multer  = require("multer");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const PORT = 4444;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

app.set('view engine', 'ejs');
app.use('/public', express.static('public'));

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "uploads");
    },
    filename: (req, file, cb) =>{
        cb(null, file.originalname);
    }    
});

app.use(multer({storage: storageConfig}).single("filedata")); 
app.use(express.urlencoded({ extended: true }))

app.use(cookieParser());

app.use(myRoutes);

function start() {
    app.listen(PORT, '127.0.0.1', () => {
        console.log("Server has been started");
    }).on("close", () => {        
        console.log("stop")      
    });
}

start();

const users = []
const connections = []
let tasks = []


const tasksStorage = require('./controllers/tasksRepository');

var root = {
    tasks: () => {
        var tasks = tasksStorage.getAll();
        console.log(tasks);
        return tasks;
    },
    createTask: (task) => {
        console.log(task);
        var created = tasksStorage.create(task.task.text, new Date(task.task.endTime));
        return created;
    },
    updateTask: (id) => {
        console.log(id.id);
        let task = tasksStorage.get(id.id);
        task.completed = !task.completed;
        tasksStorage.updateTask(task);
        return task;
    },
    deleteTask: (id) => {
        console.log(id);
        tasksStorage.delete(id.id);
        return id;
    }
};






