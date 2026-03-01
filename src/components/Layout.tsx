import { useState, useEffect } from "react";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Package,
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
  { title: "Reports", path: "/reports", icon: FileBarChart },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
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

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const expiringCount = members.filter(
    (m) => getDaysUntilExpiry(m.expiryDate) <= 5 && getDaysUntilExpiry(m.expiryDate) > 0
  ).length;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const sidebarContent = (isMobile: boolean) => (
    <>
      <div className="flex h-16 items-center justify-between px-4 border-b border-border flex-shrink-0">
        {(isMobile || sidebarOpen) && (
          <h1 className="text-lg font-bold text-foreground tracking-tight whitespace-nowrap overflow-hidden">
            <span className="text-primary glow-text">MUSCLE</span> ENGINEER
          </h1>
        )}
        <button
          onClick={() => {
            if (isMobile) {
              setMobileOpen(false);
            } else {
              setSidebarOpen(!sidebarOpen);
            }
          }}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex-shrink-0"
        >
          {(isMobile || sidebarOpen) ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
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
              <item.icon size={20} className="flex-shrink-0" />
              {(isMobile || sidebarOpen) && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border flex-shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 w-full transition-all duration-200"
        >
          <LogOut size={20} className="flex-shrink-0" />
          {(isMobile || sidebarOpen) && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 hidden md:flex flex-col border-r border-border bg-sidebar transition-all duration-300 ${sidebarOpen ? "w-60" : "w-16"
          }`}
      >
        {sidebarContent(false)}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-[60] w-64 flex flex-col border-r border-border bg-background shadow-2xl md:hidden"
            >
              {sidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ml-0 ${sidebarOpen ? "md:ml-60" : "md:ml-16"
          }`}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-6">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors md:hidden"
          >
            <Menu size={22} />
          </button>

          <div className="flex-1 flex items-center gap-3">
            <h1 className="text-lg font-bold text-foreground tracking-tight md:hidden">
              <span className="text-primary glow-text">MUSCLE</span> ENGINEER
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
    </div>
  );
}
