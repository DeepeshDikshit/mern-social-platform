import express from "express"
import { authMiddleware } from "../middlewares/auth.middleware.js"
import { getConversationsController, getConversationMessagesController, sendAIMessageController, updateConversationController, deleteConversationController } from "../controllers/aichat.controller.js"
import { body, validationResult } from "express-validator"

const router = express.Router()

// Message validation middleware
const messageValidator = [
    body('message')
        .notEmpty()
        .withMessage("Message is required")
        .isString()
        .withMessage("Message must be a string")
        .trim()
        .isLength({ min: 1, max: 2000 })
        .withMessage("Message must be between 1 and 2000 characters"),
    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        next()
    }
]

// Title validation middleware
const titleValidator = [
    body('title')
        .notEmpty()
        .withMessage("Title is required")
        .isString()
        .withMessage("Title must be a string")
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage("Title must be between 1 and 100 characters"),
    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        next()
    }
]

/**
 * GET ALL CONVERSATIONS FOR USER (Protected)
 */
router.get(
    '/conversations',
    authMiddleware,
    getConversationsController
)

/**
 * GET CONVERSATION MESSAGES (Protected)
 */
router.get(
    '/history/:conversationId',
    authMiddleware,
    getConversationMessagesController
)

/**
 * SEND MESSAGE TO AI (Protected)
 */
router.post(
    '/chat',
    authMiddleware,
    messageValidator,
    sendAIMessageController
)

/**
 * UPDATE CONVERSATION TITLE (Protected)
 */
router.patch(
    '/conversation/:conversationId',
    authMiddleware,
    titleValidator,
    updateConversationController
)

/**
 * DELETE CONVERSATION (Protected)
 */
router.delete(
    '/conversation/:conversationId',
    authMiddleware,
    deleteConversationController
)

export default router
