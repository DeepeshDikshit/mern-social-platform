import { generateCaption } from "../services/ai.service.js"
import { getConversations, getConversationHistory, createConversation, addMessage, updateConversation, deleteConversation } from "../dao/aichat.dao.js"

// Fallback messages for when Gemini quota is exceeded
const fallbackMessages = [
    "I appreciate your message! The AI service is currently at capacity. Please try again in a few moments.",
    "That's an interesting question! The AI service is temporarily busy. Feel free to ask again soon.",
    "Thanks for reaching out! The AI assistant is taking a brief break. Please retry shortly.",
]

function getRandomFallback() {
    return fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)]
}

export async function getConversationsController(req, res) {
    try {
        const userId = req.user._id
        const conversations = await getConversations(userId)
        
        res.status(200).json({
            message: "Conversations fetched successfully",
            conversations: conversations
        })
    } catch (error) {
        console.error('Get conversations error:', error)
        res.status(500).json({
            message: "Error fetching conversations",
            error: error.message
        })
    }
}

export async function getConversationMessagesController(req, res) {
    try {
        const userId = req.user._id
        const { conversationId } = req.params
        
        const chat = await getConversationHistory(userId, conversationId)
        
        if (!chat) {
            return res.status(404).json({
                message: "Conversation not found",
                history: []
            })
        }
        
        res.status(200).json({
            message: "Conversation messages fetched successfully",
            history: chat.messages || []
        })
    } catch (error) {
        console.error('Get conversation messages error:', error)
        res.status(500).json({
            message: "Error fetching conversation messages",
            error: error.message
        })
    }
}

export async function sendAIMessageController(req, res) {
    try {
        const { message, conversationId, title } = req.body
        const userId = req.user._id
        
        // Validate input
        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                message: "Message cannot be empty",
                error: "Please provide a message"
            })
        }
        
        const trimmedMessage = message.trim()
        
        // Create new conversation if conversationId not provided
        let chatId = conversationId
        if (!chatId) {
            const newChat = await createConversation(userId, title)
            chatId = newChat._id
        }
        
        // Save user message
        await addMessage(userId, chatId, 'user', trimmedMessage)
        
        let aiResponse
        
        try {
            // Generate AI response using existing Gemini service
            aiResponse = await generateCaption({
                buffer: Buffer.from(trimmedMessage),
                mimetype: 'text/plain',
                originalname: 'message.txt'
            })
        } catch (aiError) {
            console.error('Gemini API error:', aiError.message)
            
            // Check if it's a quota error
            if (aiError.message.includes('quota') || aiError.message.includes('429') || aiError.message.includes('rate')) {
                aiResponse = getRandomFallback()
            } else {
                aiResponse = "I encountered an issue processing your message. Please try again."
            }
        }
        
        // Save AI response
        const updatedChat = await addMessage(userId, chatId, 'ai', aiResponse)
        
        // Return the new message and conversationId
        const newMessage = updatedChat.messages[updatedChat.messages.length - 1]
        
        res.status(201).json({
            message: "Message sent successfully",
            conversationId: chatId,
            response: {
                role: 'ai',
                text: aiResponse,
                createdAt: newMessage.createdAt
            }
        })
    } catch (error) {
        console.error('Send AI message error:', error)
        res.status(500).json({
            message: "Error sending message",
            error: error.message
        })
    }
}

export async function updateConversationController(req, res) {
    try {
        const userId = req.user._id
        const { conversationId } = req.params
        const { title } = req.body
        
        if (!title || title.trim().length === 0) {
            return res.status(400).json({
                message: "Title cannot be empty",
                error: "Please provide a valid title"
            })
        }
        
        const updatedChat = await updateConversation(userId, conversationId, title)
        
        if (!updatedChat) {
            return res.status(404).json({
                message: "Conversation not found or unauthorized",
                error: "You don't have permission to update this conversation"
            })
        }
        
        res.status(200).json({
            message: "Conversation updated successfully",
            conversation: {
                _id: updatedChat._id,
                title: updatedChat.title,
                createdAt: updatedChat.createdAt
            }
        })
    } catch (error) {
        console.error('Update conversation error:', error)
        res.status(500).json({
            message: "Error updating conversation",
            error: error.message
        })
    }
}

export async function deleteConversationController(req, res) {
    try {
        const userId = req.user._id
        const { conversationId } = req.params
        
        const deletedChat = await deleteConversation(userId, conversationId)
        
        if (!deletedChat) {
            return res.status(404).json({
                message: "Conversation not found or unauthorized",
                error: "You don't have permission to delete this conversation"
            })
        }
        
        res.status(200).json({
            message: "Conversation deleted successfully",
            conversationId: conversationId
        })
    } catch (error) {
        console.error('Delete conversation error:', error)
        res.status(500).json({
            message: "Error deleting conversation",
            error: error.message
        })
    }
  }