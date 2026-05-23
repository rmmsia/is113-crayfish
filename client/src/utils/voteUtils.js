export function applyOptimisticVote(post, direction, userId) {
  let upvotes = [...(post.upvotes || [])].map(String)
  let downvotes = [...(post.downvotes || [])].map(String)
  const uid = String(userId)

  if (direction === 'upvote') {
    if (upvotes.includes(uid)) {
      upvotes = upvotes.filter(id => id !== uid)
    } else {
      upvotes.push(uid)
      downvotes = downvotes.filter(id => id !== uid)
    }
  } else {
    if (downvotes.includes(uid)) {
      downvotes = downvotes.filter(id => id !== uid)
    } else {
      downvotes.push(uid)
      upvotes = upvotes.filter(id => id !== uid)
    }
  }

  return { ...post, upvotes, downvotes }
}