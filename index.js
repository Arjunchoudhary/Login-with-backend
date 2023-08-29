import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

mongoose
  .connect("mongodb://localhost:27017/arjun", { useNewUrlParser: true })
  .then(() => console.log("Database Connected"))
  .catch((e) => console.error("Database Connection Error:", e));

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);
const app = express();

app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());

app.set("view engine", "ejs");

const secretKey = "dhfnvbmbnnbbdfdf"; // Replace with your actual secret key

const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  try {
    if (token) {
      const decoded = jwt.verify(token, secretKey);
      req.user = await User.findById(decoded._id);
      console.log("Decoded Token:", decoded);
      next();
    } else {
      res.render("login");
    }
  } catch (error) {
    console.error("JWT Verification Error:", error);
    res.status(401).send("Unauthorized");
  }
};

app.get("/", isAuthenticated, (req, res) => {
  res.render("logout", { name: req.user.name });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });

    if (!user) return res.redirect("register");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.redirect("login", { message: "incorrect password" });

    const token = jwt.sign({ _id: user._id }, secretKey);
    console.log("Generated Token:", token);

    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 60 * 1000),
    });
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.redirect("/login");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new User instance
    user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });

    // Save the user to the database
    await user.save();
    // After user.save()
    console.log("Saved User:", user);

    const token = jwt.sign({ _id: user._id }, secretKey);
    console.log("Generated Token:", token);

    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 60 * 1000),
    });
    res.redirect("/");
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/logout", (req, res) => {
  // res.clearCookie("token");
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.redirect("/");
});

app.listen(5000, () => {
  console.log("Server is running");
});

// import express from "express";
// import path from "path";
// import mongoose from "mongoose";
// import cookieParser from "cookie-parser";
// import jwt from "jsonwebtoken";

// mongoose
//   .connect("mongodb://localhost:27017", { dbName: "backend" })
//   .then((c) => console.log("Database Connected"))
//   .catch((e) => console.log(e));

// const userSchema = new mongoose.Schema({
//   name: String,
//   email: String,
// });

// const User = mongoose.model("User", userSchema);
// const app = express();

// app.use(express.static(path.join(path.resolve(), "public")));
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
// app.use(express.json())

// app.set("view engine", "ejs");

// const isAuthenticated = (req, res, next) => {
//   const { token } = req.cookies;
//   try {
//   if (token) {
//     const decoded = jwt.verify(token,"dfhgffhyedg")
//     console.log(decoded);

//     next();
//   } else {
//     res.render("login");
//   }
// }
// catch (error) {
//   console.error("JWT Verification Error:", error);
//   res.status(401).send("Unauthorized");
//   }
// };

// app.get("/", isAuthenticated, (req, res) => {
//   res.render("logout");
// });

// app.post("/login", async (req, res) => {
//   console.log(req.body);

//   const{name,email} = req.body;
//   const user = await User.create({
//    name,
//    email
//   })

//   const token = jwt.sign({_id:user._id}, "dfhgffhyedg")
//   console.log(token);
//   res.cookie("token", user._id, {
//     httpOnly: true,
//     expires: new Date(Date.now() + 60 * 1000),
//   });
//   res.redirect("/");
// });

// app.get("/logout", (req, res) => {
//   res.cookie("token", null, {
//     httpOnly: true,
//     expires: new Date(Date.now()),
//   });
//   res.redirect("/");
// });

// app.listen(5000, () => {
//   console.log("Server is running");
// });
