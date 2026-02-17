import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "posts",
        required: true
    }
})

const likeModel = mongoose.model("like", likeSchema);

export default likeModel;