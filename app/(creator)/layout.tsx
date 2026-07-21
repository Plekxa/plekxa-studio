import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { CreatorSidebar } from "@/components/CreatorSidebar";
import { CreatorTopbar } from "@/components/CreatorTopbar";
import { createClient } from "@/lib/supabase/server";

export default async function CreatorLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, creator_type")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="creator-app-shell">
      <CreatorSidebar />

      <div className="creator-app-main">
        <CreatorTopbar
          fullName={profile?.full_name}
          avatarUrl={profile?.avatar_url}
          creatorType={profile?.creator_type}
        />

        <main className="creator-app-content">
          {children}
        </main>
      </div>
    </div>
  );
}