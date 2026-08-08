'use client';

import '@/styles/demo-theme.css';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Store, LayoutDashboard, Package, ShoppingCart, Users, UserCheck, BarChart2,
  TrendingUp, AlertTriangle, ChevronDown, ChevronUp,
  X, Menu, Search, Plus, ArrowUpRight, ArrowDownRight,
  Calendar, Bell, Phone, Mail, MapPin, CheckCircle2,
  XCircle, Edit2, Share, Smartphone, Download, Sun, Moon,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const PRODUCTS = [
  { id: 'P001', name: 'Banarasi Silk Saree', sku: 'SAR-BAN-001', category: 'Sarees', qty: 12, reorder: 5, price: 4500 },
  { id: 'P002', name: 'Anarkali Kurta Set', sku: 'KUR-ANK-002', category: 'Kurta Sets', qty: 3, reorder: 8, price: 2200 },
  { id: 'P003', name: "Men's Pathani Suit", sku: 'MEN-PAT-003', category: "Men's Wear", qty: 7, reorder: 4, price: 1800 },
  { id: 'P004', name: 'Lehenga Choli', sku: 'LEH-CHO-004', category: 'Lehengas', qty: 2, reorder: 3, price: 8500 },
  { id: 'P005', name: 'Cotton Kurti', sku: 'KUR-COT-005', category: 'Kurtis', qty: 24, reorder: 10, price: 650 },
  { id: 'P006', name: 'Dupatta Set', sku: 'DUP-SET-006', category: 'Dupattas', qty: 18, reorder: 8, price: 450 },
  { id: 'P007', name: 'Palazzo Set', sku: 'PAL-SET-007', category: 'Palazzo Sets', qty: 9, reorder: 5, price: 1100 },
  { id: 'P008', name: 'Sherwani', sku: 'MEN-SHE-008', category: "Men's Wear", qty: 4, reorder: 2, price: 6500 },
  { id: 'P009', name: 'Salwar Suit', sku: 'SAL-SUI-009', category: 'Salwar Suits', qty: 2, reorder: 6, price: 1350 },
  { id: 'P010', name: 'Kurtis Pack', sku: 'KUR-PAK-010', category: 'Kurtis', qty: 15, reorder: 8, price: 1200 },
  { id: 'P011', name: 'Ethnic Bag', sku: 'ACC-BAG-011', category: 'Accessories', qty: 11, reorder: 5, price: 850 },
  { id: 'P012', name: 'Mojari Shoes', sku: 'ACC-MOJ-012', category: 'Footwear', qty: 6, reorder: 4, price: 750 },
];

const CUSTOMERS = [
  { id: 'C001', name: 'Priya Sharma', phone: '98765-43210', email: 'priya@email.com', city: 'Delhi', spent: 28400, orders: 8, loyalty: 2840, joined: '2023-03-12' },
  { id: 'C002', name: 'Meena Agarwal', phone: '87654-32109', email: 'meena@email.com', city: 'Jaipur', spent: 42600, orders: 13, loyalty: 4260, joined: '2022-11-05' },
  { id: 'C003', name: 'Sunita Devi', phone: '76543-21098', email: 'sunita@email.com', city: 'Lucknow', spent: 15200, orders: 5, loyalty: 1520, joined: '2024-01-20' },
  { id: 'C004', name: 'Kavita Singh', phone: '65432-10987', email: 'kavita@email.com', city: 'Varanasi', spent: 67800, orders: 21, loyalty: 6780, joined: '2022-06-18' },
  { id: 'C005', name: 'Rekha Mehta', phone: '54321-09876', email: 'rekha@email.com', city: 'Mumbai', spent: 11500, orders: 4, loyalty: 1150, joined: '2024-03-07' },
  { id: 'C006', name: 'Anita Joshi', phone: '43210-98765', email: 'anita@email.com', city: 'Pune', spent: 33900, orders: 10, loyalty: 3390, joined: '2023-07-14' },
  { id: 'C007', name: 'Pooja Yadav', phone: '32109-87654', email: 'pooja@email.com', city: 'Agra', spent: 19700, orders: 6, loyalty: 1970, joined: '2023-10-01' },
  { id: 'C008', name: 'Deepika Tiwari', phone: '21098-76543', email: 'deepika@email.com', city: 'Kanpur', spent: 52100, orders: 16, loyalty: 5210, joined: '2022-09-25' },
  { id: 'C009', name: 'Shreya Gupta', phone: '10987-65432', email: 'shreya@email.com', city: 'Bhopal', spent: 8900, orders: 3, loyalty: 890, joined: '2024-05-11' },
  { id: 'C010', name: 'Nandini Patel', phone: '09876-54321', email: 'nandini@email.com', city: 'Surat', spent: 44300, orders: 14, loyalty: 4430, joined: '2023-01-30' },
];

