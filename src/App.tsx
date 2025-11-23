import React, { useState, useEffect } from 'react';
// Check this filename one last time (firebase-config vs firebase)
import { db } from './firebase';

import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
  where,
} from 'firebase/firestore';

// --- THE FIX IS HERE ---
// We removed 'User' from this line
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
// We import 'User' separately as a type
import type { User } from 'firebase/auth';

import Auth from './Auth';
import './App.css';

// STYLES OBJECT
const styles = {
  container: { padding: '20px', maxWidth: '600px', margin: '0 auto' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid #333',
    paddingBottom: '15px',
  },
  form: {
    background: '#1e1e1e',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  inputRow: { display: 'flex', gap: '10px' },
  input: {
    flex: 1,
    padding: '12px',
    borderRadius: '5px',
    border: '1px solid #333',
    background: '#2c2c2c',
    color: 'white',
  },
  select: {
    padding: '12px',
    borderRadius: '5px',
    border: '1px solid #333',
    background: '#2c2c2c',
    color: 'white',
  },
  btn: {
    padding: '12px',
    borderRadius: '5px',
    border: 'none',
    background: '#007bff',
    color: 'white',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
  },
  list: { marginTop: '20px' },
  item: {
    background: '#1e1e1e',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
};

interface Expense {
  id: string;
  item: string;
  amount: number;
  category: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Form States
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('🍔 Food');
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const auth = getAuth();

  // 1. CHECK LOGIN
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. LOAD EXPENSES
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'expenses'),
      where('uid', '==', user.uid),
      orderBy('timestamp', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setExpenses(
        snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Expense)
        )
      );
    });
    return () => unsubscribe();
  }, [user]);

  // 3. ADD EXPENSE
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !amount || !user) return;
    try {
      await addDoc(collection(db, 'expenses'), {
        item,
        amount: parseFloat(amount),
        category,
        timestamp: new Date(),
        uid: user.uid,
      });
      setItem('');
      setAmount('');
    } catch (err) {
      console.error(err);
      alert('Error adding item');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this?')) await deleteDoc(doc(db, 'expenses', id));
  };

  if (loading)
    return (
      <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>
        Loading...
      </div>
    );

  if (!user) return <Auth />;

  const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0 }}>💸 Yen's Budget</h2>
          <small style={{ color: '#888' }}>{user.email}</small>
        </div>
        <button
          onClick={() => signOut(auth)}
          style={{ ...styles.btn, background: '#444' }}
        >
          Logout
        </button>
      </div>

      <form onSubmit={handleAdd} style={styles.form}>
        <div style={styles.inputRow}>
          <input
            style={styles.input}
            placeholder="Item name"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            required
          />
          <input
            style={{ ...styles.input, maxWidth: '80px' }}
            type="number"
            placeholder="₱"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div style={styles.inputRow}>
          <select
            style={{ ...styles.select, flex: 1 }}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>🍔 Food</option>
            <option>🚗 Transpo</option>
            <option>🏠 Bills</option>
            <option>🛍️ Shopping</option>
            <option>🎮 Luho</option>
          </select>
          <button type="submit" style={styles.btn}>
            ADD
          </button>
        </div>
      </form>

      <h3
        style={{
          textAlign: 'right',
          color: '#4caf50',
          borderBottom: '1px solid #333',
          paddingBottom: '10px',
        }}
      >
        Total: ₱{total.toLocaleString()}
      </h3>

      <div style={styles.list}>
        {expenses.map((exp) => (
          <div key={exp.id} style={styles.item}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '1.5rem' }}>
                {exp.category.split(' ')[0]}
              </span>
              <div>
                <div style={{ fontWeight: 'bold' }}>{exp.item}</div>
                <small style={{ color: '#888' }}>{exp.category}</small>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold' }}>
                ₱{exp.amount.toLocaleString()}
              </span>
              <button
                onClick={() => handleDelete(exp.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ff4444',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                }}
              >
                &times;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
