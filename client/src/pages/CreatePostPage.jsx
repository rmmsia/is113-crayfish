import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function CreatePostPage() {
  const { postId } = useParams()
  const isEdit = Boolean(postId)
  const [formData, setFormData] = useState({ title: '', imageURL: '', description: '', existingTags: [], newTags: '' })
  const [availableTags, setAvailableTags] = useState([])
  const [imgValid, setImgValid] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetch('http://localhost:3000/posts/tags/all', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setAvailableTags(data.tags || []))
  }, [])

  useEffect(() => {
    if (!isEdit) return
    fetch(`http://localhost:3000/posts/${postId}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (!data.post) return
        setFormData({
          title: data.post.title || '',
          imageURL: data.post.imageURL || '',
          description: data.post.description || '',
          existingTags: (data.post.tags || []).map(t => t._id),
          newTags: ''
        })
      })
  }, [isEdit, postId])

  const checkImg = (url) => {
    if (!url) return setImgValid(true)
    const img = new Image()
    img.src = url
    img.onload = () => setImgValid(true)
    img.onerror = () => setImgValid(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!imgValid) return alert("Invalid image URL")

    const url = isEdit ? `http://localhost:3000/posts/${postId}` : 'http://localhost:3000/posts'
    const method = isEdit ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
      credentials: 'include'
    })
    if (res.ok) navigate(isEdit ? `/posts/${postId}` : '/posts')
  }

  const handleTagToggle = (tagId) => {
    const nextTags = formData.existingTags.includes(tagId)
      ? formData.existingTags.filter(id => id !== tagId)
      : [...formData.existingTags, tagId]
    setFormData({ ...formData, existingTags: nextTags })
  }

  return (
    <main className="form-container">
      <h1>{isEdit ? 'Edit Post' : 'Create a Post'}</h1>
      {formData.imageURL && imgValid && <img src={formData.imageURL} style={{ maxWidth: '200px' }} />}

      <form onSubmit={handleSubmit}>
        <label>Title *</label>
        <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />

        <label>Image URL</label>
        <input
          type="url"
          value={formData.imageURL}
          onChange={e => {
            setFormData({...formData, imageURL: e.target.value})
            checkImg(e.target.value)
          }}
        />
        {!imgValid && <div style={{color: 'red'}}>Invalid Image URL</div>}

        <label>Description</label>
        <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />

        <div className="tags-container">
          <label>Select tags:</label>
          {availableTags.map(tag => (
            <div key={tag._id}>
              <input
                type="checkbox"
                checked={formData.existingTags.includes(tag._id)}
                onChange={() => handleTagToggle(tag._id)}
              /> {tag.name}
            </div>
          ))}
          <label>Or create new (comma separated):</label>
          <input value={formData.newTags} onChange={e => setFormData({...formData, newTags: e.target.value})} />
        </div>

        <button type="submit">{isEdit ? 'Save' : 'Post'}</button>
      </form>
    </main>
  )
}