const ORDERS = [
  { id: 'ORD-2847', customer: 'Kavita Singh', customerId: 'C004', date: '2026-08-02', items: [{ name: 'Banarasi Silk Saree', qty: 1, price: 4500 }, { name: 'Dupatta Set', qty: 2, price: 900 }], total: 5400, payment: 'UPI', status: 'DELIVERED', address: '42 Shiva Nagar, Varanasi, UP 221001' },
  { id: 'ORD-2846', customer: 'Meena Agarwal', customerId: 'C002', date: '2026-08-02', items: [{ name: 'Lehenga Choli', qty: 1, price: 8500 }], total: 8500, payment: 'CASH', status: 'CONFIRMED', address: '7 Pink City Road, Jaipur, RJ 302001' },
  { id: 'ORD-2845', customer: 'Priya Sharma', customerId: 'C001', date: '2026-08-01', items: [{ name: 'Cotton Kurti', qty: 3, price: 1950 }, { name: 'Palazzo Set', qty: 1, price: 1100 }], total: 3050, payment: 'UPI', status: 'PENDING', address: '15 Lajpat Nagar, Delhi 110024' },
  { id: 'ORD-2844', customer: 'Deepika Tiwari', customerId: 'C008', date: '2026-08-01', items: [{ name: 'Anarkali Kurta Set', qty: 2, price: 4400 }], total: 4400, payment: 'CARD', status: 'DELIVERED', address: '88 Civil Lines, Kanpur, UP 208001' },
  { id: 'ORD-2843', customer: 'Nandini Patel', customerId: 'C010', date: '2026-07-31', items: [{ name: "Men's Pathani Suit", qty: 1, price: 1800 }, { name: 'Mojari Shoes', qty: 1, price: 750 }], total: 2550, payment: 'UPI', status: 'DELIVERED', address: '3 Ring Road, Surat, GJ 395001' },
  { id: 'ORD-2842', customer: 'Anita Joshi', customerId: 'C006', date: '2026-07-31', items: [{ name: 'Salwar Suit', qty: 2, price: 2700 }], total: 2700, payment: 'CASH', status: 'PENDING', address: '22 FC Road, Pune, MH 411004' },
  { id: 'ORD-2841', customer: 'Rekha Mehta', customerId: 'C005', date: '2026-07-30', items: [{ name: 'Kurtis Pack', qty: 1, price: 1200 }, { name: 'Ethnic Bag', qty: 1, price: 850 }], total: 2050, payment: 'UPI', status: 'CANCELLED', address: '56 Andheri West, Mumbai, MH 400053' },
  { id: 'ORD-2840', customer: 'Sunita Devi', customerId: 'C003', date: '2026-07-30', items: [{ name: 'Sherwani', qty: 1, price: 6500 }], total: 6500, payment: 'CARD', status: 'CONFIRMED', address: '9 Hazratganj, Lucknow, UP 226001' },
  { id: 'ORD-2839', customer: 'Pooja Yadav', customerId: 'C007', date: '2026-07-29', items: [{ name: 'Banarasi Silk Saree', qty: 2, price: 9000 }], total: 9000, payment: 'UPI', status: 'DELIVERED', address: '17 Tajganj, Agra, UP 282001' },
  { id: 'ORD-2838', customer: 'Shreya Gupta', customerId: 'C009', date: '2026-07-29', items: [{ name: 'Cotton Kurti', qty: 2, price: 1300 }, { name: 'Dupatta Set', qty: 1, price: 450 }], total: 1750, payment: 'CASH', status: 'CONFIRMED', address: '4 MP Nagar, Bhopal, MP 462011' },
  { id: 'ORD-2837', customer: 'Kavita Singh', customerId: 'C004', date: '2026-07-28', items: [{ name: 'Palazzo Set', qty: 2, price: 2200 }, { name: 'Ethnic Bag', qty: 1, price: 850 }], total: 3050, payment: 'UPI', status: 'DELIVERED', address: '42 Shiva Nagar, Varanasi, UP 221001' },
  { id: 'ORD-2836', customer: 'Meena Agarwal', customerId: 'C002', date: '2026-07-28', items: [{ name: 'Anarkali Kurta Set', qty: 1, price: 2200 }], total: 2200, payment: 'UPI', status: 'PENDING', address: '7 Pink City Road, Jaipur, RJ 302001' },
  { id: 'ORD-2835', customer: 'Deepika Tiwari', customerId: 'C008', date: '2026-07-27', items: [{ name: 'Lehenga Choli', qty: 1, price: 8500 }, { name: 'Mojari Shoes', qty: 2, price: 1500 }], total: 10000, payment: 'CARD', status: 'DELIVERED', address: '88 Civil Lines, Kanpur, UP 208001' },
  { id: 'ORD-2834', customer: 'Nandini Patel', customerId: 'C010', date: '2026-07-27', items: [{ name: 'Kurtis Pack', qty: 2, price: 2400 }], total: 2400, payment: 'CASH', status: 'CONFIRMED', address: '3 Ring Road, Surat, GJ 395001' },
  { id: 'ORD-2833', customer: 'Priya Sharma', customerId: 'C001', date: '2026-07-26', items: [{ name: 'Dupatta Set', qty: 3, price: 1350 }, { name: 'Cotton Kurti', qty: 1, price: 650 }], total: 2000, payment: 'UPI', status: 'CANCELLED', address: '15 Lajpat Nagar, Delhi 110024' },
];

