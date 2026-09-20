"use server";

import { unstable_cache } from "next/cache";
import { getPosts as getPostsFromDB } from "@/lib/db";
import { Post, PostsResponse } from "@/lib/schemas";

async function fetchPostsFromDB(
  // page: number = 1,
  // limit: number = 10
): Promise<PostsResponse> {
  const result = await getPostsFromDB();

  // Map to Post type with proper date/votes handling
  const postsForResponse: Post[] = result.posts.map((post) => ({
    _id: post.id,
    title: post.title,
    url: post.url,
    points: post.points,
    submittedById: post.submittedById,
    submittedByName: post.submittedByName || "",
    submittedAt: post.submittedAt instanceof Date
      ? post.submittedAt
      : new Date(post.submittedAt || Date.now()),
    votes: Array.isArray(post.votes) ? post.votes : JSON.parse(post.votes || '[]'),
  }));

  return {
    posts: postsForResponse,
    // pagination: result.pagination,
  };
}

// Cache the posts with proper tagging for revalidation
const cachedPosts = unstable_cache(
  fetchPostsFromDB,
  ["posts"],
  {
    tags: ["posts"],
    revalidate: 3600, // Fallback revalidation every hour
  }
);

// Re-export with the original name for backward compatibility
export { cachedPosts as getPosts };

