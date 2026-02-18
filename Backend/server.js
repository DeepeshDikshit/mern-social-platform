import app from "./src/app.js"
import connectDB from "./src/db/db.js"
import { createServer } from "http";
import setupSocket from "./src/sockets/socket.js";

const httpServer = createServer(app);
setupSocket(httpServer);

async function startServer() {
    try {
        await connectDB();

        const PORT = process.env.PORT || 3000;

        httpServer.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log('✅ Ready to accept requests');
        });

    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
}

startServer();
