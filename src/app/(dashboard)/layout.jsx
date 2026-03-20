export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      {/* Sidebar / Navbar for protected routes */}
      <main>{children}</main>
    </div>
  );
}
