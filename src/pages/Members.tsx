import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Search, Trash2, Edit } from "lucide-react";
import { api, getDaysUntilExpiry, type Member, type Package } from "@/lib/store";

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [m, p] = await Promise.all([api.getMembers(), api.getPackages()]);
        setMembers(m);
        setPackages(p);
      } catch (err) {
        console.error("Failed to load members data", err);
      }
    };
    fetchData();
  }, []);

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.phone.includes(search)
  );

  const getPackageName = (m: Member) => {
    if (m.customPlan) return `Custom (₹${m.customPrice})`;
    // Use _id if available, fallback to id
    return packages.find((p) => (p._id || p.id) === m.packageId)?.name || "N/A";
  };

  const deleteMember = async (id: string) => {
    if (!confirm("Are you sure you want to delete this member?")) return;
    try {
      await api.deleteMember(id);
      setMembers(members.filter((m) => (m._id || m.id) !== id));
    } catch (err) {
      console.error("Failed to delete member", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Members</h2>
          <p className="text-muted-foreground text-sm mt-1">{members.length} total members</p>
        </div>
        <Link
          to="/members/new"
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 glow-blue transition-all w-full sm:w-auto"
        >
          <UserPlus size={16} />
          Add Member
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <input
          type="text"
          placeholder="Search by name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Desktop View */}
      <div className="hidden md:block glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left p-4 font-medium">Name</th>
                <th className="text-left p-4 font-medium">Email</th>
                <th className="text-left p-4 font-medium">Phone</th>
                <th className="text-left p-4 font-medium">Package</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const days = getDaysUntilExpiry(m.expiryDate);
                const memberId = m._id || m.id || "";
                return (
                  <tr key={memberId} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="p-4 font-medium text-foreground">{m.name}</td>
                    <td className="p-4 text-muted-foreground">{m.email}</td>
                    <td className="p-4 text-muted-foreground">{m.phone}</td>
                    <td className="p-4 text-muted-foreground">{getPackageName(m)}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${days <= 0
                          ? "bg-destructive/20 text-destructive"
                          : days <= 5
                            ? "bg-warning/20 text-warning"
                            : "bg-success/20 text-success"
                          }`}
                      >
                        {days <= 0 ? "Expired" : `${days}d left`}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => deleteMember(memberId)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {filtered.map((m) => {
          const days = getDaysUntilExpiry(m.expiryDate);
          const memberId = m._id || m.id || "";
          return (
            <div key={memberId} className="glass-card p-4 space-y-3 relative group">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{m.name}</h3>
                  <p className="text-sm text-muted-foreground">{m.email}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${days <= 0
                    ? "bg-destructive/20 text-destructive"
                    : days <= 5
                      ? "bg-warning/20 text-warning"
                      : "bg-success/20 text-success"
                    }`}
                >
                  {days <= 0 ? "Expired" : `${days}d left`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Phone</p>
                  <p className="text-foreground">{m.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Package</p>
                  <p className="text-foreground">{getPackageName(m)}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-border flex justify-end">
                <button
                  onClick={() => deleteMember(memberId)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors text-xs font-medium"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center p-8 text-muted-foreground glass-card">
            No members found
          </div>
        )}
      </div>
    </div>
  );
}
