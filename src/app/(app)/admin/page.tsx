import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/layout/top-bar";
import { AdminPostList } from "./admin-post-list";
import { AdminUserList } from "./admin-user-list";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Check admin access
  const { data: adminCheck } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!adminCheck?.is_admin) redirect("/dashboard");

  const { data: posts } = await supabase
    .from("posts")
    .select("*, profiles(first_name, last_name)")
    .order("created_at", { ascending: false });

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <TopBar title="Admin Panel" />
      <div className="p-6 md:p-10 max-w-4xl mx-auto w-full space-y-10">
        {/* Posts Management */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary">
            All Posts ({posts?.length ?? 0})
          </h3>
          <AdminPostList posts={posts ?? []} />
        </div>

        {/* Users Management */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary">
            All Users ({profiles?.length ?? 0})
          </h3>
          <AdminUserList users={profiles ?? []} />
        </div>
      </div>
    </>
  );
}
