// Shared shell for the app-proper pages (Profile, API Docs) — the Home/Edit
// page at `/` renders <AppNav /> itself, inline in its own header, since its
// layout (sticky grid stage + aside) doesn't fit a simple children-wrapping
// route-group layout. All three pages share the identical AppNav component.
import { AppNav } from "@/components/AppNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-felt text-fg">
      <AppNav />
      <div className="flex-1">{children}</div>
    </div>
  );
}
