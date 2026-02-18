import express from "express"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth.routes.js"
import postRoutes from "./routes/post.routes.js"
import chatRoutes from "./routes/chat.routes.js"
import aiChatRoutes from "./routes/aichat.routes.js"
import userRoutes from "./routes/user.routes.js"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// ✅ TEMP CORS
app.use(cors({
    origin: [
 "http://localhost:5173",
 "https://mern-social-platform.onrender.com"
],
credentials: true

}))

app.use(express.json())
app.use(cookieParser())

// ✅ Serve static files safely
app.use(express.static(path.join(__dirname, "../public")))

app.get("/", (req, res) => {
    res.send("Welcome to the API")
})

app.use('/auth', authRoutes)
app.use('/posts', postRoutes)
app.use('/chat', chatRoutes)
app.use('/ai', aiChatRoutes)
app.use('/users', userRoutes)

// ✅ SAFE fallback (NO wildcard bug)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"))
})

export default app
