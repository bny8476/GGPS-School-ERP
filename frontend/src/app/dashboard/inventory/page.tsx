'use client';

import React, { useState, useEffect } from 'react';
import { Package, ShoppingBag, Plus, Search, AlertCircle, CheckCircle, Clock, DollarSign, Filter } from 'lucide-react';
import { EmergencyBanner } from '@/components/ui/EmergencyBanner';
import { getApiBaseUrl } from '@/lib/utils';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'stock' | 'orders'>('stock');
  const [items, setItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showItemModal, setShowItemModal] = useState(false);
  const [newItem, setNewItem] = useState({
    itemName: '',
    category: 'Stationery',
    quantity: 100,
    unit: 'Pcs',
    minThreshold: 15,
    unitPrice: 10,
    location: 'Main Warehouse',
  });

  const [showPOModal, setShowPOModal] = useState(false);
  const [newPO, setNewPO] = useState({
    vendorName: '',
    itemName: '',
    quantity: 50,
    estimatedPrice: 20,
  });

  const API_BASE = getApiBaseUrl();

  const getAuthHeaders = (extra: Record<string, string> = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extra,
    };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'stock') {
        const res = await fetch(`${API_BASE}/api/inventory/items`, {
          headers: getAuthHeaders(),
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success) setItems(data.data || []);
      } else {
        const res = await fetch(`${API_BASE}/api/inventory/orders`, {
          headers: getAuthHeaders(),
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success) setOrders(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/inventory/items`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify(newItem),
      });
      if (res.ok) {
        setShowItemModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/inventory/orders`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify({
          vendorName: newPO.vendorName,
          items: [{ itemName: newPO.itemName, quantity: Number(newPO.quantity), estimatedPrice: Number(newPO.estimatedPrice) }],
        }),
      });
      if (res.ok) {
        setShowPOModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <EmergencyBanner />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            Inventory & Procurement
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            GGPS School • Stock Tracking, Reorder Thresholds & Purchase Orders
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'stock' ? (
            <button
              onClick={() => setShowItemModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-md"
            >
              <Plus className="w-5 h-5" /> Add Stock Item
            </button>
          ) : (
            <button
              onClick={() => setShowPOModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-md"
            >
              <Plus className="w-5 h-5" /> Create Purchase Order
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('stock')}
          className={`flex items-center gap-2 pb-3 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'stock'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Package className="w-4 h-4" /> Stock Items & Assets
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 pb-3 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'orders'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Purchase Orders & Procurement
        </button>
      </div>

      {/* STOCK TAB */}
      {activeTab === 'stock' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
                <th className="p-4">Item Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Unit Price</th>
                <th className="p-4">Location</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No inventory items recorded.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{item.itemName}</td>
                    <td className="p-4">{item.category}</td>
                    <td className="p-4 font-semibold">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="p-4">${item.unitPrice}</td>
                    <td className="p-4 text-slate-500">{item.location || 'Warehouse'}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          item.status === 'In Stock'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                            : item.status === 'Low Stock'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
                <th className="p-4">PO Number</th>
                <th className="p-4">Vendor</th>
                <th className="p-4">Items Requested</th>
                <th className="p-4">Total Cost</th>
                <th className="p-4">Requested By</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No purchase orders logged.
                  </td>
                </tr>
              ) : (
                orders.map((po) => (
                  <tr key={po._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="p-4 font-bold text-indigo-600 dark:text-indigo-400">{po.poNumber}</td>
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">{po.vendorName}</td>
                    <td className="p-4 text-xs text-slate-500">
                      {po.items?.map((i: any) => `${i.itemName} (x${i.quantity})`).join(', ')}
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">${po.totalCost}</td>
                    <td className="p-4 text-xs">{po.requestedBy?.name || 'Staff'}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                        {po.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: ADD ITEM */}
      {showItemModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-xl text-slate-900 dark:text-white">Add Inventory Stock</h3>
            <form onSubmit={handleCreateItem} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={newItem.itemName}
                  onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 text-sm"
                  placeholder="Whiteboard Markers (Pack of 12)"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 text-sm"
                  >
                    <option value="Stationery">Stationery</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Sports">Sports</option>
                    <option value="Lab">Lab Equipment</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    required
                    value={newItem.unitPrice}
                    onChange={(e) => setNewItem({ ...newItem, unitPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Min Threshold</label>
                  <input
                    type="number"
                    required
                    value={newItem.minThreshold}
                    onChange={(e) => setNewItem({ ...newItem, minThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE PO */}
      {showPOModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-xl text-slate-900 dark:text-white">Create Purchase Order</h3>
            <form onSubmit={handleCreatePO} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Vendor Name</label>
                <input
                  type="text"
                  required
                  value={newPO.vendorName}
                  onChange={(e) => setNewPO({ ...newPO, vendorName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 text-sm"
                  placeholder="Global School Supplies Ltd."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Item Requested</label>
                <input
                  type="text"
                  required
                  value={newPO.itemName}
                  onChange={(e) => setNewPO({ ...newPO, itemName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 text-sm"
                  placeholder="Science Lab Microscopes"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    value={newPO.quantity}
                    onChange={(e) => setNewPO({ ...newPO, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    required
                    value={newPO.estimatedPrice}
                    onChange={(e) => setNewPO({ ...newPO, estimatedPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPOModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
                  Submit Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
