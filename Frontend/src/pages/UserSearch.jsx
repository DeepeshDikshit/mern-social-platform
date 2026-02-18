import { useState } from "react";
import axios from "axios";

export default function UserSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const token = localStorage.getItem("token");
      // Placeholder: Backend search endpoint (to be implemented)
      // For now, mock empty results to show empty state
      const res = await axios.get(
        `https://mern-social-platform.onrender.com/users/search?q=${encodeURIComponent(searchQuery)}`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );

      setSearchResults(res.data?.users || []);
    } catch (err) {
      console.error("Search failed:", err.message);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
  };

  return (
    <div className="container search-page">
      <div className="search-header">
        <h1>Find Users</h1>
        <p className="search-subtitle">Discover and connect with people</p>
      </div>

      {/* Search Form */}
      <form className="search-form" onSubmit={handleSearch}>
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search by username or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search users"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={handleClearSearch}
              aria-label="Clear search"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        <button type="submit" className="search-btn" disabled={loading}>
          {loading ? "..." : "Search"}
        </button>
      </form>

      {/* Helper Text */}
      {!hasSearched && (
        <div className="search-helper">
          <p>Start typing to search users</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="search-results-container">
          <div className="search-loading">
            <div className="loading-spinner"></div>
            <p>Searching...</p>
          </div>
        </div>
      )}

      {/* Results */}
      {hasSearched && !loading && (
        <div className="search-results-container">
          {searchResults.length === 0 ? (
            <div className="search-empty-state">
              <p>No users found for "{searchQuery}"</p>
              <p className="search-empty-hint">Try a different search term</p>
            </div>
          ) : (
            <div className="search-results-list">
              {searchResults.map((user) => (
                <div key={user._id} className="user-result-card">
                  <div className="user-result-avatar">
                    <img
                      src={
                        user.image ||
                        "https://i0.wp.com/fdlc.org/wp-content/uploads/2021/01/157-1578186_user-profile-default-image-png-clipart.png.jpeg?fit=880%2C769&ssl=1"
                      }
                      alt={user.username}
                    />
                  </div>
                  <div className="user-result-info">
                    <h3 className="user-result-username">{user.username}</h3>
                    {user.email && (
                      <p className="user-result-email">{user.email}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
