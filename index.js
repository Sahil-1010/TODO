const express=require("express");
const app=express();
const mysql = require('mysql2');
const port=8000;
const path=require("path");
const { v4: uuidv4}=require('uuid');
const methodOverride=require('method-override');
const { log } = require("console");

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

app.set("view engine","ejs");
app.set("views", path.join(__dirname, "views"));
require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
});

connection.connect((err) => {
    if (err) {
        console.error("Database connection failed: " + err.stack);
        return;
    }
    console.log("Connected to the database!");
});


app.use(express.static(path.join(__dirname,"public")));


// let tasks= [
//     {
//         id:uuidv4(),
//         name:"Code", 
//         details:"finish Coding"
//     },
//     {
//         id:uuidv4(),
//         name:"Cook", 
//         details:"finish Cooking and eat"
//     },
//     {
//         id:uuidv4(),
//         name:"Sleep", 
//         details:"sleep for 8 hours"
//     },
// ];

// app.get("/tasks",(req,res)=>{
//     console.log("response ");
//     res.render("index.ejs",{tasks});
// });

//show route
app.get("/tasks",(req,res)=>{
    let q='select * from tasks';
    // res.send("success");
    try{
      connection.query(q,(err,tasks)=>{
          if (err) throw err;
          // console.log(result);
          res.render("index.ejs",{tasks});
      });
      }catch(err){
          console.log(err);
          res.send("some error in db");
      }
  });


app.get("/tasks/new",(req,res)=>{
    res.render("new.ejs");
});

// app.post("/tasks",(req,res)=>{
//     // console.log(req.body);
//     let {name,details}=req.body;
//     let id=uuidv4();
//     tasks.push({id,name,details});
//     // res.send("post working");
//     res.redirect("/tasks");
// });

app.post("/tasks", (req, res) => {
    let { name, details } = req.body;
    let q = `INSERT INTO tasks (task, details) VALUES (?, ?)`;

    connection.query(q, [name, details], (err, result) => {
        if (err) {
            console.error(err);
            return res.send("Error inserting task");
        }
        res.redirect("/tasks");
    });
});


// app.patch("/tasks/:id",(req,res)=>{
//     let {id}=req.params;
//     let newContent=req.body.details;
//     let task=tasks.find((p)=>id===p.id);
//     task.details=newContent;
//     console.log(task);
//     // res.send("patch request working");
//     res.redirect("/tasks");
// });

// app.patch("/tasks/:id", (req, res) => {
//     let { id } = req.params;
//     let { details } = req.body;
//     let task = tasks.find((p) => id === p.id);
    
//     if (task) {
//       task.details = details;
//     }
    
//     res.redirect("/tasks");
//   });

app.patch("/tasks/:id", (req, res) => {
    let { id } = req.params;
    let { details } = req.body;
    let q = `UPDATE tasks SET details = ? WHERE id = ?`;

    connection.query(q, [details, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.send("Error updating task");
        }
        res.redirect("/tasks");
    });
});


// app.get("/tasks/:id/edit",(req,res)=>{
//     let {id}=req.params;
//     let task=tasks.find((p)=>id===p.id);
//     res.render("edit.ejs",{task});
//     console.log(`edited the task`);
// });

app.get("/tasks/:id/edit", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM tasks WHERE id = ?`;

    connection.query(q, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.send("Error fetching task for editing");
        }
        if (results.length === 0) {
            return res.send("Task not found");
        }
        res.render("edit.ejs", { task: results[0] }); // Send the fetched task to the edit page
    });
});


// app.patch("/tasks/:id/done", (req, res) => {
//     let { id } = req.params;
//     let task = tasks.find((p) => id === p.id);
    
//     if (task) {
//       task.done = !task.done;
//     }
    
//     res.redirect("/tasks");
//   });

app.patch("/tasks/:id/done", (req, res) => {
    let { id } = req.params;
    let q = `UPDATE tasks SET \`check\` = NOT \`check\` WHERE id = ?`;

    connection.query(q, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.send("Error marking task as done");
        }
        res.redirect("/tasks");
    });
});

app.delete("/tasks/:id", (req, res) => {
    let { id } = req.params;
    let q = `DELETE FROM tasks WHERE id = ?`;

    connection.query(q, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.send("Error deleting task");
        }
        res.redirect("/tasks");
    });
});


app.listen(port,()=>{
    console.log("listening on port 8000 ");
});