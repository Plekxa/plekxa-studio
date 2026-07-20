import { CreatorSidebar } from "@/components/CreatorSidebar";

export default function CreatorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="creator-shell">
      <CreatorSidebar />

      <div className="creator-main">
        <main>{children}</main>
      </div>
    </div>
  );
}