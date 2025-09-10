import React, { useState } from 'react';
import { LikeIcon } from './icons/LikeIcon';
import { DislikeIcon } from './icons/DislikeIcon';
import { useLocalization } from '../hooks/useLocalization';

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  replies: Comment[];
}

interface FeedbackProps {
  mode?: 'full' | 'simple';
  lessonId?: string;
  initialLikes?: number;
  initialDislikes?: number;
  onRatingUpdate?: (lessonId: string, newCounts: { likes: number; dislikes: number }) => void;
}

const Feedback: React.FC<FeedbackProps> = ({ mode = 'full', lessonId, initialLikes, initialDislikes, onRatingUpdate }) => {
  const [rating, setRating] = useState<'like' | 'dislike' | null>(null);
  const [likes, setLikes] = useState(initialLikes ?? Math.floor(Math.random() * 50) + 5);
  const [dislikes, setDislikes] = useState(initialDislikes ?? Math.floor(Math.random() * 10));
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const { t } = useLocalization();

  const handleRating = (newRating: 'like' | 'dislike') => {
    let newLikes = likes;
    let newDislikes = dislikes;

    if (rating === newRating) {
      // User is deselecting their rating
      setRating(null);
      if (newRating === 'like') newLikes--;
      else newDislikes--;
    } else {
      // New or changed rating
      if (rating === 'like') newLikes--;
      if (rating === 'dislike') newDislikes--;

      setRating(newRating);
      if (newRating === 'like') newLikes++;
      else newDislikes++;
    }
    setLikes(newLikes);
    setDislikes(newDislikes);
    if (onRatingUpdate && lessonId) {
      onRatingUpdate(lessonId, { likes: newLikes, dislikes: newDislikes });
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      const newComment: Comment = {
        id: self.crypto.randomUUID(),
        author: t('commentPanda'),
        text: commentText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        replies: [],
      };
      setComments([newComment, ...comments]);
      setCommentText('');
    }
  };

  const handleReplySubmit = (parentId: string) => {
    if (!replyText.trim()) return;

    const newReply: Comment = {
      id: self.crypto.randomUUID(),
      author: t('commentOwl'),
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      replies: [], // Replies to replies are not supported in this version
    };

    const addReplyRecursive = (nodes: Comment[]): Comment[] => {
      return nodes.map(node => {
        if (node.id === parentId) {
          return { ...node, replies: [newReply, ...node.replies] };
        }
        // This structure supports multi-level replies if needed in the future
        if (node.replies.length > 0) {
          return { ...node, replies: addReplyRecursive(node.replies) };
        }
        return node;
      });
    };
    
    setComments(prev => addReplyRecursive(prev));
    setReplyingTo(null);
    setReplyText('');
  };

  const CommentCard: React.FC<{ comment: Comment, onReplyClick: (id: string) => void }> = ({ comment, onReplyClick }) => (
    <div className="bg-amber-50/70 p-4 rounded-lg border border-amber-100">
        <div className="flex justify-between items-center mb-1">
            <p className="font-bold text-amber-900">{comment.author}</p>
            <p className="text-xs text-slate-500">{comment.timestamp}</p>
        </div>
        <p className="text-slate-700 whitespace-pre-wrap">{comment.text}</p>
        <button onClick={() => onReplyClick(comment.id)} className="text-xs font-bold text-amber-600 hover:underline mt-2">{t('replyButton')}</button>
        
        {/* Render Replies */}
        <div className="pl-6 mt-3 space-y-3 border-l-2 border-amber-200">
            {comment.replies.map(reply => <CommentCard key={reply.id} comment={reply} onReplyClick={onReplyClick}/>)}
        </div>

        {/* Reply Form */}
        {replyingTo === comment.id && (
            <form onSubmit={(e) => { e.preventDefault(); handleReplySubmit(comment.id); }} className="flex flex-col gap-2 mt-2">
                <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`${t('replyingTo')} ${comment.author}...`}
                    className="w-full p-2 bg-white border-2 border-amber-200 rounded-lg text-sm focus:ring-1 focus:ring-amber-400 focus:border-amber-500 focus:outline-none transition"
                    rows={2}
                    autoFocus
                />
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setReplyingTo(null)} className="px-4 py-1 text-sm bg-slate-200 text-slate-700 font-bold rounded-full hover:bg-slate-300 transition-colors">{t('cancelButton')}</button>
                    <button type="submit" className="px-4 py-1 text-sm bg-amber-600 text-white font-bold rounded-full hover:bg-amber-700 disabled:bg-slate-400 transition-colors" disabled={!replyText.trim()}>{t('postReplyButton')}</button>
                </div>
            </form>
        )}
    </div>
  );

  const ratingButtons = (
    <div className={`flex items-center ${mode === 'simple' ? 'justify-end gap-4' : 'justify-center gap-6'}`}>
        <button
          onClick={(e) => {
            if (mode === 'simple') e.stopPropagation();
            handleRating('like');
          }}
          className={`flex items-center gap-1.5 rounded-full font-bold transition-all duration-200 ${mode === 'simple' ? 'px-3 py-1 text-sm' : 'px-5 py-2'} ${
            rating === 'like' ? 'bg-green-500 text-white' + (mode === 'full' ? ' scale-110' : '') : 'bg-green-100 text-green-800 hover:bg-green-200'
          }`}
          aria-pressed={rating === 'like'}
        >
          <LikeIcon className={mode === 'simple' ? 'w-4 h-4' : 'w-6 h-6'} />
          <span>{likes}</span>
        </button>
        <button
          onClick={(e) => {
            if (mode === 'simple') e.stopPropagation();
            handleRating('dislike');
          }}
          className={`flex items-center gap-1.5 rounded-full font-bold transition-all duration-200 ${mode === 'simple' ? 'px-3 py-1 text-sm' : 'px-5 py-2'} ${
            rating === 'dislike' ? 'bg-red-500 text-white' + (mode === 'full' ? ' scale-110' : '') : 'bg-red-100 text-red-800 hover:bg-red-200'
          }`}
          aria-pressed={rating === 'dislike'}
        >
          <DislikeIcon className={mode === 'simple' ? 'w-4 h-4' : 'w-6 h-6'} />
          <span>{dislikes}</span>
        </button>
      </div>
  );

  if (mode === 'simple') {
    return ratingButtons;
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-6 border border-amber-200 mt-12 space-y-6 font-sans">
      <h2 className="text-3xl font-bold text-amber-800 text-center font-gaegu">{t('rateLessonTitle')}</h2>
      {ratingButtons}

      <div>
        <h3 className="text-2xl font-bold text-amber-800 text-center mt-8 mb-4 font-gaegu">{t('discussionTitle')}</h3>
        <form onSubmit={handleCommentSubmit} className="flex flex-col gap-2">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={t('commentPlaceholder')}
            className="w-full p-3 bg-amber-50 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-500 focus:outline-none transition"
            rows={3}
          />
          <button type="submit" className="self-end px-6 py-2 bg-amber-600 text-white font-bold rounded-full hover:bg-amber-700 disabled:bg-slate-400 transition-colors" disabled={!commentText.trim()}>
            {t('postCommentButton')}
          </button>
        </form>

        <div className="mt-6 space-y-4">
          {comments.length === 0 ? (
            <p className="text-center text-slate-500">{t('noComments')}</p>
          ) : (
            comments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} onReplyClick={(id) => { setReplyingTo(id); setReplyText(''); }}/>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Feedback;