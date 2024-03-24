const express = require("express");
const app = express();
const bp = require("body-parser");
const ejs = require("ejs");

const { ObjectId, MongoClient } = require("mongodb");
const uri =
  "mongodb+srv://Nagu1274:Nagu1274@rohitcluster.5ojzrls.mongodb.net/?retryWrites=true&w=majority&appName=Rohitcluster";
const client = new MongoClient(uri);

app.use(bp.urlencoded({ extended: true }));
app.set("view engine", "ejs");

async function getUsers() {
  try {
    await client.connect();
    const db = client.db("mydb");
    const collection = db.collection("railwaybooking");
    const data = await collection.find({}).toArray();
    return data;
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

// Route to render the login page
app.get("/", async (req, res) => {
  try {
    const data = await getUsers();
    res.render("login.ejs", { data: data });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/login", (req, res) => {
  res.render("booking.ejs");
});
// Route to handle the login form submission
app.post("/login", async (req, res) => {
  try {
    await client.connect();
    const db = client.db("signUp");
    const collection = db.collection("railwaybookingSignUp");
    const user = await collection.findOne({ name: req.body.name });

    if (user && user.password === req.body.password) {
      res.render("booking.ejs", { name: "" });
    } else {
      res.send("Invalid username or password");
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to render the signup page
app.get("/signup", (req, res) => {
  res.render("signUp.ejs");
});

app.get("/details", (req, res) => {
  res.render("details.ejs", { data: null, hide: null });
});
app.get("/booking", async (req, res) => {
  res.render("booking.ejs");
});

app.get("/admindash", (req, res) => {
  res.render("/admindash.ejs", { data: null, hide: null });
});

// Route to handle the signup form submission
app.post("/signup", async (req, res) => {
  const { name, email, password, Confirmpassword } = req.body;
  try {
    await client.connect();
    const db = client.db("signUp");
    const collection = db.collection("railwaybookingSignUp");
    const result = await collection.insertOne({ name, email, password });
    console.log("Inserted signUp", result.insertedId);
    // Redirect to the login page after successful signup
    res.redirect("/");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/details/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Requested documentId:", id);

    const db = client.db("bookingdet");
    const collection = db.collection("data");
    const user = await collection.findOne({ _id: new ObjectId(id) }); // Find a single user by ID
    console.log("Retrieved user data:", user);

    if (user) {
      // Check if user is found
      console.log("Data found");
      res.render("details.ejs", { data: user }); // Render the details.ejs template with user data
    } else {
      console.log("No data found for documentId:", id);
      res.render("details.ejs", { data: null }); // Render details.ejs with null data
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});
// Assuming you're rendering admindash.ejs in a route handler
// Route to handle admin dashboard rendering
// Route to render the admin dashboard
app.get("/admin/login/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Requested documentId:", id);

    const db = client.db("bookingdet");
    const collection = db.collection("data");
    const user = await collection.findOne({ _id: new ObjectId(id) });

    console.log("Retrieved user data:", user);

    if (user) {
      console.log("Data found");
      res.render("admindash.ejs", { data: user }); // Pass 'user' as 'data' to the template
    } else {
      console.log("No data found for documentId:", id);
      res.render("admindash.ejs", { data: null }); // Render the template with null data
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

async function insertAdminData() {
  try {
    await client.connect();
    const db = client.db("adminDB"); // Assuming your database name is "adminDB"
    const collection = db.collection("admins"); // Assuming your collection name is "admins"

    // Define the admin data
    const adminData = [
      {
        username: "Rohith",
        password: "Rohith1274",
      },
      {
        username: "Deepika",
        password: "Deepika2004",
      },
      {
        username: "karthik",
        password: "karthik05",
      },
    ];
    // Insert the admin data into the collection
    await collection.insertMany(adminData);
    console.log("Admin data inserted successfully");
  } catch (error) {
    console.error("Error inserting admin data:", error);
  } finally {
    await client.close();
  }
}

// Function call to insert admin data (only need to call it once)
insertAdminData();

// Route to handle the admin login form submission// Route to handle the admin login form submission
app.post("/admin/login", async (req, res) => {
  try {
    const { adminName, adminPassword } = req.body;

    await client.connect();
    const db = client.db("adminDB");
    const collection = db.collection("admins");
    const admin = await collection.findOne({
      username: adminName,
      password: adminPassword,
    });

    if (admin) {
      // If admin is found, redirect to the admin dashboard
      res.redirect("/admin/dashboard");
    } else {
      // If admin is not found or credentials are invalid, render login page with error message
      res.render("login.ejs", { error: "Invalid admin credentials" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  } finally {
    await client.close();
  }
});

// Route to render the admin dashboard
// Route to render the admin dashboard
app.get("/admin/login", async (req, res) => {
  try {
    // Render the admin dashboard template
    await client.connect();
    const data = await client
      .db("bookingdet")
      .collection("data")
      .find()
      .toArray();
    res.render("admindash.ejs", { data: data });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/booking", async (req, res) => {
  try {
    await client.connect();

    const db = client.db("bookingdet");
    const collection = db.collection("data");
    const result = await collection.insertOne(req.body);
    console.log("Inserted details", result.insertedId);

    // Redirect to the details page with the inserted ID as a query parameter
    res.redirect(`/details/${result.insertedId}`);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
