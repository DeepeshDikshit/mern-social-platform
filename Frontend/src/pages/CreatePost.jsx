import { useState, useRef, useCallback } from 'react'
import axios from 'axios'

export default function CreatePost() {
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [mentions, setMentions] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const loadFile = (file) => {
    if (!file) return
    setImageFile(file || null)
    if (file) {
      const url = URL.createObjectURL(file)
      setImagePreview(url)
    } else {
      setImagePreview(null)
    }
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0]
    loadFile(file)
  }

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) loadFile(file)
  }, [])

  function triggerFileDialog() {
    fileInputRef.current?.click()
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!imageFile) return
    setSubmitting(true)
    
    const token = localStorage.getItem('token')
    
    const formData = new FormData()
    formData.append('image', imageFile)
    formData.append('mentions', mentions)

    axios.post("http://localhost:3000/posts", formData, {
      withCredentials: true,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      console.log(response.data)
      setSubmitting(false)
      setImageFile(null)
      setImagePreview(null)
      setMentions('')
    })
    .catch(error => {
      console.error('Post creation failed:', error)
      setSubmitting(false)
    })
  }

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '64px' }}>
      <div className="card" style={{ maxWidth: 760, margin: '0 auto' }}>
        <div className="form-header" style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0 }}>Create a new post</h1>
          <p className="muted" style={{ marginTop: 4 }}>Share a moment. Add mentions to notify friends.</p>
        </div>
        <form className="form" onSubmit={handleSubmit} onDragEnter={handleDrag} noValidate>
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            aria-label="Upload image"
            onClick={triggerFileDialog}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerFileDialog() } }}
            style={{
              border: '2px dashed var(--border)',
              padding: 0,
              borderRadius: 16,
              position: 'relative',
              background: dragActive ? 'color-mix(in oklab, var(--primary), transparent 90%)' : 'var(--card)',
              cursor: 'pointer',
              minHeight: imagePreview ? 'auto' : 260,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            <input
              ref={fileInputRef}
              id="image"
              name="image"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
              required
            />
            {!imagePreview && (
              <div style={{ textAlign: 'center', padding: '32px 24px', display: 'grid', gap: 12 }}>
                <svg width="52" height="52" viewBox="0 0 24 24" stroke="var(--muted)" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
                <div style={{ fontWeight: 600 }}>Click or drag an image here</div>
                <div className="muted" style={{ fontSize: '.85rem' }}>PNG, JPG, or WebP up to 5MB.</div>
              </div>
            )}
            {imagePreview && (
              <div style={{ width: '100%', position: 'relative' }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    aspectRatio: '4/5'
                  }}
                />
                <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ background: 'rgba(0,0,0,.55)', color: '#fff', border: '1px solid rgba(255,255,255,.2)' }}
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
                  >Change</button>
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ background: 'rgba(0,0,0,.55)', color: '#fff', border: '1px solid rgba(255,255,255,.2)' }}
                    onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null) }}
                  >Remove</button>
                </div>
              </div>
            )}
          </div>

          <div className="field" style={{ marginTop: 24 }}>
            <label htmlFor="mentions">Mentions</label>
            <input
              id="mentions"
              name="mentions"
              type="text"
              placeholder="@alice, @bob"
              className="input"
              value={mentions}
              onChange={e => setMentions(e.target.value)}
            />
            <p className="muted" style={{ margin: 0, fontSize: '.75rem' }}>Separate usernames with commas. Include @ at the start.</p>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
            <button type="submit" disabled={!imageFile || submitting}>
              {submitting ? 'Posting…' : 'Post'}
            </button>
            <button type="button" className="btn-outline" onClick={() => { setImageFile(null); setImagePreview(null); setMentions('') }} disabled={submitting}>
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
