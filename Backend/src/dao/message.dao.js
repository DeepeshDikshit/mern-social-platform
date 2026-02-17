import messageModel from "../models/message.model.js"


export async function createMessage({
    receiver,
    sender,
    text
}) {
    const message = await messageModel.create({
        receiver,
        sender,
        text
    });
    return message;
}

export async function getChatHistory(user1, user2, limit = 20, skip = 0) {
    const chatHistory = await messageModel.find({
        $or: [
            {
                sender: user1,
                receiver: user2
            },
            {
                sender: user2,
                receiver: user1
            }
        ]
    }).sort({ createdAt: -1 }).skip(skip).limit(limit);
    return chatHistory;
}