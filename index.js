import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

mongoose
  .connect("mongodb://localhost:27017", { dbName: "backend" })
  .then((c) => console.log("Database Connected"))
  .catch((e) => console.log(e));

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
});

const User = mongoose.model("User", userSchema);
const app = express();

app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

const isAuthenticated = (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const decoded = jwt.verify(token,"dfhgffhyedg")
    console.log(decoded);

    next();
  } else {
    res.render("login");
  }
};

app.get("/", isAuthenticated, (req, res) => {
  res.render("logout");
});

app.post("/login", async (req, res) => {
  console.log(req.body);

  const{name,email} = req.body;
  const user = await User.create({
   name,
   email
  })

  const token = jwt.sign({_id:user._id}, "dfhgffhyedg")
  console.log(token);
  res.cookie("token", user._id, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});

app.get("/logout", (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.redirect("/");
});

// app.get("/success", (req, res) => {
//   res.render("success");
// });

// app.post("/contact", async (req, res) => {
//   const { name, email } = req.body;
//   console.log(req.body);
//   await Message.create({ name, email });
//   res.redirect("/success");
// });

// app.get("/users", (req, res) => {
//   res.json({
//     users,
//   });
// });

app.listen(5000, () => {
  console.log("Server is running");
});

// import express from "express";
// import path from "path";
// import mongoose from "mongoose";

// mongoose
// .connect("mongodb://localhost:27017/newone", { useNewUrlParser: true})
// .then((c) => console.log("Database Connected"))
// .catch((e) => console.log(e));

// const messageSchema = new mongoose.Schema({
// name: String,
// email: String,
// });

// const Message = mongoose.model("Message", messageSchema);
// const app = express();

// app.use(express.static(path.join(path.resolve(), "public")));
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// app.set("view engine", "ejs");

// app.get("/", (req, res) => {
// res.render("index", { name: "Arjun Choudhary" });
// });

// app.get("/success", (req, res) => {
// res.render("success");
// });

// app.post("/contact", async (req, res) => {
// const { name, email } = req.body;

// console.log(req.body);

// try {
// await Message.create({ name, email }); // Insert data into the database
// res.redirect("/success");
// } catch (error) {
// console.error(error);
// res.status(500).json({ message: "Failed to insert data" });
// }
// });

// app.listen(5000, () => {
// console.log("Server is running");
// });
