"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { PostSubmissionSchema, type PostSubmission } from "@/lib/schemas";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { submitPost } from "@/lib/actions";
import { authClient } from "@/lib/auth-client";

export function PostSubmissionForm() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const form = useForm<PostSubmission>({
    resolver: zodResolver(PostSubmissionSchema),
    defaultValues: {
      title: "",
      url: "",
    },
  });

  const { formState: { isSubmitting } } = form;

  const handleSubmit = async (data: PostSubmission) => {
    // Redirect to login if user is not authenticated
    if (!session?.user) {
      router.push("/login");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("url", data.url);

      await submitPost(formData);

      form.reset();
      toast.success("Post submitted successfully!");
    } catch (error) {
      console.error("Error submitting post:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit post");
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-7 md:p-8 bg-gradient-to-br from-white to-gray-50 backdrop-blur-sm hover:border-cinema-red/30 transition-all duration-300 hover:shadow-lg">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span className="text-cinema-red">✨</span> Submit Your Movie Pitch
      </h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col w-full items-end gap-5">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="w-full space-y-2">
                <FormLabel className="text-gray-700 font-semibold">Movie Title *</FormLabel>
                <FormControl className="w-full">
                  <Input
                    placeholder="Enter your movie pitch title..."
                    aria-label="Title"
                    {...field}
                    className="w-full shadow-none bg-white border-2 border-gray-200 text-gray-900 placeholder:text-gray-400 hover:border-cinema-red/40 focus:border-cinema-red focus:ring-cinema-red/20 transition-all duration-300 rounded-lg h-11"
                  />
                </FormControl>
                <FormMessage className="text-cinema-red text-sm" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem className="w-full space-y-2">
                <FormLabel className="text-gray-700 font-semibold">Reference Link *</FormLabel>
                <FormControl className="w-full">
                  <Input
                    placeholder="https://example.com/movie-inspiration"
                    aria-label="URL"
                    {...field}
                    className="w-full bg-white border-2 border-gray-200 text-gray-900 placeholder:text-gray-400 hover:border-cinema-red/40 focus:border-cinema-red focus:ring-cinema-red/20 transition-all duration-300 shadow-none rounded-lg h-11"
                  />
                </FormControl>
                <FormMessage className="text-cinema-red text-sm" />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-cinema-red to-cinema-red-light text-white font-bold px-8 py-2.5 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2 shadow-md"
          >
            {isSubmitting && <Spinner size="sm" />}
            Submit Pitch
          </Button>
        </form>
      </Form>
    </div>
  );
}