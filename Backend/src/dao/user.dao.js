import userModel from "../models/user.model.js";

/** 
* Function to create a new user in the database.
*/
export async function createUser(data){
    return await userModel.create(data);
}

export async function findUser(query) {
    return await userModel.find(query);
}

export async function findOneUser(query) {
    return await userModel.findOne(query);
}

/**
 * Search users by email or username (case-insensitive)
 * @param {string} searchQuery - The search term
 * @returns {Promise<Array>} Array of matching users (without passwords)
 */
export async function searchUsers(searchQuery) {
    if (!searchQuery || !searchQuery.trim()) {
        return [];
    }

    // Create a regex pattern for case-insensitive search
    const regex = new RegExp(searchQuery.trim(), 'i');

    // Search by email (exact or partial) or username (case-insensitive)
    const users = await userModel.find({
        $or: [
            { email: regex },
            { username: regex }
        ]
    })
    .select('_id username email image bio')
    .limit(20)
    .lean();

    return users;
}