import { Server } from "socket.io";
import cookie from "cookie"
import jwt from "jsonwebtoken";
import { createMessage } from "../dao/message.dao.js";

const users = {}

function setupSocket(server) { // http server

    const io = new Server(server, {})


    io.use((socket, next) => {
        const cookies = socket.request.headers.cookie
        const { token } = cookie.parse(cookies || "")

        if (!token) {
            return next(new Error("Authentication error"))
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            socket.user = decoded; // Attach user info to socket
            next();

        } catch (err) {
            return next(new Error("Authentication error"))
        }

    })

    io.on("connection", (socket) => {

        users[ socket.user._id ] = socket.id
        console.log(users)

        socket.on("disconnect", () => {
            console.log("A user disconnected");
        });

        socket.on("message", async (msg) => {

            const { receiver /* mongodb id */, message } = msg
            socket.to(users[ receiver ]).emit("message", message)
            await createMessage({
                receiver,
                sender: socket.user._id,
                text: message
            })
        })

        // Add more event listeners as needed
    });

}

export default setupSocket;