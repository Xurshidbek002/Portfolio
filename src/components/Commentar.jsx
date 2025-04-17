import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, UserCircle2, Loader2, AlertCircle, Send, ImagePlus, X } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const LOCAL_STORAGE_KEY = 'local-comments';

const Komentar = () => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [userName, setUserName] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Load existing comments from localStorage
  useEffect(() => {
    AOS.init({ once: true });
    const saved = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
    setComments(saved);
  }, []);

  // Save to localStorage
  const saveToLocal = (comment) => {
    const updated = [comment, ...comments];
    setComments(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size < 5 * 1024 * 1024) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const sendToTelegram = async (message) => {
    const token = '7861410527:AAEhCBGXK51lPWyStsfYyXVd3nLC5GKHNCw';
    const chatId = '6873538625';
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !userName.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const commentData = {
        id: Date.now(),
        userName,
        content: newComment,
        profileImage: imagePreview || null,
        createdAt: new Date().toISOString(),
      };

      const message = `🗣 Name: ${userName}\n💬 Comment: ${newComment}`;
      await sendToTelegram(message);

      saveToLocal(commentData);

      // Reset form
      setNewComment('');
      setUserName('');
      setImagePreview(null);
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    } catch (err) {
      console.error(err);
      setError('Failed to send comment to Telegram.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString().slice(0, 5);
  };

  return (
    <div className="w-full bg-gradient-to-b from-white/10 to-white/5 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl" data-aos="fade-up">
      <div className="p-6 border-b border-white/10" data-aos="fade-down">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/20">
            <MessageCircle className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="text-xl font-semibold text-white">
            Comments <span className="text-indigo-400">({comments.length})</span>
          </h3>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-4 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div data-aos="fade-up">
            <label className="block text-sm font-medium text-white">Name <span className="text-red-400">*</span></label>
            <input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              required
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white"
            />
          </div>

          <div data-aos="fade-up">
            <label className="block text-sm font-medium text-white">Message <span className="text-red-400">*</span></label>
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => {
                setNewComment(e.target.value);
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
              }}
              placeholder="Write your message here..."
              required
              className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white resize-none min-h-[120px]"
            />
          </div>

          <div data-aos="fade-up">
            <label className="block text-sm font-medium text-white">Profile Photo <span className="text-gray-400">(optional)</span></label>
            <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
              {imagePreview ? (
                <div className="flex items-center gap-4">
                  <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/50" />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  >
                    <X className="w-4 h-4" />
                    <span>Remove Photo</span>
                  </button>
                </div>
              ) : (
                <div className="w-full">
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border border-dashed border-indigo-500/50"
                  >
                    <ImagePlus className="w-5 h-5" />
                    <span>Choose Profile Photo</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-xl text-white font-medium flex items-center justify-center gap-2"
          >
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Posting...</span></> : <><Send className="w-4 h-4" /><span>Post Comment</span></>}
          </button>
        </form>

        {/* Comment List */}
        <div className="space-y-4 h-[390px] overflow-y-auto custom-scrollbar">
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <UserCircle2 className="w-12 h-12 text-indigo-400 mx-auto mb-3 opacity-50" />
              <p className="text-gray-400">No comments yet. Start the conversation!</p>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="px-4 pt-4 pb-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                <div className="flex items-start gap-3">
                  {c.profileImage ? (
                    <img src={c.profileImage} className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/30" />
                  ) : (
                    <div className="p-2 rounded-full bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500/30">
                      <UserCircle2 className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <h4 className="font-medium text-white truncate">{c.userName}</h4>
                      <span className="text-xs text-gray-400">{formatDate(c.createdAt)}</span>
                    </div>
                    <p className="text-gray-300 text-sm break-words leading-relaxed">{c.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.7);
        }
      `}</style>
    </div>
  );
};

export default Komentar;
