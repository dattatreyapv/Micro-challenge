'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [bookmarks, setBookmarks] = useState([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))

    const channel = supabase
      .channel('realtime-bookmarks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookmarks' },
        fetchBookmarks
      )
      .subscribe()

    fetchBookmarks()
    return () => supabase.removeChannel(channel)
  }, [])

  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false })
    setBookmarks(data || [])
  }

  const addBookmark = async () => {
    if (!user) return
    await supabase.from('bookmarks').insert({
      title,
      url,
      user_id: user.id,
    })
    setTitle('')
    setUrl('')
  }

  const deleteBookmark = async (id) => {
    await supabase.from('bookmarks').delete().eq('id', id)
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">My Bookmarks</h1>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border w-full mb-2 p-2"
      />
      <input
        placeholder="URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="border w-full mb-2 p-2"
      />
      <button
        onClick={addBookmark}
        className="bg-blue-500 text-white px-4 py-2 mb-4"
      >
        Add Bookmark
      </button>

      {bookmarks.map((b) => (
        <div key={b.id} className="flex justify-between border p-2 mb-2">
          <a href={b.url} target="_blank">{b.title}</a>
          <button
            onClick={() => deleteBookmark(b.id)}
            className="text-red-500"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}
