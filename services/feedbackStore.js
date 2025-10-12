const { v4: uuidv4 } = require('uuid');

let feedbacks = [];

function addFeedback({ userId, name, email, message }) {
  const item = {
    id: uuidv4(),
    userId: userId || null,
    name: name || 'Anonymous',
    email: email || '',
    message,
    createdAt: new Date().toISOString(),
    status: 'open',
    replies: [],
  };
  feedbacks.unshift(item);
  return item;
}

function listFeedbacks() {
  return feedbacks;
}

function addReply(id, { adminId, reply }) {
  const idx = feedbacks.findIndex(f => f.id === id);
  if (idx === -1) return null;
  const item = feedbacks[idx];
  const r = { id: uuidv4(), adminId, reply, createdAt: new Date().toISOString() };
  item.replies.push(r);
  item.status = 'answered';
  return item;
}

module.exports = { addFeedback, listFeedbacks, addReply };


