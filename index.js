const express = require("express");
const app = express();
const mysql = require("mysql2");
const port = 8000;
const path = require("path");
const methodOverride = require("method-override");

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const connection = mysql.createConnection({
    host: "sql313.infinityfree.com",
    user: "if0_38374426",
    password: "9U346nKz5mkX",
    database: "if0_38374426_todo",
    port: 3306,
});

connection.connect(err => {
    if (err) {
        console.error("Database connection failed: ", err);
        return;
    }
    console.log("Connected to MySQL database!");
});

app.use(express.static(path.join(__dirname, "public")));

// Show all tasks
app.get("/tasks", (req, res) => {
    let q = "SELECT * FROM tasks";
    try {
        connection.query(q, (err, tasks) => {
            if (err) throw err;
            res.render("index.ejs", { tasks });
        });
    } catch (err) {
        console.log(err);
        res.send("Some error in DB");
    }
});

// Render form for new task
app.get("/tasks/new", (req, res) => {
    res.render("new.ejs");
});

// Add new task
app.post("/tasks", (req, res) => {
    let { name, details } = req.body;
    let q = "INSERT INTO tasks (task, details) VALUES (?, ?)";

    connection.query(q, [name, details], (err, result) => {
        if (err) {
            console.error(err);
            return res.send("Error inserting task");
        }
        res.redirect("/tasks");
    });
});

// Update task details
app.patch("/tasks/:id", (req, res) => {
    let { id } = req.params;
    let { details } = req.body;
    let q = "UPDATE tasks SET details = ? WHERE id = ?";

    connection.query(q, [details, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.send("Error updating task");
        }
        res.redirect("/tasks");
    });
});

// Render edit task page
app.get("/tasks/:id/edit", (req, res) => {
    let { id } = req.params;
    let q = "SELECT * FROM tasks WHERE id = ?";

    connection.query(q, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.send("Error fetching task for editing");
        }
        if (results.length === 0) {
            return res.send("Task not found");
        }
        res.render("edit.ejs", { task: results[0] });
    });
});

// Toggle task completion
app.patch("/tasks/:id/done", (req, res) => {
    let { id } = req.params;
    let q = "UPDATE tasks SET `check` = NOT `check` WHERE id = ?";

    connection.query(q, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.send("Error marking task as done");
        }
        res.redirect("/tasks");
    });
});

// Delete a task
app.delete("/tasks/:id", (req, res) => {
    let { id } = req.params;
    let q = "DELETE FROM tasks WHERE id = ?";

    connection.query(q, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.send("Error deleting task");
        }
        res.redirect("/tasks");
    });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
