import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Send,
  MoreVertical,
  Paperclip,
  Smile,
  Users,
  Clock,
  CheckCheck,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import messageApi from "../services/messageApi";

export default function Messages() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  const [isDeletingConversation, setIsDeletingConversation] = useState(false);

  const handleConfirmDeleteConversation = async () => {
    if (!conversationToDelete) return;
    try {
      setIsDeletingConversation(true);
      const res = await messageApi.deleteConversation(conversationToDelete.conversationId);
      if (res?.success) {
        const remaining = conversations.filter(
          (c) => c.conversationId !== conversationToDelete.conversationId
        );
        setConversations(remaining);
        if (activeConversation?.conversationId === conversationToDelete.conversationId) {
          setActiveConversation(remaining.length > 0 ? remaining[0] : null);
          setMessages([]);
        }
        setConversationToDelete(null);
      } else {
        alert(res?.message || "Failed to delete conversation.");
      }
    } catch (err) {
      console.error("Error deleting conversation:", err);
      alert(err.response?.data?.message || err.message || "Failed to delete conversation.");
    } finally {
      setIsDeletingConversation(false);
    }
  };

  const messagesEndRef = useRef(null);
  const activeConversationRef = useRef(null);

  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(() => {
      fetchConversations(false);
      if (activeConversationRef.current?.conversationId) {
        fetchThreadSilent(activeConversationRef.current.conversationId);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const recipientId = new URLSearchParams(location.search).get("recipient") || location.state?.recipientId;
    const currentUserId = user?._id || user?.id;
    if (!recipientId || recipientId === currentUserId) return;
    const openRecipientConversation = async () => {
      const data = await messageApi.getMessagesWithUser(recipientId);
      if (!data.success) return;
      const latest = data.messages?.[data.messages.length - 1];
      const recipient =
        data.user ||
        (latest?.recipient?._id === user?._id
          ? latest.sender
          : latest?.recipient);
      const conversation = {
        conversationId: data.conversationId,
        name: recipient?.name || "New conversation",
        avatar: recipient?.avatar || "",
        otherUserId: recipientId,
        isTeamChat: false,
        lastMessage: latest?.content || "No messages yet",
        timeFormatted: latest
          ? new Date(latest.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
      };
      setConversations((current) => [
        conversation,
        ...current.filter(
          (item) => item.conversationId !== conversation.conversationId,
        ),
      ]);
      setActiveConversation(conversation);
      setMessages(data.messages || []);
    };
    openRecipientConversation().catch((error) =>
      console.error("Error opening conversation:", error),
    );
  }, [location.search, location.state?.recipientId, user?._id, user?.id]);

  useEffect(() => {
    if (activeConversation?.conversationId) {
      fetchThreadMessages(activeConversation.conversationId);
    }
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await messageApi.getConversations({ type: "dm" });
      if (data.success) {
        const list = (data.conversations || []).filter((c) => !c.isTeamChat);
        setConversations(list);
        if (list.length > 0) setActiveConversation((current) => current || list[0]);
      }
    } catch (e) {
      console.error("Error fetching conversations:", e);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchThreadMessages = async (conversationId) => {
    if (!conversationId) return;
    try {
      const data = await messageApi.getThreadMessages(conversationId);
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error("Error fetching messages:", e);
    }
  };

  const fetchThreadSilent = async (conversationId) => {
    if (!conversationId) return;
    try {
      const data = await messageApi.getThreadMessages(conversationId);
      if (data.success && data.messages) {
        setMessages(data.messages);
      }
    } catch (e) {
      // Silent polling failure
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    const outgoingText = newMessage.trim();
    setNewMessage("");

    // Optimistic append
    const tempMsg = {
      _id: Date.now().toString(),
      sender: { _id: user?._id, name: user?.name },
      content: outgoingText,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const payload = {
        conversationId: activeConversation.conversationId,
        recipientId: activeConversation.otherUserId,
        isTeamChat: activeConversation.isTeamChat,
        content: outgoingText,
      };
      const data = await messageApi.sendMessage(payload);
      if (data.success && data.message) {
        setMessages((prev) =>
          prev.map((m) => (m._id === tempMsg._id ? data.message : m)),
        );
        fetchConversations(false);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalUnread = conversations.reduce(
    (acc, c) => acc + (c.unreadCount || 0),
    0,
  );

  return (
    <div className="h-[calc(100vh-5rem)] p-6 max-w-[1320px] mx-auto flex gap-4 text-[#F5F5F5]">
      {/* Left Pane: Conversation List */}
      <div className="w-[380px] bg-[#262626] border border-[#3A3A3A] rounded-[10px] flex flex-col shrink-0 overflow-hidden shadow-card">
        {/* Search header */}
        <div className="p-4 border-b border-[#3A3A3A] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-bold text-[#F5F5F5]">Messages</h2>
            {totalUnread > 0 && (
              <span className="text-[12px] px-2.5 py-0.5 rounded-full bg-[rgba(255,138,0,0.12)] text-[#FF8A00] font-semibold border border-[rgba(255,138,0,0.35)]">
                {totalUnread} Unread
              </span>
            )}
          </div>
          <div className="relative">
            <Search className="w-5 h-5 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] text-[#F5F5F5] placeholder-[#777777] text-[16px] rounded-[8px] pl-10 pr-3.5 focus:outline-none focus:border-[#FF8A00] transition-colors"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#3A3A3A]/40">
          {loading && conversations.length === 0 ? (
            <div className="p-8 text-center text-[14px] text-[#777777]">
              Loading chats...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-[14px] text-[#777777]">
              No active conversations found
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive =
                activeConversation?.conversationId === conv.conversationId;

              return (
                <div
                  key={conv.conversationId}
                  onClick={() => { setActiveConversation(conv); navigate(location.pathname, { replace: true }); }}
                  className={`group h-[76px] px-4 flex items-center gap-3 cursor-pointer transition-colors ${
                    isActive
                      ? "bg-[rgba(255,138,0,0.10)] border-l-[3px] border-[#FF8A00]"
                      : "hover:bg-[#2D2D2D]"
                  }`}
                >
                  <div className="relative shrink-0">
                    {conv.isTeamChat ? (
                      <div className="w-[46px] h-[46px] rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6] font-bold text-[14px]">
                        <Users className="w-5 h-5" />
                      </div>
                    ) : conv.avatar ? (
                      <img
                        src={conv.avatar}
                        alt={conv.name}
                        className="w-[46px] h-[46px] rounded-full object-cover border border-[#3A3A3A]"
                      />
                    ) : (
                      <div className="w-[46px] h-[46px] rounded-full bg-[#1A1A1A] border border-[#3A3A3A] text-[#F5F5F5] flex items-center justify-center text-[15px] font-bold">
                        {conv.name?.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-[#262626] ${conv.isOnline ? "bg-[#22C55E]" : "bg-[#777777]"}`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-[16px] font-semibold truncate ${isActive ? "text-[#FF8A00]" : "text-[#F5F5F5]"}`}
                      >
                        {conv.name}
                      </h4>
                      <span className="text-[12px] text-[#777777] shrink-0">
                        {conv.timeFormatted}
                      </span>
                    </div>
                    <p className="text-[14px] text-[#A0A0A0] truncate mt-0.5">
                      {conv.lastMessage || "No messages yet"}
                    </p>
                  </div>

                  {conv.unreadCount > 0 && (
                    <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#FF8A00] text-[#1A1A1A] font-bold text-[12px] flex items-center justify-center shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConversationToDelete(conv);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-[#777777] hover:text-[#EF4444] rounded transition-opacity cursor-pointer shrink-0"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane: Active Chat Room */}
      {activeConversation ? (
        <div className="flex-1 bg-[#262626] border border-[#3A3A3A] rounded-[10px] flex flex-col overflow-hidden shadow-card">
          {/* Top Chat Header */}
          <div className="h-[68px] border-b border-[#3A3A3A] px-6 flex items-center justify-between shrink-0 bg-[#262626]">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                {activeConversation.isTeamChat ? (
                  <div className="w-11 h-11 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6] font-bold text-[14px]">
                    <Users className="w-5 h-5" />
                  </div>
                ) : activeConversation.avatar ? (
                  <img
                    src={activeConversation.avatar}
                    alt={activeConversation.name}
                    className="w-11 h-11 rounded-full object-cover border border-[#3A3A3A]"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-[#1A1A1A] text-[#F5F5F5] border border-[#3A3A3A] flex items-center justify-center text-[14px] font-bold">
                    {activeConversation.name?.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#22C55E] ring-2 ring-[#262626]" />
              </div>
              <div>
                <h3 className="text-[18px] font-semibold text-[#F5F5F5] flex items-center gap-2.5">
                  <span>{activeConversation.name}</span>
                  {activeConversation.isTeamChat && (
                    <span className="text-[12px] font-medium px-2 py-0.5 rounded-[4px] bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30">
                      Team Project
                    </span>
                  )}
                </h3>
                <p className="text-[13.5px] text-[#22C55E] flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                  {activeConversation.isTeamChat
                    ? "Active workspace channel"
                    : "Online on campus network"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConversationToDelete(activeConversation)}
                className="h-[36px] px-3.5 rounded-[6px] text-[13px] font-semibold text-[#A0A0A0] hover:text-[#EF4444] hover:bg-red-500/10 border border-[#3A3A3A] hover:border-red-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Delete this conversation"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Chat</span>
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#1A1A1A]">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-[#777777] text-[14px]">
                <Users className="w-9 h-9 mb-2.5 text-[#777777]" />
                <p>
                  This is the start of your conversation with{" "}
                  {activeConversation.name}.
                </p>
                <p className="text-[13px] text-[#777777] mt-1">
                  Send a message to collaborate on projects or tasks.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe =
                  msg.sender?._id?.toString() === user?._id?.toString() ||
                  msg.sender === user?._id;

                return (
                  <div
                    key={msg._id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div className="max-w-[70%] space-y-1">
                      {!isMe && (
                        <p className="text-[13px] text-[#A0A0A0] font-semibold pl-1">
                          {msg.sender?.name || "Teammate"}
                        </p>
                      )}
                      <div
                        className={`rounded-[10px] px-4.5 py-3 text-[16px] leading-relaxed ${
                          isMe
                            ? "bg-[#3D2510] border border-[rgba(255,138,0,0.35)] text-[#F5F5F5] font-normal rounded-br-none shadow-sm"
                            : "bg-[#2D2D2D] text-[#F5F5F5] border border-[#3A3A3A] rounded-bl-none"
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 text-[12px] text-[#777777] px-1 ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {isMe && (
                          <CheckCheck className="w-4 h-4 text-[#22C55E]" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Message Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="h-[70px] px-5 border-t border-[#3A3A3A] bg-[#262626] flex items-center gap-3"
          >
            <button
              type="button"
              className="p-2 text-[#777777] hover:text-[#F5F5F5] transition-colors rounded-[6px] cursor-pointer"
              title="Attach File"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message ${activeConversation.name}...`}
              className="flex-1 h-[44px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-4 text-[16px] text-[#F5F5F5] placeholder-[#777777] focus:outline-none focus:border-[#FF8A00] transition-colors"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="h-[44px] px-5 bg-[#FF8A00] hover:bg-[#FF9E2C] text-[#1A1A1A] font-semibold text-[16px] rounded-[8px] disabled:opacity-40 transition-all flex items-center gap-2 cursor-pointer shadow-sm shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 bg-[#262626] border border-[#3A3A3A] rounded-[10px] flex items-center justify-center text-[#777777] text-[15px]">
          Select a conversation from the list to view messages
        </div>
      )}

      {/* Delete Conversation Confirmation Modal */}
      {conversationToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#262626] border border-[#3A3A3A] rounded-[12px] w-full max-w-md p-6 relative shadow-2xl text-[#F5F5F5]">
            <button
              onClick={() => setConversationToDelete(null)}
              className="absolute top-4 right-4 text-[#777777] hover:text-[#F5F5F5] cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-11 h-11 rounded-[10px] bg-red-500/15 border border-red-500/30 flex items-center justify-center text-[#EF4444] shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[19px] font-bold text-[#F5F5F5]">Delete Conversation</h3>
                <p className="text-[13px] text-[#A0A0A0]">Remove chat from your inbox</p>
              </div>
            </div>

            <div className="space-y-2 mb-6 bg-[#1A1A1A] p-4 rounded-[8px] border border-[#3A3A3A]">
              <p className="text-[15px] font-semibold text-[#F5F5F5]">
                Are you sure you want to delete this conversation with{" "}
                <span className="text-[#FF8A00]">{conversationToDelete.name}</span>?
              </p>
              <p className="text-[13px] text-[#777777]">
                This will remove the chat thread from your inbox without affecting other participants.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConversationToDelete(null)}
                className="h-[40px] px-4.5 text-[14px] font-semibold text-[#A0A0A0] hover:text-[#F5F5F5] border border-[#3A3A3A] bg-[#2D2D2D] hover:bg-[#353535] rounded-[8px] cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteConversation}
                disabled={isDeletingConversation}
                className="h-[40px] px-5 font-bold text-[14px] text-white bg-[#DC2626] hover:bg-[#EF4444] rounded-[8px] cursor-pointer transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {isDeletingConversation ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
