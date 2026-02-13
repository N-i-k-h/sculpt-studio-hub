import { useState, useEffect } from "react";
import { Package as PackageIcon, Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { api, type Package } from "@/lib/store";

export default function Packages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", price: "", duration: "" });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const data = await api.getPackages();
      setPackages(data);
    } catch (err) {
      console.error("Failed to load packages", err);
    }
  };

  const addPackage = async () => {
    if (!form.name.trim() || !form.price || !form.duration) return;
    try {
      const newPkg = {
        name: form.name.trim(),
        price: Number(form.price),
        duration: Number(form.duration),
      };
      await api.addPackage(newPkg);
      await fetchPackages();
      setForm({ name: "", price: "", duration: "" });
      setAdding(false);
    } catch (err) {
      console.error("Failed to add package", err);
    }
  };

  const updatePackage = async (id: string) => {
    try {
      const pkg = {
        name: form.name,
        price: Number(form.price),
        duration: Number(form.duration)
      };
      await api.updatePackage(id, pkg);
      await fetchPackages();
      setEditing(null);
    } catch (err) {
      console.error("Failed to update package", err);
    }
  };

  const deletePackage = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.deletePackage(id);
      setPackages(packages.filter((p) => (p._id || p.id) !== id));
    } catch (err) {
      console.error("Failed to delete package", err);
    }
  };

  const startEdit = (pkg: Package) => {
    setEditing(pkg._id || pkg.id || "");
    setForm({ name: pkg.name, price: String(pkg.price), duration: String(pkg.duration) });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Packages</h2>
          <p className="text-muted-foreground text-sm mt-1">Manage gym membership plans</p>
        </div>
        <button
          onClick={() => {
            setAdding(true);
            setForm({ name: "", price: "", duration: "" });
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 glow-blue transition-all w-full sm:w-auto"
        >
          <Plus size={16} />
          Add Package
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => {
          const pkgId = pkg._id || pkg.id || "";
          return editing === pkgId ? (
            <div key={pkgId} className="glass-card p-4 md:p-5 space-y-3 border-primary/30">
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Package name"
              />
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Price"
              />
              <input
                type="number"
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Duration (days)"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => updatePackage(pkgId)}
                  className="flex-1 py-2 rounded-lg bg-success/20 text-success text-sm font-medium hover:bg-success/30 transition-colors"
                >
                  <Check size={14} className="inline mr-1" /> Save
                </button>
                <button
                  onClick={() => setEditing(null)}
                  className="flex-1 py-2 rounded-lg bg-destructive/20 text-destructive text-sm font-medium hover:bg-destructive/30 transition-colors"
                >
                  <X size={14} className="inline mr-1" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              key={pkgId}
              className="kpi-card group hover:border-primary/30 transition-colors"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <PackageIcon size={20} />
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(pkg)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => deletePackage(pkgId)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground">{pkg.name}</h3>
                <p className="text-2xl font-bold text-primary mt-1">₹{pkg.price.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">{pkg.duration} days</p>
              </div>
            </div>
          );
        })}

        {adding && (
          <div className="glass-card p-4 md:p-5 space-y-3 border-primary/30 border-dashed">
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Package name"
            />
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Price (₹)"
            />
            <input
              type="number"
              value={form.duration}
              onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Duration (days)"
            />
            <div className="flex gap-2">
              <button
                onClick={addPackage}
                className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setAdding(false)}
                className="flex-1 py-2 rounded-lg bg-secondary text-muted-foreground text-sm font-medium hover:bg-accent transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
