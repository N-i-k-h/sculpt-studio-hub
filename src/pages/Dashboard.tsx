import { useState, useEffect } from "react";
import { DollarSign, Users, UserCheck, AlertTriangle, MessageCircle } from "lucide-react";
import { api, getDaysUntilExpiry, type Member, type Transaction, type Trainer } from "@/lib/store";

export default function Dashboard() {
  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [m, t, tr] = await Promise.all([
          api.getMembers(),
          api.getTransactions(),
          api.getTrainers()
        ]);
        setMembers(m);
        setTransactions(t);
        setTrainers(tr);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      }
    };
    fetchData();
  }, []);

  const totalRevenue = transactions.reduce((sum, t) => sum + t.amountPaid, 0);
  const activeMembers = members.filter((m) => getDaysUntilExpiry(m.expiryDate) > 0);
  const expiringMembers = members
    .map((m) => ({ ...m, daysLeft: getDaysUntilExpiry(m.expiryDate) }))
    .filter((m) => m.daysLeft > 0 && m.daysLeft <= 5)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const notifyWhatsApp = (member: typeof expiringMembers[0]) => {
    const msg = `Hi ${member.name}, your plan at SCULPT FITNESS expires in ${member.daysLeft} days. Please renew soon!`;
    window.open(`https://wa.me/${member.phone}?text=${encodeURIComponent(msg)}`);
  };

  const kpis = [
    {
      label: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      change: "+12%",
    },
    {
      label: "Active Members",
      value: activeMembers.length,
      icon: Users,
      badge: `${members.length - activeMembers.length} expired`,
    },
    {
      label: "Total Staff",
      value: trainers.length,
      icon: UserCheck,
      sub: "Trainers",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground text-sm mt-1">Overview of SCULPT FITNESS operations</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="kpi-card group hover:border-primary/30 transition-colors">
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                <p className="text-3xl font-bold text-foreground mt-2">{kpi.value}</p>
                {kpi.change && (
                  <span className="text-xs text-success mt-2 inline-block">
                    {kpi.change} this month
                  </span>
                )}
                {kpi.badge && (
                  <span className="text-xs text-warning mt-2 inline-block">
                    {kpi.badge}
                  </span>
                )}
                {kpi.sub && (
                  <span className="text-xs text-muted-foreground mt-2 inline-block">
                    {kpi.sub}
                  </span>
                )}
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary glow-blue group-hover:scale-110 transition-transform">
                <kpi.icon size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Expiring Soon */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center gap-3 p-4 md:p-5 border-b border-border">
          <AlertTriangle size={18} className="text-warning" />
          <h3 className="text-lg font-semibold text-foreground">Expiring Soon</h3>
          <span className="ml-auto text-xs text-muted-foreground">Members with &lt; 5 days left</span>
        </div>

        {expiringMembers.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No members expiring within 5 days 🎉
          </div>
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left p-4 font-medium">Name</th>
                    <th className="text-left p-4 font-medium">Phone</th>
                    <th className="text-left p-4 font-medium">Expiry</th>
                    <th className="text-left p-4 font-medium">Days Left</th>
                    <th className="text-right p-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {expiringMembers.map((m) => (
                    <tr
                      key={m.id}
                      className="border-b border-border/50 hover:bg-accent/30 transition-colors"
                    >
                      <td className="p-4 font-medium text-foreground">{m.name}</td>
                      <td className="p-4 text-muted-foreground">{m.phone}</td>
                      <td className="p-4 text-muted-foreground">{m.expiryDate}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${m.daysLeft <= 2
                            ? "bg-destructive/20 text-destructive"
                            : "bg-warning/20 text-warning"
                            }`}
                        >
                          {m.daysLeft} day{m.daysLeft !== 1 ? "s" : ""}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => notifyWhatsApp(m)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-medium hover:bg-success/20 transition-colors"
                        >
                          <MessageCircle size={14} />
                          Notify
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden grid grid-cols-1 gap-0">
              {expiringMembers.map((m) => (
                <div key={m.id} className="p-4 border-b border-border last:border-0 hover:bg-accent/10 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{m.name}</h4>
                      <p className="text-xs text-muted-foreground">{m.expiryDate}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${m.daysLeft <= 2
                        ? "bg-destructive/20 text-destructive"
                        : "bg-warning/20 text-warning"
                        }`}
                    >
                      {m.daysLeft} day{m.daysLeft !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm text-muted-foreground">{m.phone}</span>
                    <button
                      onClick={() => notifyWhatsApp(m)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-medium hover:bg-success/20 transition-colors"
                    >
                      <MessageCircle size={14} />
                      Notify
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
