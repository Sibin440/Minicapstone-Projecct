import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addressAPI, adminAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './UserPages.css';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addresses, setAddresses] = useState([]);
  const [loyalty, setLoyalty] = useState({ balance: 0, transactions: [] });
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [newAddr, setNewAddr] = useState({ name: '', phone: '', address_line1: '', city: '', state: '', pincode: '', type: 'Home' });

  useEffect(() => {
    addressAPI.getAll().then(data => setAddresses(data.addresses || [])).catch(() => {});
    adminAPI.getMyLoyalty().then(r => setLoyalty({ balance: r.balance || 0, transactions: r.transactions || [] })).catch(() => {});
  }, []);

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateUser({ ...user, name, phone });
    addToast('Profile updated!', 'success');
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await addressAPI.add(newAddr);
      addToast('Address added!', 'success');
      const updated = await addressAPI.getAll();
      setAddresses(updated.addresses || []);
      setShowAddAddr(false);
      setNewAddr({ name: '', phone: '', address_line1: '', city: '', state: '', pincode: '', type: 'Home' });
    } catch (err) {
      addToast(err.message || 'Failed to add address', 'error');
    }
  };

  return (
    <div className="user-page page-enter container">
      <h1 className="user-page-title">My Account</h1>

      <div className="user-grid">
        {/* Left Column: Personal Details */}
        <div className="user-card">
          <h2>Personal Details</h2>
          <form onSubmit={handleProfileSave}>
            <div className="form-group">
              <label>Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={user?.email || ''} disabled readOnly />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <button type="submit" className="btn-primary">Save Profile</button>
          </form>
        </div>

        {/* Right Column: Saved Addresses & Reward Points directly below */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="user-card" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h2 style={{ margin: 0 }}>Saved Addresses</h2>
              <button
                className="btn-primary"
                style={{ padding: '3px 10px', fontSize: '.78rem' }}
                onClick={() => setShowAddAddr(!showAddAddr)}
              >
                {showAddAddr ? 'Cancel' : '+ Add'}
              </button>
            </div>

            {showAddAddr && (
              <form onSubmit={handleAddAddress} style={{ background: '#fff', padding: 10, borderRadius: 8, border: '1px solid var(--border)', marginBottom: 10 }}>
                <input placeholder="Full Name" value={newAddr.name} onChange={e => setNewAddr({ ...newAddr, name: e.target.value })} required style={{ width: '100%', marginBottom: 6, padding: 5, fontSize: '.85rem' }} />
                <input placeholder="Phone" value={newAddr.phone} onChange={e => setNewAddr({ ...newAddr, phone: e.target.value })} required style={{ width: '100%', marginBottom: 6, padding: 5, fontSize: '.85rem' }} />
                <input placeholder="Address Line 1" value={newAddr.address_line1} onChange={e => setNewAddr({ ...newAddr, address_line1: e.target.value })} required style={{ width: '100%', marginBottom: 6, padding: 5, fontSize: '.85rem' }} />
                <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                  <input placeholder="City" value={newAddr.city} onChange={e => setNewAddr({ ...newAddr, city: e.target.value })} required style={{ flex: 1, padding: 5, fontSize: '.85rem' }} />
                  <input placeholder="Pincode" value={newAddr.pincode} onChange={e => setNewAddr({ ...newAddr, pincode: e.target.value })} required style={{ width: 80, padding: 5, fontSize: '.85rem' }} />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', padding: 5, fontSize: '.8rem' }}>Save Address</button>
              </form>
            )}

            {addresses.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '.85rem', margin: '4px 0' }}>No saved addresses.</p>
            ) : (
              addresses.map(a => (
                <div key={a.id} className="address-box" style={{ padding: '.75rem', marginBottom: '.5rem' }}>
                  <strong>{a.name} ({a.type})</strong>
                  <p>{a.address_line1}, {a.city}, {a.pincode}</p>
                  <p>Phone: {a.phone}</p>
                </div>
              ))
            )}
          </div>

          <div className="user-card" style={{ marginBottom: 0 }}>
            <h2>🪙 My Reward Points</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fffdf5', border: '1.5px solid #c8972b', padding: 14, borderRadius: 10, marginBottom: 12 }}>
              <span style={{ fontSize: '2rem' }}>🪙</span>
              <div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a2744' }}>{loyalty.balance} Points</div>
                <div style={{ fontSize: '.78rem', color: '#6b7a9d' }}>Earned from delivered purchases!</div>
              </div>
            </div>

            {loyalty.transactions.length > 0 ? (
              <div>
                <h3 style={{ fontSize: '.85rem', fontWeight: 700, marginBottom: 8, color: '#1a2744' }}>Points History</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {loyalty.transactions.map((tx, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', borderRadius: 6, fontSize: '.82rem', border: '1px solid var(--border-light)' }}>
                      <span>{tx.reason}</span>
                      <strong style={{ color: '#16a34a' }}>+{tx.pts} pts</strong>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ color: '#6b7a9d', fontSize: '.8rem' }}>Points history will show here after orders are delivered.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
