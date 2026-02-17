import express from "express"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth.routes.js"
import postRoutes from "./routes/post.routes.js"
import chatRoutes from "./routes/chat.routes.js"
import aiChatRoutes from "./routes/aichat.routes.js"
import userRoutes from "./routes/user.routes.js"
import cors from "cors"

const app = express()

// CORS configuration - allow both localhost:5173 and localhost:5174 for development
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
]

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl requests)
        if (!origin) return callback(null, true)
        
        if (allowedOrigins.includes(origin)) {
            return callback(null, true)
        } else {
            const msg = 'CORS policy: this origin is not allowed'
            return callback(new Error(msg))
        }
    },
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