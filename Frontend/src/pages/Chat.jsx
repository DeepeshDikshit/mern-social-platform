import { useState, useEffect, useRef } from "react"
import axios from "axios"

const PROMPT_PRESETS = [
    { label: "✍️ Write a caption", text: "Write me an engaging Instagram caption for a photo. Make it catchy and include relevant hashtags." },
    { label: "📚 Explain simply", text: "Explain this concept in simple terms that anyone can understand:" },
    { label: "✨ Improve text", text: "Please improve and polish this text for better clarity and impact:" },
    { label: "💻 Code help", text: "Help me with this code question:" },
]

function NewChatModal({ onConfirm, onCancel }) {
    const [chatName, setChatName] = useState("")
    const inputRef = useRef(null)

    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault()
        const trimmed = chatName.trim()
        if (!trimmed) {
            alert("Please enter a chat name")
            return
        }
        onConfirm(trimmed)
    }

    const handleCancel = () => {
        setChatName("")
        onCancel()
    }

    return (
        <div className="ai-modal-overlay">
            <div className="ai-modal-content">
                <h2>New Chat</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        ref={inputRef}
                        type="text"
                        className="ai-modal-input"
                        placeholder="Enter chat name (e.g., 'Project Ideas', 'Learning')"
                        value={chatName}
                        onChange={(e) => setChatName(e.target.value)}
                        maxLength="50"
                    />
                    <div className="ai-modal-buttons">
                        <button type="submit" className="ai-modal-confirm">
                            Create
                        </button>
                        <button type="button" className="ai-modal-cancel" onClick={handleCancel}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function RenameModal({ onConfirm, onCancel, currentTitle }) {
    const [newTitle, setNewTitle] = useState(currentTitle)
    const inputRef = useRef(null)

    useEffect(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault()
        const trimmed = newTitle.trim()
        if (!trimmed) {
            alert("Please enter a chat name")
            return
        }
        onConfirm(trimmed)
    }

    const handleCancel = () => {
        setNewTitle(currentTitle)
        onCancel()
    }

    return (
        <div className="ai-modal-overlay">
            <div className="ai-modal-content">
                <h2>Rename Chat</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        ref={inputRef}
                        type="text"
                        className="ai-modal-input"
                        placeholder="Enter new chat name"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        maxLength="100"
                    />
                    <div className="ai-modal-buttons">
                        <button type="submit" className="ai-modal-confirm">
                            Rename
                        </button>
                        <button type="button" className="ai-modal-cancel" onClick={handleCancel}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function Chat() {
    const [conversations, setConversations] = useState([])
    const [currentConvId, setCurrentConvId] = useState(null)
    const [messages, setMessages] = useState([])
    const [inputText, setInputText] = useState("")
    const [loading, setLoading] = useState(false)
    const [isLoadingHistory, setIsLoadingHistory] = useState(true)
    const [showHistoryPanel, setShowHistoryPanel] = useState(false)
    const [showNewChatModal, setShowNewChatModal] = useState(false)
    const [showRenameModal, setShowRenameModal] = useState(false)
    const [renameConvId, setRenameConvId] = useState(null)
    const [renamingConvTitle, setRenamingConvTitle] = useState("")
    const messagesEndRef = useRef(null)

    // Fetch conversations on mount
    useEffect(() => {
        const fetchConversations = async () => {
            const token = localStorage.getItem("token")
            if (!token) {
                setIsLoadingHistory(false)
                return
            }

            try {
                const res = await axios.get(
                    "https://mern-social-platform.onrender.com/ai/conversations",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                )
                setConversations(res.data.conversations || [])
                
                // Load first conversation if exists
                if (res.data.conversations && res.data.conversations.length > 0) {
                    loadConversation(res.data.conversations[0]._id)
                }
            } catch (err) {
                console.error("Failed to fetch conversations:", err.response?.status || err.message)
            } finally {
                setIsLoadingHistory(false)
            }
        }

        fetchConversations()
    }, [])

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const loadConversation = async (convId) => {
        const token = localStorage.getItem("token")
        if (!token) return

        try {
            const res = await axios.get(
                `https://mern-social-platform.onrender.com/ai/history/${convId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )
            setCurrentConvId(convId)
            setMessages(res.data.history || [])
            setShowHistoryPanel(false)
        } catch (err) {
            console.error("Failed to load conversation:", err.message)
        }
    }

    const handleNewChatClick = () => {
        setShowNewChatModal(true)
    }

    const handleCreateNewChat = (chatTitle) => {
        setShowNewChatModal(false)
        setCurrentConvId(null)
        setMessages([])
        setInputText("")
        // Store the title to be used when first message is sent
        sessionStorage.setItem("newChatTitle", chatTitle)
    }

    const handleCancelNewChat = () => {
        setShowNewChatModal(false)
    }

    const handleRenameClick = (convId, convTitle) => {
        setRenameConvId(convId)
        setRenamingConvTitle(convTitle)
        setShowRenameModal(true)
    }

    const handleConfirmRename = async (newTitle) => {
        const token = localStorage.getItem("token")
        if (!token) return

        try {
            await axios.patch(
                `https://mern-social-platform.onrender.com/ai/conversation/${renameConvId}`,
                { title: newTitle },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )

            // Update conversations list
            setConversations((prev) =>
                prev.map((conv) =>
                    conv._id === renameConvId ? { ...conv, title: newTitle } : conv
                )
            )

            setShowRenameModal(false)
            setRenameConvId(null)
        } catch (err) {
            console.error("Failed to rename conversation:", err.message)
            alert("Failed to rename chat")
        }
    }

    const handleCancelRename = () => {
        setShowRenameModal(false)
        setRenameConvId(null)
    }

    const handleDeleteClick = (convId) => {
        if (window.confirm("Are you sure you want to delete this chat? This action cannot be undone.")) {
            handleConfirmDelete(convId)
        }
    }

    const handleConfirmDelete = async (convId) => {
        const token = localStorage.getItem("token")
        if (!token) return

        try {
            await axios.delete(
                `https://mern-social-platform.onrender.com/ai/conversation/${convId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )

            // Remove from conversations list
            setConversations((prev) => prev.filter((conv) => conv._id !== convId))

            // If the deleted conversation is the current one, reset UI
            if (currentConvId === convId) {
                setCurrentConvId(null)
                setMessages([])
                setInputText("")
            }
        } catch (err) {
            console.error("Failed to delete conversation:", err.message)
            alert("Failed to delete chat")
        }
    }

    const sendMessage = async (text = null) => {
        const token = localStorage.getItem("token")

        if (!token) {
            alert("Please login to use AI Chat")
            return
        }

        const messageText = text || inputText.trim()

        if (!messageText) {
            alert("Message cannot be empty")
            return
        }

        if (!text) {
            setInputText("")
        }

        // Add user message to UI
        const userMessage = {
            role: "user",
            text: messageText,
            createdAt: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, userMessage])
        setLoading(true)

        try {
            // Prepare request body
            const requestBody = { 
                message: messageText,
                conversationId: currentConvId
            }
            
            // Add title if creating new conversation
            if (!currentConvId) {
                const newChatTitle = sessionStorage.getItem("newChatTitle")
                if (newChatTitle) {
                    requestBody.title = newChatTitle
                    sessionStorage.removeItem("newChatTitle")
                }
            }

            const res = await axios.post(
                "https://mern-social-platform.onrender.com/ai/chat",
                requestBody,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )

            // Update current conversation ID if creating new chat
            if (!currentConvId) {
                const newConvId = res.data.conversationId
                const chatTitle = requestBody.title || "Untitled Chat"
                
                setCurrentConvId(newConvId)
                
                // Add to conversations list
                setConversations((prev) => [
                    { _id: newConvId, title: chatTitle, createdAt: new Date() },
                    ...prev
                ])
            }

            // Add AI response to UI
            const aiMessage = {
                role: "ai",
                text: res.data.response.text,
                createdAt: res.data.response.createdAt,
            }
            setMessages((prev) => [...prev, aiMessage])
        } catch (err) {
            console.error("Send message failed:", err.response?.status || err.message)

            const errorMessage = {
                role: "ai",
                text: err.response?.data?.message || "Failed to get a response. Please try again.",
                createdAt: new Date().toISOString(),
            }
            setMessages((prev) => [...prev, errorMessage])
        } finally {
            setLoading(false)
        }
    }

    const handlePreset = (presetText) => {
        setInputText(presetText)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        sendMessage()
    }

    if (isLoadingHistory) {
        return <div className="container">Loading chat...</div>
    }

    return (
        <div className="ai-chat-page">
            {showNewChatModal && (
                <NewChatModal
                    onConfirm={handleCreateNewChat}
                    onCancel={handleCancelNewChat}
                />
            )}

            {showRenameModal && (
                <RenameModal
                    onConfirm={handleConfirmRename}
                    onCancel={handleCancelRename}
                    currentTitle={renamingConvTitle}
                />
            )}

            {/* Sidebar for conversation history */}
            <div className={`ai-history-sidebar ${showHistoryPanel ? 'open' : ''}`}>
                <div className="ai-sidebar-header">
                    <h3>Chats</h3>
                    <button className="ai-close-sidebar" onClick={() => setShowHistoryPanel(false)}>×</button>
                </div>
                
                <button className="ai-new-chat-btn" onClick={handleNewChatClick}>
                    ➕ New Chat
                </button>
                
                <div className="ai-conversations-list">
                    {conversations.length === 0 ? (
                        <p className="ai-empty-convs">No conversations yet</p>
                    ) : (
                        conversations.map((conv) => (
                            <div
                                key={conv._id}
                                className={`ai-conv-item ${currentConvId === conv._id ? 'active' : ''}`}
                                onClick={() => loadConversation(conv._id)}
                            >
                                <div className="ai-conv-info">
                                    <span className="ai-conv-title">{conv.title}</span>
                                    <span className="ai-conv-date">
                                        {new Date(conv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                                <div className="ai-conv-actions">
                                    <button
                                        className="ai-conv-btn ai-rename-btn"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleRenameClick(conv._id, conv.title)
                                        }}
                                        title="Rename"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="ai-conv-btn ai-delete-btn"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteClick(conv._id)
                                        }}
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main chat container */}
            <div className="ai-chat-main">
                {/* Header with toggle button */}
                <div className="ai-chat-header">
                    <button 
                        className="ai-toggle-sidebar"
                        onClick={() => setShowHistoryPanel(!showHistoryPanel)}
                    >
                        ☰ Chats
                    </button>
                    <h1>Chat with AI ✨</h1>
                    <button className="ai-new-chat-mobile" onClick={handleNewChatClick}>
                        ➕ New
                    </button>
                </div>

                {/* Messages area */}
                <div className="ai-messages-container">
                    {messages.length === 0 && !currentConvId ? (
                        <div className="ai-empty-state">
                            <h2>Start a conversation</h2>
                            <p>Ask me anything or use a preset below</p>
                        </div>
                    ) : (
                        <div className="ai-messages-list">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`ai-message ${msg.role}-msg`}
                                >
                                    <div className="ai-msg-bubble">
                                        <span className="ai-msg-icon">{msg.role === "user" ? "👤" : "🤖"}</span>
                                        <div className="ai-msg-text">{msg.text}</div>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="ai-message ai-msg">
                                    <div className="ai-msg-bubble">
                                        <span className="ai-msg-icon">🤖</span>
                                        <div className="ai-msg-text">Thinking...</div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Presets and input form */}
                <div className="ai-chat-footer">
                    <div className="ai-presets-row">
                        {PROMPT_PRESETS.map((preset, idx) => (
                            <button
                                key={idx}
                                className="ai-preset-btn"
                                onClick={() => handlePreset(preset.text)}
                                disabled={loading}
                                title={preset.label}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>

                    <form className="ai-input-form" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            className="ai-text-input"
                            placeholder="Type your message..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            className="ai-send-btn"
                            disabled={loading || !inputText.trim()}
                        >
                            {loading ? "⟳" : "→"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
