import axios from "axios";
import { useState } from "react";

export default function PostCard({
  id,
  username,
  avatarUrl,
  postImage,
  likesCount,
  caption,
  comments = [],
  setPosts,
  currentUserId,
  userId,
}) {
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [localComments, setLocalComments] = useState(comments);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  const preview = Array.isArray(localComments)
    ? localComments.slice(0, 2)
    : [];

  // Check if current user is the post owner
  const isPostOwner = currentUserId === userId;

  const likePost = async () => {
    const token = localStorage.getItem("token");

    // Not logged in
    if (!token) {
      alert("Please login to like posts");
      return;
    }

    try {
      const res = await axios.post(
        "https://mern-social-platform.onrender.com/posts/like",
        { post: id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Use likeCount from backend response (source of truth)
      const likeCount = Math.max(Number(res.data?.likeCount) || 0, 0);

      // Update posts with likeCount from backend
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === id
            ? {
                ...post,
                likeCount: likeCount,
              }
            : post
        )
      );
    } catch (err) {
      console.error(
        "Like failed:",
        err.response?.status || err.message
      );
      alert("Failed to like post");
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem("token");

    // Not logged in
    if (!token) {
      alert("Please login to comment");
      return;
    }

    // Empty comment
    if (!commentText.trim()) {
      alert("Comment cannot be empty");
      return;
    }

    setIsSubmittingComment(true);

    try {
      const res = await axios.post(
        "https://mern-social-platform.onrender.com/posts/comment",
        { post: id, text: commentText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newComment = {
        user: res.data.comment.user,
        text: res.data.comment.text,
        createdAt: res.data.comment.createdAt
      };

      // Update local comments immediately
      setLocalComments([...localComments, newComment]);
      setCommentText("");
    } catch (err) {
      console.error("Comment failed:", err.response?.status || err.message);
      alert("Failed to post comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const deletePost = async () => {
    // Ask for confirmation
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to delete posts");
      return;
    }

    setIsDeletingPost(true);

    try {
      await axios.delete(
        `https://mern-social-platform.onrender.com/posts/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Remove post from UI immediately
      setPosts((prevPosts) =>
        prevPosts.filter((post) => post._id !== id)
      );

      console.log("Post deleted successfully");
    } catch (err) {
      console.error("Delete failed:", err.response?.status || err.message);
      alert(err.response?.data?.message || "Failed to delete post");
    } finally {
      setIsDeletingPost(false);
    }
  };

  const sharePost = async () => {
    // Generate shareable URL using post ID
    const shareUrl = `${window.location.origin}/home?post=${id}`;
    const shareText = `Check out this post by @${username}`;

    try {
      // Try Web Share API first (mobile friendly, native share options)
      if (navigator.share) {
        await navigator.share({
          title: "N22 Social",
          text: shareText,
          url: shareUrl,
        });
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        alert("Post link copied to clipboard!");
      }
    } catch (err) {
      // Share cancelled or clipboard failed silently
      if (err.name !== "AbortError") {
        // Only log if not user cancellation
        console.error("Share failed:", err.message);
      }
    }
  };

  return (
    <article className="post card">
      <header className="post-header">
        <img
          className="avatar"
          src={avatarUrl}
          alt={`${username} avatar`}
        />
        <div className="user">
          <strong className="username">{username}</strong>
        </div>
        {isPostOwner && (
          <button
            onClick={deletePost}
            disabled={isDeletingPost}
            className="delete-btn"
            aria-label="Delete post"
            title="Delete this post"
          >
            {isDeletingPost ? "..." : "🗑️"}
          </button>
        )}
      </header>

      <div className="post-media">
        <img
          className="post-image"
          src={postImage}
          alt="Post media"
        />
      </div>

      <div className="post-actions" aria-label="Post actions">
        <button
          onClick={likePost}
          className="icon-btn"
          aria-label="Like"
        >
          ❤️
        </button>
        <button className="icon-btn" aria-label="Comment">
          💬
        </button>
        <button
          onClick={sharePost}
          className="icon-btn"
          aria-label="Share"
          title="Share this post"
        >
          📤
        </button>
      </div>

      <div className="post-body">
        <div className="likes">
          {Number(likesCount).toLocaleString()} likes
        </div>

        <div className="caption">
          <strong className="username">{username}</strong>
          <span> {caption}</span>
        </div>

        <div className="post-comments">
          {preview.map((c, idx) => (
            <div key={idx} className="comment">
              <strong className="username">{c.user}</strong>
              <span> {c.text}</span>
            </div>
          ))}
        </div>

        {localComments.length > 2 && (
          <div className="show-more-comments">
            +{localComments.length - 2} more comment{localComments.length - 2 !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      <form className="comment-form" onSubmit={submitComment}>
        <input
          type="text"
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          disabled={isSubmittingComment}
          className="comment-input"
        />
        <button
          type="submit"
          disabled={isSubmittingComment || !commentText.trim()}
          className="comment-btn"
        >
          {isSubmittingComment ? "..." : "Post"}
        </button>
      </form>
    </article>
  );
}
