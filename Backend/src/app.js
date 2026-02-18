import express from "express"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth.routes.js"
import postRoutes from "./routes/post.routes.js"
import chatRoutes from "./routes/chat.routes.js"
import aiChatRoutes from "./routes/aichat.routes.js"
import userRoutes from "./routes/user.routes.js"
import cors from "cors"

const app = express()

// ✅ TEMPORARY OPEN CORS (Best during deployment phase)
app.use(cors({
    origin: true,
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())

app.get("/", (req, res) => {
    res.send("Welcome to the API")
})

app.use('/auth', authRoutes)
app.use('/posts', postRoutes)
app.use('/chat', chatRoutes)
app.use('/ai', aiChatRoutes)
app.use('/users', userRoutes)

export default app