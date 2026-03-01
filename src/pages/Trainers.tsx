import { useState, useEffect } from "react";
import { UserCheck, Plus, Trash2, IndianRupee } from "lucide-react";
import { api, type Trainer } from "@/lib/store";

export default function Trainers() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", specialty: "", salary: "" });

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      const data = await api.getTrainers();
      setTrainers(data);
    } catch (err) {
      console.error("Failed to load trainers", err);
    }
  };

  const isPayday = new Date().getDate() === 1;

  const addTrainer = async () => {
    if (!form.name.trim()) return;
    try {
      const newTrainer = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        specialty: form.specialty.trim(),
        salary: Number(form.salary) || 0,
      };
      await api.addTrainer(newTrainer);
      await fetchTrainers();
      setForm({ name: "", phone: "", specialty: "", salary: "" });
      setAdding(false);
    } catch (err) {
      console.error("Failed to add trainer", err);
    }
  };

  const deleteTrainer = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.deleteTrainer(id);
      setTrainers(trainers.filter((t) => (t._id || t.id) !== id));
    } catch (err) {
      console.error("Failed to delete trainer", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Trainers</h2>
          <p className="text-muted-foreground text-sm mt-1">{trainers.length} trainers on staff</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 glow-blue transition-all w-full sm:w-auto"
        >
          <Plus size={16} />
          Add Trainer
        </button>
      </div>

      {adding && (
        <div className="glass-card p-4 md:p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Trainer Name"
            />
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Phone"
            />
            <input
              value={form.specialty}
              onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Specialty"
            />
            <input
              type="number"
              value={form.salary}
              onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Monthly Salary (₹)"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={addTrainer} className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              Save
            </button>
            <button onClick={() => setAdding(false)} className="px-6 py-2 rounded-lg bg-secondary text-muted-foreground text-sm font-medium hover:bg-accent transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainers.map((t) => {
          const tId = t._id || t.id || "";
          return (
            <div key={tId} className="kpi-card group hover:border-primary/30 transition-colors">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <UserCheck size={18} />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => deleteTrainer(tId)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground">{t.name}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{t.specialty}</p>
                <p className="text-sm text-muted-foreground">{t.phone}</p>
                <div className="flex items-center gap-1 mt-3 text-primary font-bold">
                  <IndianRupee size={16} />
                  ₹{t.salary.toLocaleString()}/mo
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
