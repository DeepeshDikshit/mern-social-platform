import { getChatHistory } from "../dao/message.dao.js";



export async function getChatHistoryController(req, res) {

    const { user1, user2 } = req.params;
    const { limit, skip } = req.query;

    const chatHistory = await getChatHistory(user1, user2,limit, skip);

    res.status(200).json({
        message: "Chat history fetched successfully",
        chatHistory
    });

}