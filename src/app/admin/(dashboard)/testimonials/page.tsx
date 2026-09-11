import { getTestimonialsForAdmin } from "@/lib/admin/testimonials";
import TestimonialManager from "./TestimonialManager";

export default async function AdminTestimonialsPage() {
  const testimonials = await getTestimonialsForAdmin();
  return (
    <div className="mx-auto max-w-2xl px-5 py-8 lg:px-10">
      <h1 className="text-2xl font-bold text-graphite">Customer reviews</h1>
      <p className="mt-1 text-[14px] text-slate">
        These appear on the homepage, one at a time.
      </p>
      <TestimonialManager initial={testimonials} />
    </div>
  );
}
