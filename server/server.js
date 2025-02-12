import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "./models/User.js"

const PORT = process.env.PORT || 5000
const app = express()
const MONGO_URI = process.env.MONGO_URI

app.use(
  cors({
    origin: "http://localhost:5174",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
)
app.use(express.json())

mongoose
  .connect(MONGO_URI)
  .then(() => console.log(" Подключено к MongoDB"))
  .catch((err) => console.error(" Ошибка подключения к MongoDB:", err))

app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser)
      return res.status(400).json({ error: "Email уже зарегистрирован" })

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new User({
      username,
      email,
      password_hash: hashedPassword,
    })

    await newUser.save();
    res.status(201).json({ message: "Регистрация успешна" })
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" })
  }
})

const start = async () => {
  try {
    app.listen(PORT, () => console.log("ок"))
  } catch (e) {
    console.log(e)
  }
}

start()
