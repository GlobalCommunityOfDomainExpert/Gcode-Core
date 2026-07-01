import { AppShell, Navbar, Sidebar } from "@/components/layout";
import { StatCard } from "@/components/molecules";

const sidebarUser = { name: "Shashwat Singh", role: "Founder", avatarInitials: "SS" };

export default function LayoutShowcasePage() {
  return (
    <AppShell
      navbar={
        <Navbar
          hasUnreadNotifications
          mobileFooter={<Sidebar variant="bare" user={sidebarUser} profileCompletion={60} />}
        />
      }
      sidebar={<Sidebar user={sidebarUser} profileCompletion={60} />}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-display font-extrabold text-text-primary">Dashboard</h1>
          <p className="text-body text-text-secondary">Welcome back, here&apos;s your overview.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Registrations" value="148" sub="+12 this week" />
          <StatCard label="Total Earned" value="₹48,500" trend={{ value: "+12%" }} />
          <StatCard label="Upcoming Events" value="3" />
        </div>
      </div>
    </AppShell>
  );
}
