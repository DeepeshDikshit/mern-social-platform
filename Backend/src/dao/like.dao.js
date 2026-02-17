import likeModel from "../models/like.model.js";

// Create a like and return isLiked status
export async function createLike({ user, post }) {
    const like = await likeModel.create({ user, post });
    return like;
}

// Check if a like exists for this user and post
export async function isLikeExists({ user, post }) {
    const like = await likeModel.findOne({ user, post })
    return like;
}

// Delete a like
export async function deleteLike({ user, post }) {
    await likeModel.findOneAndDelete({ user, post })
}

// Count total likes for a post
export async function getLikeCount({ post }) {
    const count = await likeModel.countDocuments({ post })
    return count;
}