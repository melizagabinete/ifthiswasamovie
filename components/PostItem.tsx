"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Post, OptimisticVote } from "@/lib/schemas";
import { voteOnPost } from "@/lib/actions";
import { getTimeAgo } from "@/lib/utils";

interface PostItemProps {
  post: Post;
  globalIndex: number;
}

export function PostItem({ post, globalIndex }: PostItemProps) {
  const { data: session } = authClient.useSession();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const initialVoteData: OptimisticVote = {
    points: post.points,
    hasVoted: session?.user ? post.votes.includes(session.user.id) : false,
  };

  const [optimisticVote, addOptimisticVote] = useOptimistic(
    initialVoteData,
    (_state, newVote: OptimisticVote) => newVote
  );

  const handleVote = () => {
    if (isPending) return;

    // Redirect to login if user is not authenticated
    if (!session?.user) {
      router.push("/login");
      return;
    }

    const currentlyVoted = optimisticVote.hasVoted;
    const pointChange = currentlyVoted ? -1 : 1;

    startTransition(async () => {
      addOptimisticVote({
        points: optimisticVote.points + pointChange,
        hasVoted: !currentlyVoted,
      });

      try {
        if (!post._id) return;
        await voteOnPost(post._id);
      } catch (error) {
        console.error("Error voting:", error);
        // The optimistic update will revert automatically if the server action fails
      }
    });
  };

  return (
    <div className="group flex flex-row gap-4 items-start p-5 md:p-6 bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 rounded-xl hover:from-gray-200 hover:to-gray-100 hover:border-cinema-red/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Global index */}
      <span className="text-cinema-red font-bold text-xl min-w-8 text-center leading-snug mt-1 group-hover:text-cinema-gold transition-colors">
        {globalIndex}
      </span>
      
      {/* Voting button */}
      <button
        onClick={handleVote}
        disabled={isPending}
        className={`transition-all duration-300 disabled:opacity-50 flex flex-col items-center gap-1 mt-1 group-hover:scale-110 ${
          optimisticVote.hasVoted
            ? "text-cinema-red"
            : "text-gray-400 hover:text-cinema-red"
        }`}
        aria-label={optimisticVote.hasVoted ? "Remove upvote" : "Upvote"}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 76 65"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 transition-all duration-300"
        >
          <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="currentColor" />
        </svg>
        <span className="text-xs font-bold">{optimisticVote.points}</span>
      </button>

      {/* Post content */}
      <div className="flex flex-col min-w-0 gap-2 flex-1">
        <div className="leading-snug">
          <h3 className="font-bold text-gray-900 text-lg leading-none inline hover:text-cinema-red transition-colors">
            {post.title}
          </h3>
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 ml-2 hover:text-cinema-red transition-colors font-medium"
          >
            ({new URL(post.url).hostname})
          </a>
        </div>

        <div className="text-xs leading-tight text-gray-600 space-x-3 flex flex-wrap items-center">
          <span className="text-cinema-red font-bold">
            {optimisticVote.points} {optimisticVote.points === 1 ? "vote" : "votes"}
          </span>
          <span className="text-gray-500">by</span>
          <span className="font-medium text-gray-700">{post.submittedByName}</span>
          <span className="text-gray-500">{getTimeAgo(post.submittedAt)}</span>
        </div>
      </div>
    </div>
  );
}
