import { getStoriesForAdmin } from "@/lib/admin/stories";
import StoryManager from "./StoryManager";

export default async function AdminStoriesPage() {
  const stories = await getStoriesForAdmin();
  return (
    <div className="mx-auto max-w-3xl px-5 py-8 lg:px-10">
      <h1 className="text-2xl font-bold text-graphite">Stories</h1>
      <p className="mt-1 text-[14px] text-slate">
        Today&rsquo;s shop photos. They play in the round story button on the
        website and disappear on their own 24 hours after you upload them.
      </p>
      <StoryManager initial={stories} />
    </div>
  );
}
