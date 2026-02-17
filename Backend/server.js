import app from "./src/app.js"
import connectDB from "./src/db/db.js"
import { createServer } from "http";
import setupSocket from "./src/sockets/socket.js";

const httpServer = createServer(app);
setupSocket(httpServer);

// Start server only after DB connects
async function startServer() {
    try {
        // Wait for MongoDB to connect
        await connectDB();
        
        // Only start listening after successful DB connection
        httpServer.listen(3000, () => {
            console.log('🚀 Server is running on port 3000');
            console.log('✅ Ready to accept requests');
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
}

startServer();