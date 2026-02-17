import postModel from "../models/post.model.js"
import userModel from "../models/user.model.js"
import commentModel from "../models/comment.model.js"

export async function createPost(data) {

    const { mentions, url, fileId, caption, user } = data

    // Process mentions safely
    let mentionIds = []
    if (mentions && mentions.trim()) {
        const usernames = mentions
            .split(",")
            .map(username => username.trim().replace(/^@/, ''))
            .filter(username => username.length > 0)
        
        if (usernames.length > 0) {
            const mentionedUsers = await Promise.all(
                usernames.map(username => userModel.findOne({ username }))
            )
            mentionIds = mentionedUsers
                .filter(user => user !== null)
                .map(user => user._id)
        }
    }

    const post = await postModel.create({
        image: url,
        imageFileId: fileId,
        caption,
        user,
        mentions: mentionIds
    })

    return post
}


export async function incrementLikeCount(postId, incrementBy) {
    // Ensure likeCount never goes below 0
    const post = await postModel.findById(postId)
    const currentCount = post?.likeCount || 0
    const newCount = Math.max(currentCount + incrementBy, 0)
    return await postModel.findByIdAndUpdate(
        postId,
        { likeCount: newCount },
        { new: true }
    )
}

export async function getPosts(skip = 0, limit = 10) {

    const posts = await postModel
        .find()
        .sort({ createdAt: -1 }) // Sort by creation date, newest first
        .skip(skip)
        .limit(limit)
        .populate("user")

    // Fetch comments for each post with user details
    const postsWithComments = await Promise.all(posts.map(async (post) => {
        const comments = await commentModel
            .find({ post: post._id })
            .populate({
                path: 'user',
                select: 'username email image'
            })
            .sort({ createdAt: -1 })
        
        const postObj = post.toObject()
        postObj.comments = comments.map(c => ({
            _id: c._id,
            user: c.user?.username || 'anonymous',
            text: c.text,
            userObj: c.user
        }))
        
        return postObj
    }))

    return postsWithComments
}

export async function deletePost(postId) {
    return await postModel.findByIdAndDelete(postId)
}