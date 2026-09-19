import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Heart,
  Share2,
  Plus,
  Flame,
  Tag,
  Users,
  Search,
  CheckCircle2,
  X,
  Send,
  Trash2,
  Loader2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import communityApi from '../services/communityApi';

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({
    members: '0',
    discussions: 0,
    opportunities: 0,
    popularTopics: []
  });
  const [category, setCategory] = useState('All Posts');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Project Ideas');
  const [newTags, setNewTags] = useState('React, Machine Learning');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Active post for commenting
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    fetchPosts();
    fetchStats();
  }, [category, user?._id, user?.id]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await communityApi.getPosts({ category: category === 'My Posts' ? 'All Posts' : category, limit: 100 });
      if (res?.success) {
        const currentUserId = user?._id || user?.id;
        const allPosts = res.posts || [];
        setPosts(category === 'My Posts'
          ? allPosts.filter(post => (post.author?._id || post.author?.id || post.author)?.toString() === currentUserId?.toString())
          : allPosts);
      }
    } catch (e) {
      console.error('Failed to load community posts:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await communityApi.getStats();
      if (res?.success && res.stats) {
        setStats(res.stats);
      }
    } catch (e) {
      console.error('Failed to load stats:', e);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await communityApi.toggleLike(postId);
      if (res?.success) {
        const userId = user?.id || user?._id;
        setPosts(prev => prev.map(p => {
          if (p._id === postId) {
            const alreadyLiked = p.likes?.includes(userId);
            return {
              ...p,
              likes: alreadyLiked
                ? p.likes.filter(id => id !== userId)
                : [...(p.likes || []), userId]
            };
          }
          return p;
        }));
      }
    } catch (e) {
      console.error('Failed to like post:', e);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    try {
      setSubmitting(true);
      setErrorMsg('');
      const res = await communityApi.createPost({
        title: newTitle,
        content: newContent,
        category: newCategory,
        tags: newTags.split(',').map(t => t.trim()).filter(Boolean)
      });
      if (res?.success) {
        setShowCreateModal(false);
        setNewTitle('');
        setNewContent('');
        if (res.post) setPosts(prev => [res.post, ...prev]);
        else fetchPosts();
        fetchStats();
      }
    } catch (e) {
      console.error(e);
      setErrorMsg(e.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await communityApi.deletePost(postId);
      if (res?.success) {
        setPosts(prev => prev.filter(p => p._id !== postId));
        fetchStats();
      }
    } catch (e) {
      alert(e.message || 'Failed to delete post');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !activeCommentPost) return;
    try {
      const res = await communityApi.addComment(activeCommentPost._id, commentText);
      if (res?.success) {
        setCommentText('');
        fetchPosts();
        if (res.post) {
          setActiveCommentPost(res.post);
        } else {
          setActiveCommentPost(prev => ({
            ...prev,
            comments: [...(prev.comments || []), {
              _id: Date.now().toString(),
              author: { name: user?.name || 'You', avatar: user?.avatar },
              text: commentText,
              createdAt: new Date()
            }]
          }));
        }
      }
    } catch (e) {
      console.error('Failed to add comment:', e);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      const res = await communityApi.deleteComment(postId, commentId);
      if (res?.success) {
        fetchPosts();
        setActiveCommentPost(prev => prev ? {
          ...prev,
          comments: (prev.comments || []).filter(c => c._id !== commentId)
        } : null);
      }
    } catch (e) {
      console.error('Failed to delete comment:', e);
    }
  };

  const categories = [
    'All Posts',
    'My Posts',
    'Project Ideas',
    'Team Building',
    'Tech Help',
    'Opportunities',
    'Hackathons',
    'AI/ML',
    'Web Development',
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1320px] mx-auto text-[#F5F5F5]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] lg:text-[32px] font-bold text-[#F5F5F5] tracking-tight leading-tight">
            Community
          </h1>
          <p className="text-[16px] text-[#A0A0A0] mt-1.5">
            Discuss. Share. Build Together.
          </p>
        </div>
        <button
          onClick={() => {
            setShowCreateModal(true);
            setErrorMsg('');
          }}
          className="h-[44px] px-5 bg-[#FF8A00] hover:bg-[#FF9E2C] text-[#1A1A1A] font-bold text-[16px] rounded-[8px] flex items-center gap-2.5 self-start sm:self-auto transition-all shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Post</span>
        </button>
      </div>

      {/* Categories Bar */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 border-b border-[#3A3A3A]">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-[8px] text-[15px] font-medium whitespace-nowrap transition-all cursor-pointer ${
              category === cat
                ? 'bg-[rgba(255,138,0,0.10)] text-[#FF8A00] border border-[#FF8A00] font-semibold'
                : 'text-[#A0A0A0] hover:text-[#F5F5F5] hover:bg-[#262626]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Grid: Post Feed + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Posts Feed */}
        <div className="lg:col-span-8 space-y-5">
          {loading ? (
            <div className="p-12 text-center text-[#777777] bg-[#262626] border border-[#3A3A3A] rounded-[10px] flex flex-col items-center justify-center">
              <Loader2 className="w-7 h-7 animate-spin text-[#FF8A00] mb-2" />
              <span className="text-[16px] text-[#A0A0A0]">Loading community discussions...</span>
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center bg-[#262626] border border-[#3A3A3A] rounded-[10px] text-[#A0A0A0] text-[16px]">
              No posts in this category yet. Be the first to share!
            </div>
          ) : (
            posts.map((post) => {
              const isAuthor = (user?.id || user?._id) === (post.author?._id || post.author?.id || post.author);
              const userId = user?.id || user?._id;
              const hasLiked = post.likes?.some(id => id.toString() === userId?.toString());

              return (
                <div
                  key={post._id}
                  className="bg-[#262626] border border-[#3A3A3A] hover:border-[#FF8A00]/45 rounded-[12px] p-6 space-y-4 transition-all shadow-card"
                >
                  {/* Author Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#3A3A3A] text-[#FF8A00] font-bold text-[14px] flex items-center justify-center overflow-hidden shrink-0">
                        {post.author?.avatar ? (
                          <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{post.author?.name ? post.author.name.slice(0, 2).toUpperCase() : 'PM'}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-[15.5px] font-semibold text-[#F5F5F5]">{post.author?.name || 'Community Member'}</p>
                        <p className="text-[13px] text-[#777777]">
                          {post.relativeTime || new Date(post.createdAt || Date.now()).toLocaleDateString()} · {post.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] px-2.5 py-1 rounded-[6px] bg-[#1A1A1A] text-[#A0A0A0] border border-[#3A3A3A]">
                        {post.category}
                      </span>
                      {isAuthor && (
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className="text-[#777777] hover:text-[#EF4444] p-1.5 transition-colors cursor-pointer"
                          title="Delete Post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Post Content */}
                  <div>
                    <h3 className="text-[18px] font-bold text-[#F5F5F5] hover:text-[#FF8A00] cursor-pointer transition-colors leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-[16px] text-[#D4D4D4] mt-2 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {post.tags?.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[13px] px-2.5 py-1 rounded-[6px] bg-[#1A1A1A] text-[#FF8A00] border border-[#3A3A3A]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center gap-6 pt-3.5 border-t border-[#3A3A3A] text-[14.5px] text-[#A0A0A0]">
                    <button
                      onClick={() => handleLike(post._id)}
                      className="flex items-center gap-2 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Heart className={`w-4 h-4 ${hasLiked ? 'fill-red-500 text-red-500' : ''}`} />
                      <span className="font-medium">{post.likes?.length || 0}</span>
                    </button>

                    <button
                      onClick={() => setActiveCommentPost(activeCommentPost?._id === post._id ? null : post)}
                      className="flex items-center gap-2 hover:text-[#FF8A00] transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="font-medium">{post.comments?.length || 0} comments</span>
                    </button>

                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(window.location.href);
                        alert('Post link copied to clipboard!');
                      }}
                      className="flex items-center gap-2 hover:text-[#F5F5F5] transition-colors ml-auto cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>

                  {/* Inline Comments Section */}
                  {activeCommentPost?._id === post._id && (
                    <div className="pt-3.5 border-t border-[#3A3A3A] space-y-3.5">
                      <div className="space-y-2.5 max-h-56 overflow-y-auto">
                        {(post.comments || []).length === 0 ? (
                          <p className="text-[13.5px] text-[#777777] italic p-2">No comments yet. Start the conversation!</p>
                        ) : (
                          post.comments.map((c, idx) => {
                            const isCommentAuthor = (user?.id || user?._id) === (c.author?._id || c.author?.id || c.author);
                            return (
                              <div key={c._id || idx} className="p-3 bg-[#1A1A1A] rounded-[8px] border border-[#3A3A3A] text-[14px] flex justify-between items-start">
                                <div className="space-y-1">
                                  <p className="font-semibold text-[#F5F5F5] text-[14px]">{c.author?.name || 'Student'}</p>
                                  <p className="text-[#D4D4D4] text-[15px]">{c.text}</p>
                                </div>
                                {isCommentAuthor && (
                                  <button
                                    onClick={() => handleDeleteComment(post._id, c._id)}
                                    className="text-[#777777] hover:text-[#EF4444] p-1 cursor-pointer"
                                    title="Delete Comment"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>

                      <form onSubmit={handleAddComment} className="flex items-center gap-2.5">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Write a constructive comment or answer..."
                          className="flex-1 h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[15px] text-[#F5F5F5] placeholder-[#777777] focus:outline-none focus:border-[#FF8A00]"
                        />
                        <button
                          type="submit"
                          className="h-[42px] bg-[#FF8A00] hover:bg-[#FF9E2C] text-[#1A1A1A] px-4.5 rounded-[8px] font-bold text-[15px] flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Sidebar: Community Widgets */}
        <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-6">
          {/* Community Stats / Highlights */}
          <div className="bg-[#262626] border border-[#3A3A3A] rounded-[12px] p-6 space-y-4 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-[#3A3A3A]">
              <h4 className="text-[18px] font-bold text-[#F5F5F5] flex items-center gap-2.5">
                <Flame className="w-5 h-5 text-[#FF8A00]" />
                <span>Community Highlights</span>
              </h4>
              <span className="text-[12px] px-2.5 py-0.5 rounded-full bg-[rgba(255,138,0,0.12)] text-[#FF8A00] border border-[rgba(255,138,0,0.3)] font-semibold">
                Live
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between p-3.5 bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[8px] bg-[#FF8A00]/10 border border-[#FF8A00]/25 flex items-center justify-center text-[#FF8A00]">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[12.5px] text-[#777777] block font-medium">Active Innovators</span>
                    <span className="text-[16px] font-bold text-[#F5F5F5]">{stats.members || 280} Students</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[8px] bg-[#3B82F6]/10 border border-[#3B82F6]/25 flex items-center justify-center text-[#3B82F6]">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[12.5px] text-[#777777] block font-medium">Discussions Started</span>
                    <span className="text-[16px] font-bold text-[#F5F5F5]">{stats.discussions || 20} Threads</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[8px] bg-[rgba(34,197,94,0.10)] border border-[rgba(34,197,94,0.25)] flex items-center justify-center text-[#22C55E]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[12.5px] text-[#777777] block font-medium">Opportunities Shared</span>
                    <span className="text-[16px] font-bold text-[#22C55E]">{stats.opportunities || 4} Open</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Topics */}
            <div className="pt-2">
              <span className="text-[13px] text-[#A0A0A0] font-medium block mb-2">Trending Themes</span>
              <div className="flex flex-wrap gap-1.5">
                {['AI/ML', 'Hackathons', 'Web Dev', 'IoT', 'Open Source', 'Tech Help'].map((topic, i) => (
                  <span
                    key={i}
                    onClick={() => setCategory(topic === 'Web Dev' ? 'Web Development' : topic)}
                    className="text-[12px] px-2.5 py-1 rounded-[6px] bg-[#1A1A1A] text-[#A0A0A0] hover:text-[#FF8A00] border border-[#3A3A3A] hover:border-[#FF8A00]/40 transition-colors cursor-pointer"
                  >
                    #{topic}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Guidelines / Community Code */}
          <div className="bg-[#262626] border border-[#3A3A3A] rounded-[12px] p-6 space-y-4 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-[#3A3A3A]">
              <h4 className="text-[18px] font-bold text-[#F5F5F5] flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#22C55E]" />
                <span>Community Code</span>
              </h4>
              <span className="text-[12px] text-[#777777]">Guidelines</span>
            </div>

            <ul className="text-[13.5px] text-[#A0A0A0] space-y-3.5">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#FF8A00] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#F5F5F5] block text-[14px]">Constructive Culture</strong>
                  <span className="text-[#A0A0A0] text-[13px] leading-relaxed">Foster mutual respect across all engineering branches and experience levels.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#FF8A00] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#F5F5F5] block text-[14px]">Proper Attribution</strong>
                  <span className="text-[#A0A0A0] text-[13px] leading-relaxed">Credit open-source repos, research papers, and collaborators properly.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#FF8A00] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#F5F5F5] block text-[14px]">Authentic Content</strong>
                  <span className="text-[#A0A0A0] text-[13px] leading-relaxed">No spam, unverified advertisements, or duplicate threads.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#FF8A00] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#F5F5F5] block text-[14px]">Collaborative Spirit</strong>
                  <span className="text-[#A0A0A0] text-[13px] leading-relaxed">Form cross-department teams and share real milestone results.</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#262626] border border-[#3A3A3A] rounded-[12px] w-full max-w-lg p-6 relative shadow-2xl text-[#F5F5F5]">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-[#777777] hover:text-[#F5F5F5] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-[20px] font-bold text-[#F5F5F5] mb-4">Create Community Post</h3>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/25 text-red-400 rounded-[8px] text-[14px] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreatePost} className="space-y-4 text-[15px]">
              <div>
                <label className="block text-[#A0A0A0] font-medium mb-1.5">Post Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Looking for Frontend Developer for Smart Healthcare App"
                  className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[16px] text-[#F5F5F5] placeholder-[#777777] focus:outline-none focus:border-[#FF8A00]"
                />
              </div>

              <div>
                <label className="block text-[#A0A0A0] font-medium mb-1.5">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[16px] text-[#F5F5F5] focus:outline-none focus:border-[#FF8A00]"
                >
                  <option value="Project Ideas">Project Ideas</option>
                  <option value="Team Building">Team Building</option>
                  <option value="Tech Help">Tech Help</option>
                  <option value="Opportunities">Opportunities</option>
                </select>
              </div>

              <div>
                <label className="block text-[#A0A0A0] font-medium mb-1.5">Content</label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Share details, problem statement, required skills, or links..."
                  className="w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] p-3.5 text-[16px] text-[#F5F5F5] placeholder-[#777777] focus:outline-none focus:border-[#FF8A00]"
                />
              </div>

              <div>
                <label className="block text-[#A0A0A0] font-medium mb-1.5">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="React, AI, Web3, Hackathon"
                  className="w-full h-[42px] bg-[#1A1A1A] border border-[#3A3A3A] rounded-[8px] px-3.5 text-[16px] text-[#F5F5F5] placeholder-[#777777] focus:outline-none focus:border-[#FF8A00]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="h-[42px] px-4.5 rounded-[8px] text-[16px] font-medium text-[#A0A0A0] hover:text-[#F5F5F5] bg-[#2D2D2D] hover:bg-[#353535] border border-[#3A3A3A] cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-[42px] bg-[#FF8A00] hover:bg-[#FF9E2C] text-[#1A1A1A] px-5.5 rounded-[8px] font-bold text-[16px] disabled:opacity-50 cursor-pointer transition-colors shadow-sm"
                >
                  {submitting ? 'Publishing...' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
