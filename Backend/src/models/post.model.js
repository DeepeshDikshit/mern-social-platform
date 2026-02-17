import mongoose from "mongoose";



const postSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true
    },
    imageFileId: {
        type: String,
        default: null
    },
    caption: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    likeCount: {
        type: Number,
        default: 0
    },
    mentions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ]
}, {
    timestamps: true
})

const Post = mongoose.model('posts', postSchema)


export default Post;