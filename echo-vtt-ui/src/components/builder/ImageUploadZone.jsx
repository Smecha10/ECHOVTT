import { useState, useRef } from 'react'

export default function ImageUploadZone({ images = [], onImages }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const addFiles = (files) => {
    const newImgs = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, 6 - images.length)
      .map((f) => ({ file: f, url: URL.createObjectURL(f), name: f.name }))
    onImages([...images, ...newImgs].slice(0, 6))
  }

  const remove = (idx) => onImages(images.filter((_, i) => i !== idx))

  return (
    <div>
      <div
        style={{
          border: `2px dashed ${dragging ? '#7C5CBF' : '#2A2F3D'}`,
          borderRadius: 8,
          padding: '20px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragging ? 'rgba(124,92,191,0.06)' : '#0D0F14',
          transition: 'all 0.15s',
        }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
      >
        <div style={{ fontSize: 28, marginBottom: 6 }}>⊕</div>
        <div style={{ fontSize: 13, color: '#9A9080' }}>
          Drop images for visual inspiration (up to 6)
        </div>
        <div style={{ fontSize: 11, color: '#4A3F6B', marginTop: 4 }}>
          AI uses these for scene generation, not reproduction
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          {images.map((img, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <img
                src={img.url}
                alt={img.name}
                style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6, border: '1px solid #2A2F3D' }}
              />
              <button
                onClick={() => remove(i)}
                style={{
                  position: 'absolute', top: -6, right: -6, width: 18, height: 18,
                  background: '#C0392B', border: 'none', borderRadius: '50%',
                  color: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