const STAFF = [
  { id: 'S001', name: 'Priya Sharma', role: 'OWNER', designation: 'Store Owner', joined: '2021-04-01', status: 'PRESENT', initials: 'PS', color: 'bg-purple-600' },
  { id: 'S002', name: 'Rahul Kumar', role: 'MANAGER', designation: 'Store Manager', joined: '2022-01-15', status: 'PRESENT', initials: 'RK', color: 'bg-blue-600' },
  { id: 'S003', name: 'Sunita Devi', role: 'CASHIER', designation: 'Senior Cashier', joined: '2022-08-10', status: 'PRESENT', initials: 'SD', color: 'bg-green-600' },
  { id: 'S004', name: 'Ramesh Yadav', role: 'WAREHOUSE', designation: 'Stock Handler', joined: '2023-03-05', status: 'ABSENT', initials: 'RY', color: 'bg-orange-600' },
];

function generateRevenueData(days: number) {
  const data = [];
  const base = 8000;
  const now = new Date('2026-08-02');
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dow = d.getDay();
    const weekend = dow === 0 || dow === 6 ? 1.4 : 1;
    const trend = 1 + (days - i) / days * 0.3;
    const noise = 0.7 + Math.random() * 0.6;
    data.push({
      date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      revenue: Math.round(base * weekend * trend * noise / 100) * 100,
    });
  }
  return data;
}

const TOP_PRODUCTS = [
  { name: 'Lehenga Choli', revenue: 42500 },
  { name: 'Banarasi Silk Saree', revenue: 36000 },
  { name: 'Sherwani', revenue: 26000 },
  { name: 'Anarkali Kurta Set', revenue: 19800 },
  { name: 'Palazzo Set', revenue: 12100 },
];

