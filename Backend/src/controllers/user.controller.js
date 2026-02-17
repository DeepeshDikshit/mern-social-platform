import { searchUsers } from "../dao/user.dao.js";

/**
 * Search users by email or username
 * GET /users/search?q=searchTerm
 */
export async function searchUsersController(req, res) {
    try {
        const { q } = req.query;

        // Validate search query
        if (!q || !q.trim()) {
            return res.status(400).json({
                message: "Search query is required",
                users: []
            });
        }

        // Search for users
        const users = await searchUsers(q);

        // Return results (empty array if no matches)
        return res.status(200).json({
            message: "Search completed",
            users: users || []
        });

    } catch (err) {
        console.error("Search users error:", err.message);
        res.status(500).json({
            message: "Internal server error",
            error: err.message,
            users: []
        });
    }
}
