import express from "express"
import { getChatHistoryController } from "../controllers/chat.controller.js"

const router = express.Router()

router.get('/chat-history/:user1/:user2', getChatHistoryController)

export default router