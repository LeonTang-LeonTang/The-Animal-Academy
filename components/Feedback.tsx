import React, { useState } from 'react';
import { LikeIcon } from './icons/LikeIcon';
import { DislikeIcon } from './icons/DislikeIcon';

interface Comment {
  author: string;
  text: string;
  timestamp: string;
}

const Feedback: React.FC = () => {
  const [rating, setRating] = useState<'like' | 'dislike' | null>(null);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 50) + 5);
  const [dislikes, setDislikes] = useState(Math.floor(Math.random() * 10));
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');

  const handleRating = (newRating: 'like' | 'dislike') => {
    if (rating === newRating) {
      // User is deselecting their rating
      setRating(null);
      if (newRating === 'like') setLikes(l => l - 1);
      else setDislikes(d => d - 1);
    } else {
      // New or changed rating
      if (rating === 'like') setLikes(l => l - 1);
      if (rating === 'dislike') setDislikes(d => d - 1);

      setRating(newRating);
      if (newRating === 'like') setLikes(l => l + 1);
      else setDislikes(d => d + 1);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      const newComment: Comment = {
        author: 'Anonymous User',
        text: commentText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setComments([newComment, ...comments]);
      setCommentText('');
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-6 border border-amber-200 mt-12 space-y-6 font-sans">
      <h2 className="text-3xl font-bold text-amber-800 text-center font-gaegu">Rate this Lesson</h2>
      <div className="flex justify-center items-center gap-6">
        <button
          onClick={() => handleRating('like')}
          className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold transition-all duration-200 ${
            rating === 'like' ? 'bg-green-500 text-white scale-110' : 'bg-green-100 text-green-800 hover:bg-green-200'
          }`}
          aria-pressed={rating === 'like'}
        >
          <LikeIcon className="w-6 h-6" />
          <span>{likes}</span>
        </button>
        <button
          onClick={() => handleRating('dislike')}
          className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold transition-all duration-200 ${
            rating === 'dislike' ? 'bg-red-500 text-white scale-110' : 'bg-red-100 text-red-800 hover:bg-red-200'
          }`}
          aria-pressed={rating === 'dislike'}
        >
          <DislikeIcon className="w-6 h-6" />
          <span>{dislikes}</span>
        </button>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-amber-800 text-center mt-8 mb-4 font-gaegu">Discussion</h3>
        <form onSubmit={handleCommentSubmit} className="flex flex-col gap-2">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Share your thoughts or ask a question..."
            className="w-full p-3 bg-amber-50 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-500 focus:outline-none transition"
            rows={3}
          />
          <button type="submit" className="self-end px-6 py-2 bg-amber-600 text-white font-bold rounded-full hover:bg-amber-700 disabled:bg-slate-400 transition-colors" disabled={!commentText.trim()}>
            Post Comment
          </button>
        </form>

        <div className="mt-6 space-y-4">
          {comments.length === 0 ? (
            <p className="text-center text-slate-500">No comments yet. Be the first to share!</p>
          ) : (
            comments.map((comment, index) => (
              <div key={index} className="bg-amber-50/70 p-4 rounded-lg border border-amber-100">
                <div className="flex justify-between items-center mb-1">
                  <p className="font-bold text-amber-900">{comment.author}</p>
                  <p className="text-xs text-slate-500">{comment.timestamp}</p>
                </div>
                <p className="text-slate-700">{comment.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Feedback;
