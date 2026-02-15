export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export interface Package {
  _id?: string;
  id?: string; // For backward compatibility or frontend key
  name: string;
  price: number;
  duration: number; // days
}

export interface Member {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  dateOfJoining?: string;
  joinDate?: string; // Check backend model
  packageId?: string;
  customPlan: boolean;
  customPrice?: number;
  expiryDate: string;
}

export interface Trainer {
  _id?: string;
  id?: string;
  name: string;
  phone: string;
  specialty: string;
  salary: number;
}

export interface Transaction {
  _id?: string;
  id?: string;
  memberId: string;
  memberName: string;
  packageName: string;
  totalPrice: number;
  amountPaid: number;
  dueAmount: number;
  date: string;
}

export const api = {
  // Members
  getMembers: async (): Promise<Member[]> => {
    const res = await fetch(`${API_URL}/members`, { headers: getHeaders() });
    return res.json();
  },
  addMember: async (member: Partial<Member>) => {
    const res = await fetch(`${API_URL}/members`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(member),
    });
    return res.json();
  },
  deleteMember: async (id: string) => {
    await fetch(`${API_URL}/members/${id}`, { method: 'DELETE', headers: getHeaders() });
  },

  // Trainers
  getTrainers: async (): Promise<Trainer[]> => {
    const res = await fetch(`${API_URL}/trainers`, { headers: getHeaders() });
    return res.json();
  },
  addTrainer: async (trainer: Partial<Trainer>) => {
    const res = await fetch(`${API_URL}/trainers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(trainer),
    });
    return res.json();
  },
  deleteTrainer: async (id: string) => {
    await fetch(`${API_URL}/trainers/${id}`, { method: 'DELETE', headers: getHeaders() });
  },

  // Packages
  getPackages: async (): Promise<Package[]> => {
    const res = await fetch(`${API_URL}/packages`, { headers: getHeaders() });
    return res.json();
  },
  addPackage: async (pkg: Partial<Package>) => {
    const res = await fetch(`${API_URL}/packages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(pkg),
    });
    return res.json();
  },
  updatePackage: async (id: string, pkg: Partial<Package>) => {
    const res = await fetch(`${API_URL}/packages/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(pkg),
    });
    return res.json();
  },
  deletePackage: async (id: string) => {
    await fetch(`${API_URL}/packages/${id}`, { method: 'DELETE', headers: getHeaders() });
  },

  // Transactions
  getTransactions: async (): Promise<Transaction[]> => {
    const res = await fetch(`${API_URL}/transactions`, { headers: getHeaders() });
    return res.json();
  },
  addTransaction: async (txn: Partial<Transaction>) => {
    const res = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(txn),
    });
    return res.json();
  },
  updateTransaction: async (id: string, txn: Partial<Transaction>) => {
    const res = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(txn),
    });
    return res.json();
  },
};

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

export function getDaysUntilExpiry(expiryDate: string): number {
  if (!expiryDate) return 0;
  const diff = new Date(expiryDate).getTime() - new Date().getTime();
  return Math.ceil(diff / 86400000);
}
