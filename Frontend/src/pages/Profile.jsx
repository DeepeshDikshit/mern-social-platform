import { useState, useEffect } from "react"
import axios from "axios"
import PostCard from "../components/PostCard"

export default function Profile() {
    const [userInfo, setUserInfo] = useState(null)
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ totalPosts: 0, totalLikes: 0 })

    useEffect(() => {
        const fetchProfileData = async () => {
            const token = localStorage.getItem("token")
            if (!token) {
                setLoading(false)
                return
            }

            try {
                // Decode JWT to get user info
                const decoded = JSON.parse(atob(token.split('.')[1]))
                const userId = decoded._id

                // Fetch user posts
                const postsRes = await axios.get(
                    "https://mern-social-platform.onrender.com/posts/user/profile",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                )

                setPosts(postsRes.data.posts || [])

                // Calculate stats
                let totalLikes = 0
                postsRes.data.posts?.forEach((post) => {
                    totalLikes += post.likeCount || 0
                })

                setStats({
                    totalPosts: postsRes.data.posts?.length || 0,
                    totalLikes: totalLikes
                })

                // Get user data from first post or from auth token
                if (postsRes.data.posts && postsRes.data.posts.length > 0) {
                    const userData = postsRes.data.posts[0].user
                    setUserInfo(userData)
                } else {
                    // If no posts, fetch from auth endpoint or use default
                    setUserInfo({
                        username: "Your Profile",
                        email: "user@example.com",
                        image: "https://i0.wp.com/fdlc.org/wp-content/uploads/2021/01/157-1578186_user-profile-default-image-png-clipart.png.jpeg?fit=880%2C769&ssl=1",
                        bio: "Welcome to your profile"
                    })
                }
            } catch (err) {
                console.error("Failed to fetch profile data:", err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchProfileData()
    }, [])

    const handlePostDelete = (deletedPostId) => {
        setPosts((prev) => {
            const updatedPosts = prev.filter((post) => post._id !== deletedPostId)
            
            // Recalculate stats
            let totalLikes = 0
            updatedPosts.forEach((post) => {
                totalLikes += post.likeCount || 0
            })
            
            setStats({
                totalPosts: updatedPosts.length,
                totalLikes: totalLikes
            })
            
            return updatedPosts
        })
    }

    if (loading) {
        return <div className="container">Loading profile...</div>
    }

    if (!userInfo) {
        return (
            <div className="container">
                <div className="profile-empty">
                    <h2>Profile Not Available</h2>
                    <p>Please log in to view your profile.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container profile-page">
            {/* Profile Header */}
            <div className="profile-header">
                <div className="profile-cover"></div>
                
                <div className="profile-info-section">
                    <div className="profile-avatar">
                        <img src={userInfo.image} alt={userInfo.username} />
                    </div>
                    
                    <div className="profile-details">
                        <div className="profile-name-section">
                            <h1 className="profile-username">{userInfo.username}</h1>
                        </div>
                        
                        {userInfo.email && (
                            <p className="profile-email">{userInfo.email}</p>
                        )}
                        
                        {userInfo.bio && (
                            <p className="profile-bio">{userInfo.bio}</p>
                        )}
                    </div>
                    
                    {/* Stats */}
                    <div className="profile-stats">
                        <div className="stat-item">
                            <span className="stat-value">{stats.totalPosts}</span>
                            <span className="stat-label">Posts</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{stats.totalLikes}</span>
                            <span className="stat-label">Likes</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts Section */}
            <div className="profile-posts-section">
                <h2 className="section-title">Posts</h2>
                
                {posts.length === 0 ? (
                    <div className="profile-empty-posts">
                        <p>No posts yet. Create your first post! 📸</p>
                    </div>
                ) : (
                    <div className="profile-posts-grid">
                        {posts.map((post) => {
                            const token = localStorage.getItem("token")
                            const currentUserId = token ? JSON.parse(atob(token.split('.')[1]))._id : null
                            return (
                            <PostCard
                                key={post._id}
                                id={post._id}
                                username={post.user?.username || "Anonymous"}
                                avatarUrl={post.user?.image || "https://i0.wp.com/fdlc.org/wp-content/uploads/2021/01/157-1578186_user-profile-default-image-png-clipart.png.jpeg?fit=880%2C769&ssl=1"}
                                postImage={post.image}
                                likesCount={Math.max(Number(post.likeCount) || 0, 0)}
                                caption={post.caption}
                                comments={post.comments || []}
                                setPosts={setPosts}
                                currentUserId={currentUserId}
                                userId={post.user?._id}
                            />
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
