import { Suspense } from 'react'
import { client } from '@/sanity/lib/client'

interface Post {
  _id: string
  title: string
  body?: string
}

async function PostsList() {
  const posts = await client.fetch<Post[]>(`*[_type == "post"]{ _id, title, body }`)

  return (
    <div className="space-y-4">
      {posts && posts.length > 0 ? (
        posts.map((post) => (
          <article key={post._id} className="p-4 border rounded">
            <h2 className="text-xl font-semibold">{post.title}</h2>
            {post.body && <p className="mt-2 text-zinc-600 dark:text-zinc-400">{post.body}</p>}
          </article>
        ))
      ) : (
        <p>No posts found.</p>
      )}
    </div>
  )
}

export default function BlogPage() {
  return (
    <main className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">My Blog</h1>
      <Suspense fallback={<p>Loading posts...</p>}>
        <PostsList />
      </Suspense>
    </main>
  )
}