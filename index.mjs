import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import passport from "passport";
import { fileURLToPath } from "url";
import session from "express-session";
import "./Stratery/local-stratergy.mjs";
import mongoose from "mongoose";
import router from "./Routes/Routes.mjs";
import MongoStore from "connect-mongo";

const app = express();

const __filename = fileURLToPath(import.meta.url);    
const __dirname = path.dirname(__filename);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("DB Error:", err));

app.set("trust proxy", 1);
app.use(express.json());

const FRONTEND = (process.env.FRONTEND_URL || "").replace(/\/$/, "");

app.use(
  cors({
    origin: [FRONTEND, "http://localhost:5173"],
    credentials: true,
  })
);

app.use(
  session({
    secret:process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      },
    store: MongoStore.create({ client: mongoose.connection.getClient() })
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/matchuploads", express.static(path.join(__dirname, "matchuploads")));

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({   
      message: `Invalid JSON`
    });
  }
  next();
});

app.use(router);

app.get("/",(req,res)=>{
    res.send("hello");
})


const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
})