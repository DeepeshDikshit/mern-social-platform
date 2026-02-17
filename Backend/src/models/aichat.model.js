import mongoose from "mongoose"

const aiChatSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    title: {
        type: String,
        default: "New Chat"
    },
    messages: [
        {
            role: {
                type: String,
                enum: ['user', 'ai'],
                required: true
            },
            text: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

const aiChatModel = mongoose.model('aichats', aiChatSchema)

export default aiChatModel
