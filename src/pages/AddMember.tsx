import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserCheck, Check, Download, ChevronDown } from "lucide-react";
import { api, type Member, type Package } from "@/lib/store";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AddMember() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<Package[]>([]);

  useEffect(() => {
    api.getPackages().then(setPackages).catch(console.error);
  }, []);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "Male",
    dateOfJoining: new Date().toISOString().split("T")[0],
    packageId: "",
    customPlan: false,
    customPrice: "",
    customDuration: "",
    amountPaid: "",
  });

  // Compute total price dynamically
  const selectedPkg = packages.find((p) => (p.id || p._id) === form.packageId);
  const totalPrice = form.customPlan ? Number(form.customPrice) || 0 : selectedPkg?.price || 0;
  const paidAmount = Number(form.amountPaid) || 0;
  const dueAmount = Math.max(totalPrice - paidAmount, 0);

  // Set default package when packages are loaded
  useEffect(() => {
    if (packages.length > 0 && !form.packageId) {
      setForm(prev => ({ ...prev, packageId: packages[0].id || packages[0]._id || "" }));
    }
  }, [packages]);

  const [saved, setSaved] = useState(false);
  const [savedData, setSavedData] = useState<{
    member: any;
    packageName: string;
    price: number;
    amountPaid: number;
    duration: number;
    expiryDate: string;
  } | null>(null);

  const update = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const generatePaymentSlip = (data: {
    member: any;
    packageName: string;
    price: number;
    amountPaid: number;
    duration: number;
    expiryDate: string;
    dateOfJoining: string;
  }) => {
    const doc = new jsPDF();
    const memberId = data.member._id || data.member.id || "N/A";

    // Header
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("MUSCLE ENGINEER", 105, 25, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Membership Payment Slip", 105, 33, { align: "center" });

    // Line
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.line(20, 38, 190, 38);

    // Member Info
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Member Details", 20, 50);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${data.member.name}`, 20, 58);
    doc.text(`Phone: ${data.member.phone}`, 20, 65);
    if (data.member.email) {
      doc.text(`Email: ${data.member.email}`, 20, 72);
    }
    doc.text(`Gender: ${data.member.gender || "N/A"}`, 120, 58);
    doc.text(`Invoice #: ${memberId.slice(-6).toUpperCase()}`, 120, 65);

    // Membership Table
    autoTable(doc, {
      startY: data.member.email ? 80 : 75,
      head: [["Package", "Duration (Days)", "Joining Date", "Expiry Date", "Amount (₹)"]],
      body: [[
        data.packageName,
        String(data.duration),
        data.dateOfJoining,
        data.expiryDate,
        `₹${data.price.toLocaleString()}`
      ]],
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 10, cellPadding: 6 },
    });

    // Payment Summary
    const finalY = (doc as any).lastAutoTable?.finalY || 100;
    const due = Math.max(data.price - data.amountPaid, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Payment Summary", 20, finalY + 15);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Amount: ₹${data.price.toLocaleString()}`, 20, finalY + 23);
    doc.text(`Amount Paid: ₹${data.amountPaid.toLocaleString()}`, 20, finalY + 30);
    doc.text(`Due Amount: ₹${due.toLocaleString()}`, 20, finalY + 37);

    // Status badge
    doc.setFontSize(9);
    if (due <= 0) {
      doc.setTextColor(22, 163, 74);
      doc.text("Status: PAID", 150, finalY + 23);
    } else {
      doc.setTextColor(234, 88, 12);
      doc.text("Status: PAYMENT PENDING", 150, finalY + 23);
    }
    doc.setTextColor(0);

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.line(20, finalY + 48, 190, finalY + 48);
    doc.text("Thank you for choosing MUSCLE ENGINEER!", 105, finalY + 56, { align: "center" });
    doc.text(`Generated on: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`, 105, finalY + 62, { align: "center" });

    doc.save(`ME_${data.member.name.replace(/\s/g, "_")}_${data.dateOfJoining}.pdf`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;

    const pkg = packages.find((p) => (p.id || p._id) === form.packageId);
    const price = form.customPlan ? Number(form.customPrice) : pkg?.price || 0;
    const duration = form.customPlan ? Number(form.customDuration) : pkg?.duration || 30;
    const packageName = form.customPlan ? "Custom Plan" : pkg?.name || "N/A";
    const paid = Number(form.amountPaid) || 0;
    const due = Math.max(price - paid, 0);

    const joinDate = new Date(form.dateOfJoining);
    const expiryDate = new Date(joinDate.getTime() + duration * 86400000)
      .toISOString()
      .split("T")[0];

    try {
      const newMemberData = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        gender: form.gender,
        dateOfJoining: form.dateOfJoining,
        packageId: form.customPlan ? undefined : form.packageId,
        customPlan: form.customPlan,
        customPrice: form.customPlan ? Number(form.customPrice) : undefined,
        customDuration: form.customPlan ? Number(form.customDuration) : undefined,
        amountPaid: paid,
        expiryDate,
      };

      const savedMember = await api.addMember(newMemberData);

      // Auto-create transaction
      await api.addTransaction({
        memberId: savedMember._id || savedMember.id,
        memberName: savedMember.name,
        packageName,
        totalPrice: price,
        amountPaid: paid,
        dueAmount: due,
        date: form.dateOfJoining,
      });

      // Auto-download payment slip PDF
      generatePaymentSlip({
        member: { ...savedMember, gender: form.gender },
        packageName,
        price,
        amountPaid: paid,
        duration,
        expiryDate,
        dateOfJoining: form.dateOfJoining,
      });

      setSavedData({
        member: { ...savedMember, gender: form.gender },
        packageName,
        price,
        amountPaid: paid,
        duration,
        expiryDate,
      });
      setSaved(true);
    } catch (error) {
      console.error("Failed to add member", error);
      alert("Failed to add member. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 px-0">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Add New Member</h2>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">Register a new gym member</p>
      </div>

      {saved ? (
        <div className="glass-card p-6 sm:p-8 md:p-12 text-center space-y-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={28} className="text-success" />
          </div>
          <p className="text-base sm:text-lg font-semibold text-foreground">Member Added Successfully!</p>
          <p className="text-xs sm:text-sm text-muted-foreground">Payment slip has been downloaded automatically.</p>

          <div className="flex flex-col gap-3 justify-center pt-4">
            {savedData && (
              <button
                onClick={() =>
                  generatePaymentSlip({
                    ...savedData,
                    dateOfJoining: form.dateOfJoining,
                  })
                }
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 glow-blue transition-all text-sm w-full sm:w-auto sm:mx-auto"
              >
                <Download size={16} />
                Download Slip Again
              </button>
            )}
            <button
              onClick={() => navigate("/members")}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-all text-sm w-full sm:w-auto sm:mx-auto"
            >
              Go to Members
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-card p-3 sm:p-4 md:p-6 space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-medium text-foreground">Name *</label>
            <input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Full name"
            />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-medium text-foreground">Phone *</label>
              <input
                required
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="9876543210"
              />
            </div>
          </div>

          {/* Gender & Date of Joining */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-medium text-foreground">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => update("gender", e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-medium text-foreground">Date of Joining</label>
              <input
                type="date"
                value={form.dateOfJoining}
                onChange={(e) => update("dateOfJoining", e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Custom Plan Toggle */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => update("customPlan", !form.customPlan)}
              className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${form.customPlan ? "bg-primary" : "bg-border"
                }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${form.customPlan ? "translate-x-5" : ""
                  }`}
              />
            </button>
            <label className="text-xs sm:text-sm font-medium text-foreground">Custom Plan</label>
          </div>

          {/* Package Selection */}
          {form.customPlan ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-medium text-foreground">Price (₹)</label>
                <input
                  type="number"
                  required
                  value={form.customPrice}
                  onChange={(e) => update("customPrice", e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="2500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-medium text-foreground">Duration (days)</label>
                <input
                  type="number"
                  required
                  value={form.customDuration}
                  onChange={(e) => update("customDuration", e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="45"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-medium text-foreground">Select Package</label>
              <div className="relative">
                <select
                  value={form.packageId}
                  onChange={(e) => update("packageId", e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary appearance-none pr-10"
                >
                  <option value="">-- Select a Package --</option>
                  {packages.map((pkg) => {
                    const pkgId = pkg.id || pkg._id || "";
                    return (
                      <option key={pkgId} value={pkgId}>
                        {pkg.name} — ₹{pkg.price.toLocaleString()} ({pkg.duration} days)
                      </option>
                    );
                  })}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
              {/* Selected package summary */}
              {selectedPkg && (
                <div className="flex items-center gap-3 mt-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                  <div className="flex-1">
                    <span className="font-semibold text-foreground">{selectedPkg.name}</span>
                    <span className="text-muted-foreground ml-2">· {selectedPkg.duration} days</span>
                  </div>
                  <span className="text-primary font-bold">₹{selectedPkg.price.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {/* Payment Section */}
          {totalPrice > 0 && (
            <div className="rounded-lg border border-primary/20 bg-card/50 p-3 sm:p-4 space-y-3">
              <h3 className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                Payment Details
              </h3>
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-xs font-medium text-muted-foreground">Total</label>
                  <div className="px-2 sm:px-4 py-2 rounded-lg bg-secondary/50 border border-border text-xs sm:text-sm font-semibold text-foreground text-center">
                    ₹{totalPrice.toLocaleString()}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-xs font-medium text-muted-foreground">Paid (₹)</label>
                  <input
                    type="number"
                    min="0"
                    max={totalPrice}
                    value={form.amountPaid}
                    onChange={(e) => update("amountPaid", e.target.value)}
                    className="w-full px-2 sm:px-4 py-2 rounded-lg bg-secondary border border-border text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-center"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-xs font-medium text-muted-foreground">Due</label>
                  <div className={`px-2 sm:px-4 py-2 rounded-lg border text-xs sm:text-sm font-semibold text-center ${dueAmount > 0
                      ? "bg-warning/10 border-warning/30 text-warning"
                      : "bg-success/10 border-success/30 text-success"
                    }`}>
                    ₹{dueAmount.toLocaleString()}
                  </div>
                </div>
              </div>
              {dueAmount <= 0 && (
                <p className="text-xs text-success text-center font-medium">✓ Fully Paid</p>
              )}
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 glow-blue transition-all text-sm"
          >
            <UserCheck size={18} />
            Register Member
          </button>
        </form>
      )}
    </div>
  );
}
