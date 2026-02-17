import { uploadFile, deleteFile } from "../services/storage.service.js"
import { generateCaption } from "../services/ai.service.js"
import { v4 as uuidv4 } from "uuid"
import { createPost, getPosts, incrementLikeCount, deletePost } from "../dao/post.dao.js"
import { createComment, } from "../dao/comment.dao.js"
import { createLike, isLikeExists, deleteLike } from "../dao/like.dao.js"
import postModel from "../models/post.model.js"

/* image , mentions? */

export async function createPostController(req, res) {
    try {

        const { mentions } = req.body

        console.log('File received:', req.file ? `${req.file.originalname} (${req.file.size} bytes)` : 'NO FILE')
        console.log('Mentions:', mentions)

        if (!req.file) {
            return res.status(400).json({
                message: "No image file provided",
                error: "File is required"
            })
        }

        // Upload file and generate caption in parallel with error handling
        let fileUrl = null
        let fileId = null
        let caption = "Check out this amazing moment! 📸✨"

        const results = await Promise.allSettled([
            uploadFile(req.file, uuidv4()),
            generateCaption(req.file)
        ])

        // Handle file upload result
        if (results[0].status === 'fulfilled') {
            fileUrl = results[0].value.url
            fileId = results[0].value.fileId
            console.log('✓ File uploaded successfully')
            console.log('  Stored fileId:', fileId || 'MISSING')
        } else {
            console.error('✗ File upload failed:', results[0].reason.message)
            return res.status(500).json({
                message: "Image upload failed",
                error: results[0].reason.message
            })
        }

        // Handle caption generation result (optional, use default on failure)
        if (results[1].status === 'fulfilled') {
            caption = results[1].value
            console.log('✓ Caption generated successfully')
        } else {
            console.warn('⚠ Caption generation failed, using default:', results[1].reason.message)
        }

        const post = await createPost({
            mentions,
            url: fileUrl,
            fileId,
            caption,
            user: req.user._id
        })

        // Populate user data in response
        const populatedPost = await post.populate("user")

        res.status(201).json({
            message: "Post created successfully",
            post: populatedPost
        })

    } catch (error) {
        console.log('Post creation error:', error)
        res.status(500).json({
            message: "Error creating post",
            error: error.message
        })
    }
}

export async function getPostController(req, res) {
    const posts = await getPosts(req.query.skip || 0, Math.min(req.query.limit, 20))

    return res.status(200).json({
        message: "Posts fetched successfully",
        posts
    })

}

export async function createCommentController(req, res) {
    try {
        const { post, text } = req.body
        const user = req.user

        // Validate text is not just whitespace
        if (!text || text.trim().length === 0) {
            return res.status(400).json({
                message: "Comment text cannot be empty",
                error: "Text must contain at least one character"
            })
        }

        const comment = await createComment({
            user: user._id,
            post,
            text: text.trim()
        })

        // Populate user data in response
        const populatedComment = await comment.populate("user")

        return res.status(201).json({
            message: "Comment created successfully",
            comment: {
                _id: populatedComment._id,
                user: populatedComment.user.username,
                post: populatedComment.post,
                text: populatedComment.text,
                createdAt: populatedComment.createdAt
            }
        })
    } catch (error) {
        console.error('Comment creation error:', error)
        res.status(500).json({
            message: "Error creating comment",
            error: error.message
        })
    }
}


export async function createLikeController(req, res) {
    try {
        const { post } = req.body
        const user = req.user

        if (!post) {
            return res.status(400).json({
                message: "Post ID is required"
            })
        }

        // Check if already liked
        const isLikeAlreadyExists = await isLikeExists({ user: user._id, post })

        if (isLikeAlreadyExists) {
            // Unlike: delete the like
            await deleteLike({ user: user._id, post })
            // Decrement count, but ensure it doesn't go below 0
            await incrementLikeCount(post, -1)
            
            // Get current like count from database (source of truth)
            const postData = await postModel.findById(post)
            const likeCount = Math.max(postData?.likeCount || 0, 0)
            
            return res.status(200).json({
                message: "Like removed successfully",
                isLiked: false,
                likeCount: likeCount
            })
        }

        // Like: create the like
        await createLike({ user: user._id, post })
        await incrementLikeCount(post, 1)

        // Get current like count from database (source of truth)
        const postData = await postModel.findById(post)
        const likeCount = Math.max(postData?.likeCount || 0, 0)

        res.status(201).json({
            message: "Post liked successfully",
            isLiked: true,
            likeCount: likeCount
        })

    } catch (err) {
        console.error("Like controller error:", err.message)
        res.status(500).json({
            message: "Internal server error",
            error: err.message
        })
    }
}

export async function deletePostController(req, res) {
    try {
        const { id } = req.params
        const userId = req.user._id

        // Find the post
        const post = await postModel.findById(id)

        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                error: "The post you're trying to delete doesn't exist"
            })
        }

        // Verify ownership - only the creator can delete
        if (post.user.toString() !== userId.toString()) {
            return res.status(403).json({
                message: "Unauthorized",
                error: "You can only delete your own posts"
            })
        }

        // Delete image from ImageKit if fileId exists
        if (post.imageFileId) {
            try {
                console.log('🗑️  Deleting image from ImageKit:', post.imageFileId);
                await deleteFile(post.imageFileId)
                console.log('✓ Image deleted from ImageKit successfully')
            } catch (imageError) {
                console.error('⚠ Failed to delete image from ImageKit:', imageError.message)
                // Continue with post deletion even if image deletion fails
                // Log clearly so we can manually clean up if needed
            }
        } else {
            console.log('ℹ No imageFileId found - skipping ImageKit deletion (older post or direct URL)')
        }

        // Delete the post from database
        await deletePost(id)

        console.log('✓ Post deleted successfully')

        res.status(200).json({
            message: "Post deleted successfully",
            postId: id
        })

    } catch (error) {
        console.error('Post deletion error:', error)
        res.status(500).json({
            message: "Error deleting post",
            error: error.message
        })
    }
}

export async function getUserPostsController(req, res) {
    try {
        const userId = req.user._id
        
        const posts = await postModel
            .find({ user: userId })
            .populate('user', 'username email image')
            .populate('mentions', 'username')
            .sort({ createdAt: -1 })
            .lean()
        
        res.status(200).json({
            message: "User posts fetched successfully",
            posts: posts || []
        })
    } catch (error) {
        console.error('Get user posts error:', error)
        res.status(500).json({
            message: "Error fetching user posts",
            error: error.message
        })
    }
}