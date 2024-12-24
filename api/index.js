const express = require("express");
const app = express();
var cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // for cookie
const cookieParser = require("cookie-parser");
const imageDownloader = require("image-downloader");
const User = require("./models/User");
const { default: mongoose } = require("mongoose");
const { url } = require("inspector");
const multer = require("multer");
const fs = require("fs");
const Place = require("./models/place.js");
const Booking = require("./models/booking");
const { rejects } = require("assert");

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = "fskjedfbksjdhfbksjbdk";

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);

//mongodb connect
//mongoose.connect(process.env.MONGO_URL);
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/test", (req, res) => {
  res.json("test Ok");
});

// function getUserDataFromReq(req) {
//   return new Promise((resolve, reject) => {
//     jwt.verify(req.cookie.token, jwtSecret, {}, async (err, userData) => {
//       if (err) throw err;
//       resolve(userData);
//     });
//   });
// }

function getUserDataFromReq(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.token; // Corrected to access `req.cookies`
    if (!token) {
      return reject(new Error("No token found"));
    }

    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) {
        return reject(err);
      }
      resolve(userData);
    });
  });
}

//  pfloJlkehUwedodx

app.post("/register", async (req, res) => {
  //mongoose.connect(process.env.MONGO_URL);
  const { name, email, password } = req.body;
  try {
    const userDoc = await User.create({
      name,
      email,
      password: bcrypt.hashSync(password, bcryptSalt), // making password by bcrypt (hashing)
    });
    res.json(userDoc);
  } catch (e) {
    res.status(422).json(e);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const userDoc = await User.findOne({ email });
  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      jwt.sign(
        { email: userDoc.email, id: userDoc._id },
        jwtSecret,
        {},
        (err, token) => {
          if (err) throw err;
          res.cookie("token", token).json(userDoc);
        }
      );
    } else {
      res.status(422).json("pass not ok");
    }
  } else {
    res.json("not found");
  }
});

app.post("/logout", (req, res) => {
  // Clear session or token on the server-side
  //req.session = null; // Or use jwt.invalidate(token)
  res.send({ message: "Logged out successfully" });
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;

  if (!token) {
    return res.json(null); // No token, no user
  }

  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) {
      return res.status(403).json(null); // Invalid token, no user
    }

    try {
      const { name, email, _id } = await User.findById(userData.id);
      res.json({ name, email, _id });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user profile" });
    }
  });
});

app.post("/upload-by-link", async (req, res) => {
  try {
    const { link } = req.body; // Extract the link from the request body
    if (!link) {
      return res.status(400).json({ error: "The link is required" });
    }

    const newName = "photo" + Date.now() + ".jpg";
    await imageDownloader.image({
      url: link, // Ensure the link is passed as the url
      dest: __dirname + "/uploads/" + newName,
    });

    res.json(newName);
  } catch (error) {
    console.error("Error downloading image:", error.message);
    res.status(500).json({ error: "Failed to download the image" });
  }
});

const photosMiddleware = multer({ dest: "uploads/" });
app.post("/upload", photosMiddleware.array("photos", 100), (req, res) => {
  const uploadedFiles = [];
  for (let i = 0; i < req.files.length; i++) {
    const { path, originalname } = req.files[i];
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];
    const newPath = path + "." + ext;
    fs.renameSync(path, newPath);
    uploadedFiles.push(
      newPath.replace("uploads\\", "").replace("uploads/", "")
    ); // Ensure consistent handling of slashes
  }
  res.json(uploadedFiles);
});

// Start Server

app.post("/places", async (req, res) => {
  try {
    // Log the request body for debugging
    console.log("Data sent on mongodb");

    // Connect to MongoDB
    mongoose.connect(process.env.MONGO_URL);

    // Destructure the data from the request body
    const {
      title,
      address,
      addedPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      price,
      maxGuests,
    } = req.body;

    // Create a new Place document
    const placeDoc = await Place.create({
      //owner: userData.id,
      title,
      address,
      photos: addedPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      price,
      maxGuests,
    });

    // Respond with the created document
    res.json(placeDoc);
  } catch (error) {
    console.error("Error adding place:", error);
    res.status(500).json({ message: "Failed to add place. Please try again." });
  }
});

app.get("/user-places", async (req, res) => {
  try {
    const places = await Place.find(); // Fetch all places
    res.json(places);
  } catch (error) {
    console.error("Error fetching places:", error);
    res.status(500).json({ error: "Failed to fetch places" });
  }
});

app.get("/places/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const place = await Place.findById(id); // Fetch place by ID
    if (!place) {
      return res.status(404).json({ error: "Place not found" });
    }
    res.json(place);
  } catch (error) {
    console.error("Error fetching place by ID:", error);
    res.status(500).json({ error: "Failed to fetch place" });
  }
});

app.put("/places/:id", async (req, res) => {
  try {
    const { id } = req.params; // Extract id from the URL
    const {
      title,
      address,
      addedPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      price,
      maxGuests,
    } = req.body;

    const placeDoc = await Place.findById(id); // Fetch the place by ID
    if (!placeDoc) {
      return res.status(404).json({ message: "Place not found" });
    }

    // Update the place details
    placeDoc.set({
      title,
      address,
      photos: addedPhotos,
      description,

      perks,
      extraInfo,
      checkIn,
      checkOut,
      price,
      maxGuests,
    });

    await placeDoc.save(); // Save the changes
    res.json("Place updated successfully");
  } catch (error) {
    console.error("Error updating place:", error);
    res.status(500).json({ message: "Failed to update place" });
  }
});

// app.get("/places", async (req, res) => {
//   res.json(await Place.find());
// });
app.get("/places", async (req, res) => {
  try {
    const places = await Place.find(); // Assuming Place is your Mongoose model
    res.json(places);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch places" });
  }
});

app.post("/bookings", async (req, res) => {
  const {
    checkIn,
    checkOut,
    numberOfGuests,
    name,
    phone,
    place,
    price,
    userId,
  } = req.body;

  try {
    const booking = new Booking({
      checkIn,
      checkOut,
      numberOfGuests,
      name,
      phone,
      place,
      price,
      user: userId, // Ensure `userId` is saved with the booking
    });

    await booking.save();
    res.status(201).json(booking); // Respond with the saved booking
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Error creating booking" });
  }
});

// app.get("/bookings", async (req, res) => {
//   const { userId } = req.query;

//   try {
//     const bookings = await Booking.find({ user: userId }.populate("place")); // Query bookings by userId

//     if (bookings.length === 0) {
//       return res.status(404).json({ message: "No bookings found" });
//     }

//     res.status(200).json(bookings); // Return bookings
//   } catch (error) {
//     console.error("Error fetching bookings:", error);
//     res.status(500).json({ message: "Error fetching bookings" });
//   }
// });
app.get("/bookings/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("place");
    if (!booking) {
      return res.status(404).send("Booking not found");
    }
    res.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate(
      "place"
    ); // Include place details
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).send("Error fetching bookings");
  }
});

app.listen(4000, () => {
  console.log("Server is running on http://localhost:4000");
});