const ORDER_SOURCES = [
  { name: 'POS', value: 65, color: '#7c3aed' },
  { name: 'WhatsApp', value: 20, color: '#059669' },
  { name: 'Online', value: 12, color: '#2563eb' },
  { name: 'Phone', value: 3, color: '#d97706' },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function inr(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}
function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DELIVERED: 'bg-green-900 text-green-300 border border-green-700',
    CONFIRMED: 'bg-blue-900 text-blue-300 border border-blue-700',
    PENDING: 'bg-yellow-900 text-yellow-300 border border-yellow-700',
    CANCELLED: 'bg-red-900 text-red-300 border border-red-700',
    LOW_STOCK: 'bg-red-900 text-red-300 border border-red-700',
    OK: 'bg-green-900 text-green-300 border border-green-700',
    PRESENT: 'bg-green-900 text-green-300 border border-green-700',
    ABSENT: 'bg-red-900 text-red-300 border border-red-700',
    OWNER: 'bg-purple-900 text-purple-300 border border-purple-700',
    MANAGER: 'bg-blue-900 text-blue-300 border border-blue-700',
    CASHIER: 'bg-emerald-900 text-emerald-300 border border-emerald-700',
    WAREHOUSE: 'bg-orange-900 text-orange-300 border border-orange-700',
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[status] || 'bg-gray-700 text-gray-300'}`}>
      {status}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INSTALL MODAL
// ─────────────────────────────────────────────────────────────────────────────

function InstallModal({ onClose, nativePrompt }: { onClose: () => void; nativePrompt: any }) {
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) setPlatform('ios');
    else if (/android/.test(ua)) setPlatform('android');
  }, []);

  async function handleNativeInstall() {
    if (!nativePrompt) return;
    nativePrompt.prompt();
    await nativePrompt.userChoice;
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70">
      <div className="w-full max-w-sm bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-purple-600 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">Storiq</div>
              <div className="text-purple-200 text-xs">Add to Home Screen</div>
            </div>
          </div>
          <button onClick={onClose} className="text-purple-200 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Native prompt (Android Chrome) */}
          {nativePrompt && (
            <button
              onClick={handleNativeInstall}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              <Download className="w-5 h-5" />
              Install App
            </button>
          )}

          {/* iOS instructions */}
          {platform === 'ios' && !nativePrompt && (
            <div className="space-y-3">
              <p className="text-gray-300 text-sm text-center">Follow these steps on your iPhone / iPad:</p>
              {[
                { step: 1, icon: Share, label: 'Tap the Share button', sub: 'Bottom centre of Safari browser' },
                { step: 2, icon: Plus, label: 'Tap "Add to Home Screen"', sub: 'Scroll down in the share sheet' },
                { step: 3, icon: CheckCircle2, label: 'Tap "Add"', sub: 'The app icon will appear on your home screen' },
              ].map(s => (
                <div key={s.step} className="flex items-start gap-3 bg-gray-800 rounded-xl p-3">
                  <div className="w-7 h-7 bg-purple-600/30 border border-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-purple-300 text-xs font-bold">
                    {s.step}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <s.icon className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-100 text-sm font-medium">{s.label}</span>
                    </div>
                    <div className="text-gray-500 text-xs mt-0.5">{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Android without native prompt (non-Chrome) */}
          {platform === 'android' && !nativePrompt && (
            <div className="space-y-3">
              <p className="text-gray-300 text-sm text-center">Add to your Android home screen:</p>
              {[
                { step: 1, label: 'Tap the menu (⋮) in your browser', sub: 'Top-right corner of Chrome / browser' },
                { step: 2, label: 'Tap "Add to Home Screen"', sub: 'Or "Install App" if available' },
                { step: 3, label: 'Tap "Add" to confirm', sub: 'The app icon will appear on your home screen' },
              ].map(s => (
                <div key={s.step} className="flex items-start gap-3 bg-gray-800 rounded-xl p-3">
                  <div className="w-7 h-7 bg-purple-600/30 border border-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-purple-300 text-xs font-bold">
                    {s.step}
                  </div>
                  <div>
                    <div className="text-gray-100 text-sm font-medium">{s.label}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Generic (desktop) */}
          {platform === 'other' && !nativePrompt && (
            <div className="text-center space-y-3">
              <Smartphone className="w-10 h-10 text-purple-400 mx-auto" />
              <p className="text-gray-300 text-sm">Open this page on your mobile browser to add it to your home screen.</p>
              <div className="bg-gray-800 rounded-xl p-3 text-left">
                <div className="text-gray-400 text-xs font-medium mb-1">On Chrome (Android / Desktop):</div>
                <div className="text-gray-300 text-xs">Menu → Install App / Add to Home Screen</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-3 text-left">
                <div className="text-gray-400 text-xs font-medium mb-1">On Safari (iPhone / iPad):</div>
                <div className="text-gray-300 text-xs">Tap Share → Add to Home Screen</div>
              </div>
            </div>
          )}

          <a
            href="/signup"
            className="block w-full text-center bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-200 text-sm py-2.5 rounded-xl transition-colors"
          >
            Or sign up to connect your real store →
          </a>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEWS
// ─────────────────────────────────────────────────────────────────────────────

function DashboardView() {
  const lowStock = PRODUCTS.filter(p => p.qty <= p.reorder);
  const recentOrders = ORDERS.slice(0, 5);

  return (
    <div className="space-y-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Monthly Revenue', value: '₹2,84,500', delta: '+12%', up: true, icon: TrendingUp, color: 'text-purple-400' },
          { label: 'Total Orders', value: '847', delta: '+8%', up: true, icon: ShoppingCart, color: 'text-blue-400' },
          { label: 'Customers', value: '234', delta: '+15%', up: true, icon: Users, color: 'text-emerald-400' },
          { label: 'Low Stock', value: `${lowStock.length}`, delta: 'Needs attention', up: false, icon: AlertTriangle, color: 'text-amber-400', warn: true },
        ].map(card => (
          <div key={card.label} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-xs leading-tight">{card.label}</span>
              <card.icon className={`w-4 h-4 ${card.color} flex-shrink-0`} />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white mb-1">{card.value}</div>
            <div className={`text-xs flex items-center gap-1 ${card.warn ? 'text-amber-400' : card.up ? 'text-emerald-400' : 'text-red-400'}`}>
              {!card.warn && (card.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />)}
              {card.warn && <AlertTriangle className="w-3 h-3" />}
              <span className="truncate">{card.delta}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-gray-800 rounded-xl border border-gray-700">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm">Recent Orders</h3>
            <span className="text-xs text-purple-400 cursor-pointer hover:underline">View all →</span>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-gray-700">
            {recentOrders.map(o => (
              <div key={o.id} className="px-4 py-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-mono text-purple-400 text-xs">{o.id}</div>
                    <div className="text-gray-200 text-sm font-medium mt-0.5">{o.customer}</div>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-gray-500 text-xs">{o.items.reduce((a, i) => a + i.qty, 0)} items · {o.payment}</span>
                  <span className="text-white font-semibold text-sm">{inr(o.total)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs border-b border-gray-700">
                  {['Order #', 'Customer', 'Items', 'Total', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-purple-400 text-xs">{o.id}</td>
                    <td className="px-4 py-3 text-gray-200">{o.customer}</td>
                    <td className="px-4 py-3 text-gray-400 text-center">{o.items.reduce((a, i) => a + i.qty, 0)}</td>
                    <td className="px-4 py-3 text-white font-medium">{inr(o.total)}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-xl border border-amber-700/40">
            <div className="p-4 border-b border-gray-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="font-semibold text-white text-sm">Low Stock Alerts</h3>
            </div>
            <div className="p-4 space-y-3">
              {lowStock.map(p => (
                <div key={p.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-gray-200 text-sm font-medium">{p.name}</div>
                    <div className="text-gray-400 text-xs">Reorder at {p.reorder} units</div>
                  </div>
                  <div className="text-right">
                    <div className="text-red-400 font-bold">{p.qty}</div>
                    <div className="text-gray-500 text-xs">in stock</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
            <h3 className="font-semibold text-white text-sm mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'New Order', icon: Plus, color: 'bg-purple-600 hover:bg-purple-700' },
                { label: 'Add Product', icon: Package, color: 'bg-blue-600 hover:bg-blue-700' },
                { label: 'Add Customer', icon: UserCheck, color: 'bg-emerald-600 hover:bg-emerald-700' },
              ].map(a => (
                <button key={a.label} className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${a.color}`}>
                  <a.icon className="w-4 h-4" />
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InventoryView() {
  const [search, setSearch] = useState('');
  const [lowOnly, setLowOnly] = useState(false);
  const [adjusting, setAdjusting] = useState<string | null>(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [stockData, setStockData] = useState(PRODUCTS.map(p => ({ ...p })));

  const filtered = stockData.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (lowOnly ? p.qty <= p.reorder : true);
  });

  function applyAdjust(id: string) {
    const delta = parseInt(adjustQty);
    if (isNaN(delta)) return;
    setStockData(prev => prev.map(p => p.id === id ? { ...p, qty: Math.max(0, p.qty + delta) } : p));
    setAdjusting(null);
    setAdjustQty('');
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products or SKU…"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>
        <button
          onClick={() => setLowOnly(!lowOnly)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${lowOnly ? 'bg-red-900/40 border-red-600 text-red-300' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'}`}
        >
          <AlertTriangle className="w-4 h-4" />
          Low Stock Only
        </button>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {filtered.map(p => {
          const isLow = p.qty <= p.reorder;
          return (
            <div key={p.id} className={`bg-gray-800 border rounded-xl p-4 ${isLow ? 'border-red-700/50' : 'border-gray-700'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 pr-2">
                  <div className="text-gray-100 font-medium text-sm">{p.name}</div>
                  <div className="text-gray-400 text-xs mt-0.5">{p.sku} · {p.category}</div>
                </div>
                <StatusBadge status={isLow ? 'LOW_STOCK' : 'OK'} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-2xl font-bold ${isLow ? 'text-red-400' : 'text-white'}`}>{p.qty}</div>
                  <div className="text-gray-500 text-xs">in stock (reorder at {p.reorder})</div>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">{inr(p.price)}</div>
                  <button
                    onClick={() => { setAdjusting(adjusting === p.id ? null : p.id); setAdjustQty(''); }}
                    className="mt-1 flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 border border-purple-800 hover:border-purple-600 rounded px-2 py-1 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" /> Adjust
                  </button>
                </div>
              </div>
              {adjusting === p.id && (
                <div className="mt-3 flex items-center gap-2 pt-3 border-t border-gray-700">
                  <input
                    type="number"
                    value={adjustQty}
                    onChange={e => setAdjustQty(e.target.value)}
                    placeholder="e.g. +5 or -2"
                    className="flex-1 bg-gray-900 border border-gray-600 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                  <button onClick={() => applyAdjust(p.id)} className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-1.5 rounded transition-colors">Apply</button>
                  <button onClick={() => setAdjusting(null)} className="text-gray-400 text-sm px-2 py-1.5">✕</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs border-b border-gray-700 bg-gray-800/80">
                {['Product', 'SKU', 'Category', 'Qty', 'Reorder Pt', 'Price', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const isLow = p.qty <= p.reorder;
                return (
                  <React.Fragment key={p.id}>
                    <tr className={`border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors ${isLow ? 'bg-red-950/20' : ''}`}>
                      <td className="px-4 py-3 text-gray-100 font-medium">{p.name}</td>
                      <td className="px-4 py-3 font-mono text-gray-400 text-xs">{p.sku}</td>
                      <td className="px-4 py-3 text-gray-300">{p.category}</td>
                      <td className={`px-4 py-3 font-bold ${isLow ? 'text-red-400' : 'text-white'}`}>{p.qty}</td>
                      <td className="px-4 py-3 text-gray-400">{p.reorder}</td>
                      <td className="px-4 py-3 text-white">{inr(p.price)}</td>
                      <td className="px-4 py-3"><StatusBadge status={isLow ? 'LOW_STOCK' : 'OK'} /></td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => { setAdjusting(adjusting === p.id ? null : p.id); setAdjustQty(''); }}
                          className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 border border-purple-800 hover:border-purple-600 rounded px-2 py-1 transition-colors"
                        >
                          <Edit2 className="w-3 h-3" /> Adjust
                        </button>
                      </td>
                    </tr>
                    {adjusting === p.id && (
                      <tr key={`${p.id}-adj`} className="bg-purple-950/30 border-b border-purple-800/30">
                        <td colSpan={8} className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="text-gray-400 text-sm">Adjust qty (+ or -):</span>
                            <input
                              type="number"
                              value={adjustQty}
                              onChange={e => setAdjustQty(e.target.value)}
                              placeholder="e.g. +5 or -2"
                              className="bg-gray-900 border border-gray-600 rounded px-3 py-1 text-sm text-white w-32 focus:outline-none focus:border-purple-500"
                            />
                            <button onClick={() => applyAdjust(p.id)} className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-1 rounded transition-colors">Apply</button>
                            <button onClick={() => setAdjusting(null)} className="text-gray-400 hover:text-gray-200 text-sm px-2 py-1">Cancel</button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OrdersView() {
  const [tab, setTab] = useState('ALL');
  const [expanded, setExpanded] = useState<string | null>(null);

  const tabs = [
    { key: 'ALL', label: 'All', count: 47 },
    { key: 'PENDING', label: 'Pending', count: 8 },
    { key: 'CONFIRMED', label: 'Confirmed', count: 12 },
    { key: 'DELIVERED', label: 'Delivered', count: 24 },
    { key: 'CANCELLED', label: 'Cancelled', count: 3 },
  ];

  const filtered = tab === 'ALL' ? ORDERS : ORDERS.filter(o => o.status === tab);

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-800 p-1 rounded-xl border border-gray-700 overflow-x-auto no-scrollbar">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${tab === t.key ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
          >
            {t.label}
            <span className={`text-xs rounded-full px-1.5 py-0.5 ${tab === t.key ? 'bg-purple-500' : 'bg-gray-700'}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {filtered.map(o => (
          <div key={o.id} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
            <button
              className="w-full text-left px-4 py-3"
              onClick={() => setExpanded(expanded === o.id ? null : o.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="font-mono text-purple-400 text-xs">{o.id}</span>
                <StatusBadge status={o.status} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-200 font-medium text-sm">{o.customer}</div>
                  <div className="text-gray-500 text-xs mt-0.5">
                    {new Date(o.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {o.items.reduce((a, i) => a + i.qty, 0)} items · {o.payment}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">{inr(o.total)}</span>
                  {expanded === o.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
            </button>
            {expanded === o.id && (
              <div className="border-t border-gray-700 px-4 py-3 bg-gray-750 space-y-3">
                <div>
                  <div className="text-xs text-gray-400 font-medium mb-1.5 uppercase tracking-wider">Items Ordered</div>
                  {o.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm py-1">
                      <span className="text-gray-300">{item.name} × {item.qty}</span>
                      <span className="text-white">{inr(item.price)}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wider">Delivery Address</div>
                  <div className="flex gap-1.5 text-xs text-gray-300"><MapPin className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" />{o.address}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs border-b border-gray-700">
                {['Order #', 'Customer', 'Date', 'Items', 'Total', 'Payment', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <React.Fragment key={o.id}>
                  <tr
                    className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors cursor-pointer"
                    onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                  >
                    <td className="px-4 py-3 font-mono text-purple-400 text-xs">{o.id}</td>
                    <td className="px-4 py-3 text-gray-200">{o.customer}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{new Date(o.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                    <td className="px-4 py-3 text-center text-gray-400">{o.items.reduce((a, i) => a + i.qty, 0)}</td>
                    <td className="px-4 py-3 text-white font-medium">{inr(o.total)}</td>
                    <td className="px-4 py-3"><span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">{o.payment}</span></td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 text-gray-500">
                      {expanded === o.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </td>
                  </tr>
                  {expanded === o.id && (
                    <tr key={`${o.id}-exp`} className="bg-gray-800/60 border-b border-gray-700">
                      <td colSpan={8} className="px-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wider">Items Ordered</div>
                            {o.items.map((item, i) => (
                              <div key={i} className="flex justify-between text-sm py-1 border-b border-gray-700/30 last:border-0">
                                <span className="text-gray-300">{item.name} × {item.qty}</span>
                                <span className="text-white">{inr(item.price)}</span>
                              </div>
                            ))}
                          </div>
                          <div>
                            <div className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wider">Delivery Address</div>
                            <div className="flex gap-2 text-sm text-gray-300"><MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" /><span>{o.address}</span></div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wider">Order Timeline</div>
                            <div className="space-y-2">
                              {[
                                { label: 'Order Placed', done: true },
                                { label: 'Confirmed', done: o.status !== 'PENDING' },
                                { label: 'Out for Delivery', done: o.status === 'DELIVERED' },
                                { label: 'Delivered', done: o.status === 'DELIVERED' },
                              ].map((step, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                  {step.done ? <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" /> : <div className="w-4 h-4 rounded-full border border-gray-600 flex-shrink-0" />}
                                  <span className={step.done ? 'text-gray-200' : 'text-gray-500'}>{step.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CustomersView() {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<typeof CUSTOMERS[0] | null>(null);

  const filtered = CUSTOMERS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );
  const customerOrders = selectedCustomer ? ORDERS.filter(o => o.customerId === selectedCustomer.id) : [];

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or phone…"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
          <div
            key={c.id}
            onClick={() => setSelectedCustomer(c)}
            className="bg-gray-800 border border-gray-700 hover:border-purple-600 rounded-xl p-4 cursor-pointer transition-colors group"
          >
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                {initials(c.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold truncate group-hover:text-purple-300 transition-colors">{c.name}</div>
                <div className="text-gray-400 text-xs">{c.city}</div>
                <div className="flex items-center gap-1 text-gray-500 text-xs mt-1"><Phone className="w-3 h-3" /> {c.phone}</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-white font-semibold text-xs sm:text-sm">{inr(c.spent)}</div>
                <div className="text-gray-500 text-xs">Spent</div>
              </div>
              <div>
                <div className="text-white font-semibold text-sm">{c.orders}</div>
                <div className="text-gray-500 text-xs">Orders</div>
              </div>
              <div>
                <div className="text-amber-400 font-semibold text-sm">{c.loyalty.toLocaleString('en-IN')}</div>
                <div className="text-gray-500 text-xs">Points</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Slide-out panel */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setSelectedCustomer(null)} />
          <div className="w-full max-w-sm sm:max-w-md bg-gray-900 border-l border-gray-700 overflow-y-auto">
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-white">Customer Profile</h3>
                <button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {initials(selectedCustomer.name)}
                </div>
                <div>
                  <div className="text-white text-lg font-bold">{selectedCustomer.name}</div>
                  <div className="text-gray-400 text-sm">{selectedCustomer.city} · Since {new Date(selectedCustomer.joined).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: 'Total Spent', value: inr(selectedCustomer.spent) },
                  { label: 'Orders', value: selectedCustomer.orders },
                  { label: 'Loyalty Points', value: selectedCustomer.loyalty.toLocaleString('en-IN') },
                  { label: 'Avg Order', value: inr(Math.round(selectedCustomer.spent / selectedCustomer.orders)) },
                ].map(s => (
                  <div key={s.label} className="bg-gray-800 rounded-lg p-3">
                    <div className="text-gray-400 text-xs mb-1">{s.label}</div>
                    <div className="text-white font-semibold">{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2 mb-5">
                <div className="flex items-center gap-2 text-sm text-gray-300"><Phone className="w-4 h-4 text-gray-500" />{selectedCustomer.phone}</div>
                <div className="flex items-center gap-2 text-sm text-gray-300"><Mail className="w-4 h-4 text-gray-500" />{selectedCustomer.email}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-400 mb-3">Recent Orders</div>
                {customerOrders.length === 0 ? (
                  <div className="text-gray-500 text-sm">No orders in sample data</div>
                ) : customerOrders.map(o => (
                  <div key={o.id} className="bg-gray-800 rounded-lg p-3 mb-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-purple-400 text-xs">{o.id}</span>
                      <StatusBadge status={o.status} />
                    </div>
                    <div className="text-white font-medium mt-1">{inr(o.total)}</div>
                    <div className="text-gray-400 text-xs">{o.items.map(i => i.name).join(', ')}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StaffView() {
  const present = STAFF.filter(s => s.status === 'PRESENT').length;
  const absent = STAFF.filter(s => s.status === 'ABSENT').length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAFF.map(s => (
          <div key={s.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-12 h-12 rounded-full ${s.color} flex items-center justify-center text-white font-bold text-lg`}>{s.initials}</div>
              <StatusBadge status={s.status} />
            </div>
            <div className="text-white font-semibold">{s.name}</div>
            <div className="text-gray-400 text-sm mt-0.5">{s.designation}</div>
            <div className="mt-2.5"><StatusBadge status={s.role} /></div>
            <div className="mt-2.5 flex items-center gap-1 text-gray-500 text-xs">
              <Calendar className="w-3 h-3" /> Joined {new Date(s.joined).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
        <h3 className="font-semibold text-white mb-4">Today's Attendance</h3>
        <div className="flex flex-wrap gap-5">
          {[
            { icon: CheckCircle2, count: present, label: 'Present', bg: 'bg-green-900/40 border-green-700', iconC: 'text-green-400' },
            { icon: XCircle, count: absent, label: 'Absent', bg: 'bg-red-900/40 border-red-700', iconC: 'text-red-400' },
            { icon: Users, count: STAFF.length, label: 'Total Staff', bg: 'bg-blue-900/40 border-blue-700', iconC: 'text-blue-400' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3">
              <div className={`w-10 h-10 ${s.bg} border rounded-lg flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.iconC}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{s.count}</div>
                <div className="text-gray-400 text-sm">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalyticsView() {
  const [days, setDays] = useState(30);
  const revenueData = generateRevenueData(days);
  const totalRev = revenueData.reduce((a, d) => a + d.revenue, 0);
  const totalOrders = Math.round(days * 1.4);
  const avgOrder = Math.round(totalRev / totalOrders);

  const kpis = [
    { label: 'Revenue', value: inr(totalRev), delta: '+12%', up: true },
    { label: 'Orders', value: totalOrders, delta: '+8%', up: true },
    { label: 'Avg Order Value', value: inr(avgOrder), delta: '+4%', up: true },
    { label: 'Retention', value: '68%', delta: '+3%', up: true },
  ];

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {[7, 30, 90].map(d => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${days === d ? 'bg-purple-600 text-white' : 'bg-gray-800 border border-gray-700 text-gray-400 hover:text-gray-200'}`}
          >
            {d}d
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="text-gray-400 text-xs mb-2">{k.label}</div>
            <div className="text-xl sm:text-2xl font-bold text-white">{k.value}</div>
            <div className={`text-xs mt-1 flex items-center gap-1 ${k.up ? 'text-emerald-400' : 'text-red-400'}`}>
              {k.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {k.delta}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
        <h3 className="font-semibold text-white mb-4 text-sm">Daily Revenue</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={revenueData} margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} interval={Math.floor(days / 6)} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} width={40} />
            <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#f9fafb', fontSize: 12 }} formatter={(v: number) => [inr(v), 'Revenue']} />
            <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2} fill="url(#revGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
          <h3 className="font-semibold text-white mb-4 text-sm">Top Products</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={TOP_PRODUCTS} layout="vertical" margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#d1d5db', fontSize: 10 }} tickLine={false} axisLine={false} width={110} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#f9fafb', fontSize: 12 }} formatter={(v: number) => [inr(v), 'Revenue']} />
              <Bar dataKey="revenue" fill="#7c3aed" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
          <h3 className="font-semibold text-white mb-4 text-sm">Orders by Source</h3>
          <div className="flex items-center gap-3">
            <ResponsiveContainer width="55%" height={180}>
              <PieChart>
                <Pie data={ORDER_SOURCES} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3}>
                  {ORDER_SOURCES.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#f9fafb', fontSize: 12 }} formatter={(v: number) => [`${v}%`, 'Share']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2.5">
              {ORDER_SOURCES.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: s.color }} />
                  <span className="text-gray-300 text-sm">{s.name}</span>
                  <span className="text-white font-semibold text-sm ml-auto pl-2">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

type View = 'Dashboard' | 'Inventory' | 'Orders' | 'Customers' | 'Staff' | 'Analytics';

const NAV_ITEMS: { view: View; icon: React.ElementType }[] = [
  { view: 'Dashboard', icon: LayoutDashboard },
  { view: 'Inventory', icon: Package },
  { view: 'Orders', icon: ShoppingCart },
  { view: 'Customers', icon: Users },
  { view: 'Staff', icon: UserCheck },
  { view: 'Analytics', icon: BarChart2 },
];

export default function DemoPage() {
  const [activeView, setActiveView] = useState<View>('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    // Listen for native install prompt (Android Chrome)
    const handler = (e: any) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);

    // Detect if already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const ViewComponent = {
    Dashboard: DashboardView,
    Inventory: InventoryView,
    Orders: OrdersView,
    Customers: CustomersView,
    Staff: StaffView,
    Analytics: AnalyticsView,
  }[activeView];

  function selectView(v: View) {
    setActiveView(v);
    setSidebarOpen(false);
  }

  return (
    <div className="flex h-[100dvh] bg-gray-900 text-white overflow-hidden" data-theme={isDark ? 'dark' : 'light'}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar (desktop always visible, mobile slide-in) */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gray-950 border-r border-gray-800 flex flex-col transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-sm leading-tight">Storiq</div>
              <div className="text-gray-400 text-xs">Platform</div>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">CB</div>
            <div className="min-w-0">
              <div className="text-gray-200 text-sm font-medium truncate">Priya Boutique</div>
              <div className="text-gray-500 text-xs">Demo Store</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ view, icon: Icon }) => (
            <button
              key={view}
              onClick={() => selectView(view)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeView === view ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {view}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800 space-y-2">
          {!isInstalled && (
            <button
              onClick={() => { setSidebarOpen(false); setShowInstall(true); }}
              className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white text-sm py-2 rounded-lg transition-colors"
            >
              <Smartphone className="w-4 h-4" />
              Add to Home Screen
            </button>
          )}
          <div className="bg-amber-950/60 border border-amber-700/50 rounded-lg px-3 py-1.5 text-center">
            <span className="text-amber-400 text-xs font-semibold">⚡ Demo Mode</span>
          </div>
          <a href="/signup" className="w-full flex items-center justify-center gap-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 rounded-lg transition-colors">
            Sign up free <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Demo banner */}
        {!bannerDismissed && (
          <div className="bg-purple-900/60 border-b border-purple-700/50 px-4 py-2 flex items-center justify-between flex-shrink-0">
            <span className="text-purple-200 text-xs sm:text-sm">
              🎯 <strong>Demo Mode</strong> — Sign up free to connect your real store
              <a href="/signup" className="ml-2 text-purple-300 underline hover:text-white text-xs">Get started →</a>
            </span>
            <button onClick={() => setBannerDismissed(true)} className="text-purple-400 hover:text-white transition-colors ml-3 flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top bar */}
        <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white transition-colors p-1">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-semibold text-white text-sm sm:text-base">{activeView}</h1>
              <p className="text-gray-500 text-xs hidden sm:block">Priya Boutique · Demo Store</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInstall(true)}
              className="hidden sm:flex lg:hidden items-center gap-1.5 text-xs bg-gray-800 border border-gray-700 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5" />
              Install
            </button>
            {/* Theme toggle */}
            <button
              onClick={() => setIsDark(d => !d)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white transition-colors"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button className="text-gray-400 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">CB</div>
          </div>
        </header>

        {/* Content — pb-16 on mobile to clear bottom nav */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 pb-20 lg:pb-6">
          <ViewComponent />
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 inset-x-0 z-30 bg-gray-950 border-t border-gray-800 flex lg:hidden safe-bottom">
          {NAV_ITEMS.map(({ view, icon: Icon }) => (
            <button
              key={view}
              onClick={() => selectView(view)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors ${activeView === view ? 'text-purple-400' : 'text-gray-600 hover:text-gray-400'}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] leading-tight">{view}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Install modal */}
      {showInstall && (
        <InstallModal onClose={() => setShowInstall(false)} nativePrompt={installPrompt} />
      )}
    </div>
  );
}
