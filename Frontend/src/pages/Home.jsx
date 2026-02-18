import PostCard from "../components/PostCard.jsx";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Get current user ID from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Decode JWT manually (split by '.', decode payload)
        const payload = JSON.parse(
          atob(token.split('.')[1])
        );
        setCurrentUserId(payload.id || payload._id);
      } catch (err) {
        console.error("Failed to decode token:", err);
      }
    }
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(
          "https://mern-social-platform.onrender.com/posts",
          {
            params: { skip: 0, limit: 20 },
          }
        );

        // Handle different backend response shapes safely
        const postsData =
          res.data?.posts || res.data?.data || [];

        setPosts(postsData);
      } catch (err) {
        console.error(
          "Failed to fetch posts:",
          err.response?.status || err.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <div className="container">Loading feed...</div>;
  }

  return (
    <div className="container">
      <div className="feed" aria-label="Home feed">
        {posts.length === 0 && (
          <p>No posts available</p>
        )}

        {posts.map((post) => (
          <PostCard
            key={post._id}
            id={post._id}
            username={post.user?.username || "anonymous"}
            avatarUrl={post.user?.image || ""}
            postImage={post.image}
            likesCount={post.likeCount || 0}
            caption={post.caption}
            comments={post.comments || []}
            setPosts={setPosts}
            currentUserId={currentUserId}
            userId={post.user?._id}
          />
        ))}
      </div>
    </div>
  );
}
