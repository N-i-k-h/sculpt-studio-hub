import { useState, useEffect } from "react";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Package,
  Receipt,
  FileBarChart,
  Menu,
  X,
  Bell,
  Dumbbell,
  LogOut,
} from "lucide-react";
import { api, getDaysUntilExpiry, type Member } from "@/lib/store";

const navItems = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Members", path: "/members", icon: Users },
  { title: "Add Member", path: "/members/new", icon: UserPlus },
  { title: "Packages", path: "/packages", icon: Package },
  { title: "Trainers", path: "/trainers", icon: Dumbbell },
  { title: "Billing", path: "/billing", icon: Receipt },
  { title: "Reports", path: "/reports", icon: FileBarChart },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await api.getMembers();
        setMembers(data);
      } catch (error) {
        console.error("Failed to fetch members", error);
      }
    };
    fetchMembers();
  }, [location.pathname]);

  const expiringCount = members.filter(
    (m) => getDaysUntilExpiry(m.expiryDate) <= 5 && getDaysUntilExpiry(m.expiryDate) > 0
  ).length;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar - Desktop only */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 hidden md:flex flex-col border-r border-border bg-sidebar transition-all duration-300 ${sidebarOpen ? "w-60" : "w-16"
          }`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          {sidebarOpen && (
            <h1 className="text-lg font-bold text-foreground tracking-tight">
              <span className="text-primary glow-text">SCULPT</span> FITNESS
            </h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                  ? "bg-primary/10 text-primary glow-blue"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
              >
                <item.icon size={20} />
                {sidebarOpen && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 w-full transition-all duration-200"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ml-0 ${sidebarOpen ? "md:ml-60" : "md:ml-16"
          } pb-20 md:pb-0`}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-6">
          <div className="flex-1 flex items-center gap-3">
            <h1 className="text-lg font-bold text-foreground tracking-tight md:hidden">
              <span className="text-primary glow-text">SCULPT</span> FITNESS
            </h1>
          </div>

          <Link
            to="/members/new"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 glow-blue transition-all"
          >
            <UserPlus size={16} />
            <span>Add Member</span>
          </Link>

          <Link
            to="/members/new"
            className="flex sm:hidden items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 glow-blue transition-all"
          >
            <UserPlus size={18} />
          </Link>

          <div className="relative">
            <Link to="/" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors relative block">
              <Bell size={20} />
              {expiringCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center pulse-glow">
                  {expiringCount}
                </span>
              )}
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors md:hidden"
          >
            <LogOut size={20} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Bottom Navigation - Mobile only */}
      <nav className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background/90 backdrop-blur-lg border-t border-border flex items-center justify-around px-2 md:hidden">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full p-1 ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <div
                className={`p-1 rounded-full transition-all duration-200 ${isActive ? "bg-primary/10 glow-blue scale-110" : "scale-100"
                  }`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-medium mt-0.5">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
