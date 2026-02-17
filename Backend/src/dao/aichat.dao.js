import aiChatModel from "../models/aichat.model.js"
import mongoose from "mongoose"

export async function getConversations(userId) {
    const conversations = await aiChatModel.find(
        { user: userId },
        { _id: 1, title: 1, createdAt: 1 }
    ).sort({ createdAt: -1 })
    
    return conversations
}

export async function getConversationHistory(userId, conversationId) {
    const chat = await aiChatModel.findOne({
        _id: conversationId,
        user: userId
    })
    
    return chat
}

export async function createConversation(userId, title = "Untitled Chat") {
    const chatTitle = title && title.trim().length > 0 ? title.trim() : "Untitled Chat"
    
    const chat = await aiChatModel.create({
        user: userId,
        title: chatTitle,
        messages: []
    })
    
    return chat
}

export async function addMessage(userId, conversationId, role, text) {
    const chat = await aiChatModel.findOneAndUpdate(
        { _id: conversationId, user: userId },
        { 
            $push: { messages: { role, text, createdAt: new Date() } },
            $set: { updatedAt: new Date() }
        },
        { new: true }
    )
    
    return chat
}

export async function updateConversation(userId, conversationId, title) {
    if (!title || title.trim().length === 0) {
        throw new Error("Title cannot be empty")
    }
    
    const trimmedTitle = title.trim()
    
    const chat = await aiChatModel.findOneAndUpdate(
        { _id: conversationId, user: userId },
        { 
            $set: { title: trimmedTitle, updatedAt: new Date() }
        },
        { new: true }
    )
    
    return chat
}

export async function deleteConversation(userId, conversationId) {
    const result = await aiChatModel.findOneAndDelete({
        _id: conversationId,
        user: userId
    })
    
    return result
}
