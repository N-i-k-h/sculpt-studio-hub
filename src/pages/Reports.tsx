import { useState, useMemo, useEffect } from "react";
import { FileBarChart, Calendar } from "lucide-react";
import { api, type Transaction } from "@/lib/store";

type FilterType = "this-month" | "last-3" | "custom";

export default function Reports() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<FilterType>("this-month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  useEffect(() => {
    api.getTransactions().then(setTransactions).catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    const now = new Date();
    return transactions.filter((t) => {
      const d = new Date(t.date);
      if (filter === "this-month") {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      if (filter === "last-3") {
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        return d >= threeMonthsAgo;
      }
      if (filter === "custom" && customFrom && customTo) {
        return d >= new Date(customFrom) && d <= new Date(customTo);
      }
      return true;
    });
  }, [transactions, filter, customFrom, customTo]);

  const totalPaid = filtered.reduce((s, t) => s + t.amountPaid, 0);
  const totalDue = filtered.reduce((s, t) => s + t.dueAmount, 0);

  const filters: { label: string; value: FilterType }[] = [
    { label: "This Month", value: "this-month" },
    { label: "Last 3 Months", value: "last-3" },
    { label: "Custom Range", value: "custom" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Financial Reports</h2>
        <p className="text-muted-foreground text-sm mt-1">Revenue analysis and transaction history</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f.value
              ? "bg-primary text-primary-foreground glow-blue"
              : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
          >
            {f.label}
          </button>
        ))}
        {filter === "custom" && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-auto"
            />
            <span className="text-muted-foreground hidden sm:inline">to</span>
            <span className="text-muted-foreground sm:hidden text-xs">to</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-auto"
            />
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="kpi-card">
          <div className="relative z-10">
            <p className="text-sm text-muted-foreground">Total Collected</p>
            <p className="text-3xl font-bold text-success mt-2">₹{totalPaid.toLocaleString()}</p>
          </div>
        </div>
        <div className="kpi-card">
          <div className="relative z-10">
            <p className="text-sm text-muted-foreground">Total Outstanding</p>
            <p className="text-3xl font-bold text-warning mt-2">₹{totalDue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      {/* Desktop View */}
      <div className="hidden md:block glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left p-4 font-medium">Member</th>
                <th className="text-left p-4 font-medium">Package</th>
                <th className="text-left p-4 font-medium">Total (₹)</th>
                <th className="text-left p-4 font-medium">Paid (₹)</th>
                <th className="text-left p-4 font-medium">Due (₹)</th>
                <th className="text-left p-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t._id || t.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                  <td className="p-4 font-medium text-foreground">{t.memberName}</td>
                  <td className="p-4 text-muted-foreground">{t.packageName}</td>
                  <td className="p-4 text-foreground">₹{t.totalPrice.toLocaleString()}</td>
                  <td className="p-4 text-success">₹{t.amountPaid.toLocaleString()}</td>
                  <td className="p-4 text-warning">₹{t.dueAmount.toLocaleString()}</td>
                  <td className="p-4 text-muted-foreground">{t.date}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No transactions found for this period
                  </td>
                </tr>
              )}
              {filtered.length > 0 && (
                <tr className="bg-accent/20 font-semibold">
                  <td className="p-4 text-foreground" colSpan={3}>Summary</td>
                  <td className="p-4 text-success">₹{totalPaid.toLocaleString()}</td>
                  <td className="p-4 text-warning">₹{totalDue.toLocaleString()}</td>
                  <td className="p-4"></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {filtered.map((t) => (
          <div key={t._id || t.id} className="glass-card p-4 space-y-2">
            <div className="flex justify-between items-start">
              <h4 className="font-semibold text-foreground">{t.memberName}</h4>
              <span className="text-xs text-muted-foreground">{t.date}</span>
            </div>
            <p className="text-xs text-muted-foreground">{t.packageName}</p>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border mt-2 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Total</p>
                <p className="font-medium">₹{t.totalPrice.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Paid</p>
                <p className="font-medium text-success">₹{t.amountPaid.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Due</p>
                <p className="font-medium text-warning">₹{t.dueAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center p-8 text-muted-foreground glass-card">
            No transactions found for this period
          </div>
        )}
      </div>
    </div>
  );
}
