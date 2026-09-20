"use server";

import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { PostSubmissionSchema, SubmitPostResult, VoteResult } from "@/lib/schemas";
import { createPost, getPostByUrl, getPostById, updatePostVotes } from "@/lib/db";

export async function submitPost(formData: FormData): Promise<SubmitPostResult> {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const title = formData.get("title") as string;
    const url = formData.get("url") as string;

    const validatedData = PostSubmissionSchema.parse({ title, url });

    // Check if URL already exists
    const existingPost = await getPostByUrl(validatedData.url);
    if (existingPost) {
      throw new Error("This URL has already been submitted");
    }

    await createPost({
      title: validatedData.title,
      url: validatedData.url,
      submittedById: session.user.id,
      submittedByName: session.user.name,
    });
    
    // Revalidate the posts cache
    revalidateTag("posts");
    
    return { success: true };
  } catch (error) {
    console.error("Error submitting post:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to submit post");
  }
}

export async function voteOnPost(postId: string): Promise<VoteResult> {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const post = await getPostById(postId);

    if (!post) {
      throw new Error("Post not found");
    }

    const userId = session.user.id;
    const votes: string[] = JSON.parse(post.votes || '[]');
    const hasVoted = votes.includes(userId);

    let newPoints = post.points || 0;
    let newVotes: string[];

    if (hasVoted) {
      // Remove vote
      newVotes = votes.filter((id) => id !== userId);
      newPoints = Math.max(0, newPoints - 1);
    } else {
      // Add vote
      newVotes = [...votes, userId];
      newPoints = newPoints + 1;
    }

    await updatePostVotes(postId, newPoints, newVotes);

    // Revalidate the posts cache
    revalidateTag("posts");

    return { 
      points: newPoints,
      hasVoted: !hasVoted
    };

  } catch (error) {
    console.error("Error voting on post:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to vote on post");
  }
}

