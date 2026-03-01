import { useState, useEffect } from "react";
import { Download, Edit2, Check, X, Plus } from "lucide-react";
import { api, type Transaction, type Member, type Package } from "@/lib/store";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Billing() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBill, setNewBill] = useState({ memberName: "", packageName: "", totalPrice: "", amountPaid: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [txn, mem, pkg] = await Promise.all([
        api.getTransactions(),
        api.getMembers(),
        api.getPackages()
      ]);
      setTransactions(txn);
      setMembers(mem);
      setPackages(pkg);
    } catch (err) {
      console.error("Failed to load billing data", err);
    }
  };

  const addBill = async () => {
    const total = Number(newBill.totalPrice);
    const paid = Number(newBill.amountPaid);
    if (!newBill.memberName || !newBill.packageName || isNaN(total) || isNaN(paid) || total <= 0 || paid < 0) return;
    const member = members.find(m => m.name === newBill.memberName);
    try {
      const txn = {
        memberId: member?._id || member?.id || "",
        memberName: newBill.memberName,
        packageName: newBill.packageName,
        totalPrice: total,
        amountPaid: Math.min(paid, total),
        dueAmount: Math.max(total - paid, 0),
        date: new Date().toISOString().split("T")[0],
      };
      await api.addTransaction(txn);
      await fetchData();
      setNewBill({ memberName: "", packageName: "", totalPrice: "", amountPaid: "" });
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to add transaction", err);
    }
  };

  const updatePaid = async (id: string) => {
    const paid = Number(editValue);
    if (isNaN(paid) || paid < 0) return;

    const txn = transactions.find(t => (t._id || t.id) === id);
    if (!txn) return;

    try {
      const update = {
        amountPaid: paid,
        dueAmount: txn.totalPrice - paid
      };
      await api.updateTransaction(id, update);
      await fetchData();
      setEditingId(null);
    } catch (err) {
      console.error("Failed to update transaction", err);
    }
  };

  const downloadPDF = (txn: Transaction) => {
    const doc = new jsPDF();
    const txnId = txn._id || txn.id || "N/A";

    // Header
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("THE MUSCLE ENGINEER", 105, 25, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Invoice / Billing Receipt", 105, 33, { align: "center" });

    // Line
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.line(20, 38, 190, 38);

    // Customer Info
    doc.setFontSize(11);
    doc.text(`Customer: ${txn.memberName}`, 20, 50);
    doc.text(`Date: ${txn.date}`, 20, 58);
    doc.text(`Invoice #: ${txnId.slice(-6).toUpperCase()}`, 150, 50);

    // Table
    autoTable(doc, {
      startY: 68,
      head: [["Package", "Total Price (₹)", "Paid (₹)", "Due (₹)"]],
      body: [[txn.packageName, txn.totalPrice.toLocaleString(), txn.amountPaid.toLocaleString(), txn.dueAmount.toLocaleString()]],
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 10, cellPadding: 6 },
    });

    // Footer
    const finalY = (doc as any).lastAutoTable?.finalY || 100;
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text("Thank you for choosing THE MUSCLE ENGINEER!", 105, finalY + 20, { align: "center" });

    doc.save(`TME_${txn.memberName.replace(/\s/g, "_")}_${txn.date}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Billing & Transactions</h2>
          <p className="text-muted-foreground text-sm mt-1">Manage payments and generate invoices</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium w-full sm:w-auto"
        >
          <Plus size={16} />
          Add Bill
        </button>
      </div>

      {showAddForm && (
        <div className="glass-card p-4 md:p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">New Bill</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Member Name</label>
              <select
                value={newBill.memberName}
                onChange={(e) => setNewBill({ ...newBill, memberName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select Member</option>
                {members.map((m) => (
                  <option key={m._id || m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Package</label>
              <select
                value={newBill.packageName}
                onChange={(e) => {
                  const pkg = packages.find(p => p.name === e.target.value);
                  setNewBill({ ...newBill, packageName: e.target.value, totalPrice: pkg ? String(pkg.price) : newBill.totalPrice });
                }}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select Package</option>
                {packages.map((p) => (
                  <option key={p._id || p.id} value={p.name}>{p.name} – ₹{p.price}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Total Price (₹)</label>
              <input
                type="number"
                value={newBill.totalPrice}
                onChange={(e) => setNewBill({ ...newBill, totalPrice: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Amount Paid (₹)</label>
              <input
                type="number"
                value={newBill.amountPaid}
                onChange={(e) => setNewBill({ ...newBill, amountPaid: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={addBill} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium">
              Save Bill
            </button>
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded-lg bg-secondary text-muted-foreground hover:bg-secondary/80 transition-colors text-sm font-medium">
              Cancel
            </button>
          </div>
        </div>
      )}

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
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => {
                const txnId = txn._id || txn.id || "";
                return (
                  <tr key={txnId} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="p-4 font-medium text-foreground">{txn.memberName}</td>
                    <td className="p-4 text-muted-foreground">{txn.packageName}</td>
                    <td className="p-4 text-foreground">₹{txn.totalPrice.toLocaleString()}</td>
                    <td className="p-4">
                      {editingId === txnId ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-24 px-2 py-1 rounded bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            autoFocus
                          />
                          <button onClick={() => updatePaid(txnId)} className="text-success hover:text-success/80">
                            <Check size={16} />
                          </button>
                          <button onClick={() => setEditingId(null)} className="text-destructive hover:text-destructive/80">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-success">₹{txn.amountPaid.toLocaleString()}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={txn.dueAmount > 0 ? "text-warning" : "text-success"}>
                        ₹{txn.dueAmount.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">{txn.date}</td>
                    <td className="p-4 text-right flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setEditingId(txnId);
                          setEditValue(String(txn.amountPaid));
                        }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => downloadPDF(txn)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Download size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {transactions.map((txn) => {
          const txnId = txn._id || txn.id || "";
          return (
            <div key={txnId} className="glass-card p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-foreground">{txn.memberName}</h4>
                  <p className="text-xs text-muted-foreground">{txn.packageName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{txn.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">Total: ₹{txn.totalPrice.toLocaleString()}</p>
                  <span className={`text-xs font-medium ${txn.dueAmount > 0 ? "text-warning" : "text-success"}`}>
                    Due: ₹{txn.dueAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Paid:</span>
                  {editingId === txnId ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-16 px-1 py-0.5 rounded bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        autoFocus
                      />
                      <button onClick={() => updatePaid(txnId)} className="text-success p-1">
                        <Check size={14} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-destructive p-1">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-success font-medium">₹{txn.amountPaid.toLocaleString()}</span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingId(txnId);
                      setEditValue(String(txn.amountPaid));
                    }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => downloadPDF(txn)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
