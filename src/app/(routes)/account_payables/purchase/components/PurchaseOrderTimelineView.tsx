import React, { useState, useRef } from 'react';
import { User, Send, AtSign, Reply, Edit, Trash2 } from 'lucide-react';
import moment from 'moment';
import { useAuth } from '@potta/app/(routes)/auth/AuthContext';

interface Comment {
  id: string;
  text: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  replies?: Comment[];
  mentions?: string[];
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface PurchaseOrderTimelineViewProps {
  comments: Comment[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
}

const PurchaseOrderTimelineView: React.FC<PurchaseOrderTimelineViewProps> = ({
  comments,
  setComments,
}) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  // Mock users for tagging
  const users: User[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com' },
    { id: '4', name: 'Sarah Wilson', email: 'sarah@example.com' },
    { id: '5', name: 'David Brown', email: 'david@example.com' },
  ];

  // Get current user info
  const currentUser = (user as any)?.user?.user || user;
  const currentUserId =
    currentUser?.id || currentUser?.sessionUserId || 'current-user';
  const currentUserName =
    currentUser?.firstName && currentUser?.lastName
      ? `${currentUser.firstName} ${currentUser.lastName}`
      : currentUser?.name || 'Current User';

  // Handle comment input changes
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewComment(value);

    // Check for @ symbol to show mention list
    const cursorPos = e.target.selectionStart;
    setCursorPosition(cursorPos);

    const beforeCursor = value.substring(0, cursorPos);
    const atIndex = beforeCursor.lastIndexOf('@');

    if (atIndex !== -1 && atIndex < cursorPos) {
      const filter = beforeCursor.substring(atIndex + 1);
      setMentionFilter(filter);
      setShowMentionList(true);
    } else {
      setShowMentionList(false);
    }
  };

  // Handle mention selection
  const handleMentionSelect = (user: User) => {
    const beforeAt = newComment.substring(0, newComment.lastIndexOf('@'));
    const afterCursor = newComment.substring(cursorPosition);
    const updatedComment = `${beforeAt}@${user.name} ${afterCursor}`;
    setNewComment(updatedComment);
    setShowMentionList(false);

    // Focus back to input
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };

  // Handle comment submission
  const handleSubmitComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        text: newComment,
        author: {
          id: currentUserId,
          name: currentUserName,
        },
        timestamp: new Date(),
        mentions: extractMentions(newComment),
      };

      setComments([comment, ...comments]);
      setNewComment('');
    }
  };

  // Handle edit comment
  const handleEditComment = (commentId: string, currentText: string) => {
    setEditingCommentId(commentId);
    setEditText(currentText);
  };

  // Handle save edit
  const handleSaveEdit = () => {
    if (editText.trim() && editingCommentId) {
      setComments(
        comments.map((comment) =>
          comment.id === editingCommentId
            ? {
                ...comment,
                text: editText,
                mentions: extractMentions(editText),
              }
            : comment
        )
      );
      setEditingCommentId(null);
      setEditText('');
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditText('');
  };

  // Handle delete comment
  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter((comment) => comment.id !== commentId));
  };

  // Extract mentions from comment text
  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }

    return mentions;
  };

  // Filter users for mention list
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(mentionFilter.toLowerCase()) ||
      user.email.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className=" border-b border-gray-200">
        <p className="text-gray-600">
          Track updates and collaborate with your team
        </p>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No comments yet. Be the first to add a comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white p-4 shadow-sm border border-gray-200"
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
                  {comment.author.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {comment.author.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {moment(comment.timestamp).fromNow()}
                      </span>
                    </div>
                    {/* Edit/Delete buttons for comment author */}
                    {comment.author.id === currentUserId && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            handleEditComment(comment.id, comment.text)
                          }
                          className="text-gray-500 hover:text-gray-700 p-1"
                          title="Edit comment"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-gray-500 hover:text-red-600 p-1"
                          title="Delete comment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {editingCommentId === comment.id ? (
                    <div className="mb-3">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-2 border border-gray-300 resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        rows={3}
                      />
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={handleSaveEdit}
                          className="px-3 py-1 bg-green-700 text-white text-sm hover:bg-green-800"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 bg-gray-300 text-gray-700 text-sm hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-700 mb-3">
                      {comment.text.split(' ').map((word, index) => {
                        if (word.startsWith('@')) {
                          return (
                            <span
                              key={index}
                              className="text-green-600 font-medium"
                            >
                              {word}{' '}
                            </span>
                          );
                        }
                        return <span key={index}>{word} </span>;
                      })}
                    </div>
                  )}

                  <div className="flex items-center space-x-4 text-sm">
                    <button className="text-gray-500 hover:text-gray-700 flex items-center space-x-1">
                      <Reply className="w-4 h-4" />
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Fixed Comment Input at Bottom */}
      <div className="border-t border-gray-200 bg-white p-4 pb-1">
        <div className="relative">
          <textarea
            ref={commentInputRef}
            value={newComment}
            onChange={handleCommentChange}
            placeholder="Add a comment... Use @ to mention someone"
            className="w-full p-3 border border-gray-300 resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={3}
          />

          {/* Mention List */}
          {showMentionList && (
            <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-gray-200 shadow-lg z-10 max-h-48 overflow-y-auto">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleMentionSelect(user)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                >
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleSubmitComment}
            disabled={!newComment.trim()}
            className="px-4 absolute bottom-5 right-5 py-2 bg-green-700 text-white hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderTimelineView;
