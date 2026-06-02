'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  Users,
  TrendingUp,
  Zap,
  AlertCircle,
  Plus,
  Save,
  X,
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatBox from '../components/ui/StatBox';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';

type AnalyticsData = {
  totalCustomers: number;
  totalRevenue: number;
  pendingRevenue: number;
  invoiceCounts: Record<string, number>;
  rateplanPopularity: Record<string, number>;
  usageDistribution: Record<string, number>;
};

type Customer = {
  name: string;
  email: string;
  address: string;
  created_at: string;
};

type Rateplan = {
  rateplan_id: number;
  name: string;
  ror: number;
  plan_price: number;
  free_units: number;
};

type Contract = {
  msisdn: string;
  credit_limit: number;
  balance: number;
  rateplan_id: number;
  rateplan_name: string;
  created_at: string;
};

type Service = {
  id: number;
  name: string;
  price: number;
  type: string;
  units: number;
};

type Fee = {
  id: number;
  name: string;
  description: string;
  amount: number;
  type: string;
};

type Session = {
  username: string;
  role: string;
};

const tabs = ['overview', 'customers', 'profiles', 'contracts', 'analytics'] as const;
type Tab = (typeof tabs)[number];

const tabNames: Record<Tab, string> = {
  overview: 'Dashboard Overview',
  customers: 'Customer Management',
  profiles: 'Rate Plans & Services',
  contracts: 'Contract Management',
  analytics: 'Analytics & Reports',
};

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rateplans, setRateplans] = useState<Rateplan[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', address: '' });
  const [rateplanForm, setRateplanForm] = useState({ name: '', ror: '', plan_price: '', free_units: '' });
  const [contractEmail, setContractEmail] = useState('');
  const [newContract, setNewContract] = useState({ email: '', msisdn: '', rateplan_id: '', credit_limit: '' });
  const [newService, setNewService] = useState({ service_type: '1', description: '', rating_price: '', units: '', zone_id: '' });
  const [newFee, setNewFee] = useState({ type: 'recurring', name: '', description: '', amount: '' });
  const [services, setServices] = useState<Service[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [rateplanServices, setRateplanServices] = useState<Service[]>([]);
  const [selectedRateplanId, setSelectedRateplanId] = useState('');
  const [linkServiceForm, setLinkServiceForm] = useState({ rateplan_id: '', service_id: '' });
  const [assignFeeForm, setAssignFeeForm] = useState({ msisdn: '', feeId: '', feeType: 'RECURRING' });
  const [contractLoading, setContractLoading] = useState(false);
  const [editCustomerEmail, setEditCustomerEmail] = useState<string | null>(null);
  const [editedAddress, setEditedAddress] = useState('');

  useEffect(() => {
    init();
  }, [router]);

  useEffect(() => {
    if (activeTab === 'customers') {
      loadCustomers();
    }
    if (activeTab === 'profiles') {
      loadRateplans();
      loadServices();
      loadFees();
    }
    if (activeTab === 'contracts' && contractEmail) {
      loadContracts(contractEmail);
    }
    if (activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [activeTab, contractEmail]);

  async function init() {
    try {
      const session = await fetchSession();
      if (!session || session.role?.toLowerCase() !== 'admin') {
        router.push('/login');
        return;
      }
      setUser(session);
      await Promise.all([loadAnalytics(), loadCustomers(), loadRateplans()]);
    } catch (err) {
      setError('Unable to initialize admin panel. Please log in again.');
      router.push('/login');
    }
  }

  async function fetchSession() {
    const res = await fetch('/api/auth');
    if (!res.ok) return null;
    return (await res.json()) as Session;
  }

  async function loadAnalytics() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/analytics');
      if (!res.ok) throw new Error('Unable to load analytics');
      setAnalytics(await res.json());
    } catch (err: any) {
      setError(err.message || 'Analytics fetch failed');
    } finally {
      setLoading(false);
    }
  }

  async function loadCustomers() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/customer');
      if (!res.ok) throw new Error('Unable to load customers');
      setCustomers(await res.json());
    } catch (err: any) {
      setError(err.message || 'Customer fetch failed');
    } finally {
      setLoading(false);
    }
  }

  async function loadContracts(email: string) {
    setContractLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/contract?email=${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error('Unable to load contracts');
      setContracts(await res.json());
    } catch (err: any) {
      setError(err.message || 'Contract fetch failed');
    } finally {
      setContractLoading(false);
    }
  }

  async function loadRateplans() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/profiles/rateplans');
      if (!res.ok) throw new Error('Unable to load rateplans');
      setRateplans(await res.json());
    } catch (err: any) {
      setError(err.message || 'Rateplan fetch failed');
    } finally {
      setLoading(false);
    }
  }

  async function loadServices() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/profiles/services');
      if (!res.ok) throw new Error('Unable to load services');
      setServices(await res.json());
    } catch (err: any) {
      setError(err.message || 'Service fetch failed');
    } finally {
      setLoading(false);
    }
  }

  async function loadFees() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/profiles/fees');
      if (!res.ok) throw new Error('Unable to load fees');
      setFees(await res.json());
    } catch (err: any) {
      setError(err.message || 'Fee fetch failed');
    } finally {
      setLoading(false);
    }
  }

  async function loadRateplanServices(rateplanId: string) {
    if (!rateplanId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/profiles/rateplan-services?rateplan_id=${encodeURIComponent(rateplanId)}`);
      if (!res.ok) throw new Error('Unable to load rateplan services');
      setRateplanServices(await res.json());
    } catch (err: any) {
      setError(err.message || 'Rateplan services fetch failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddServicePackage() {
    if (!newService.description || !newService.rating_price || !newService.units || !newService.zone_id) {
      setError('All service package fields are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/profiles/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_type: Number(newService.service_type),
          description: newService.description,
          rating_price: Number(newService.rating_price),
          units: Number(newService.units),
          zone_id: Number(newService.zone_id),
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to save service package');
      }
      setNewService({ service_type: '1', description: '', rating_price: '', units: '', zone_id: '' });
      await loadServices();
    } catch (err: any) {
      setError(err.message || 'Service package creation failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddFee() {
    if (!newFee.name || !newFee.description || !newFee.amount) {
      setError('Fee name, description, and amount are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const endpoint = newFee.type === 'recurring' ? '/api/profiles/recurring' : '/api/profiles/onetime';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFee.name,
          description: newFee.description,
          amount: Number(newFee.amount),
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to save fee');
      }
      setNewFee({ type: 'recurring', name: '', description: '', amount: '' });
      await loadFees();
    } catch (err: any) {
      setError(err.message || 'Fee creation failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleLinkServiceToRateplan() {
    if (!linkServiceForm.rateplan_id || !linkServiceForm.service_id) {
      setError('Rateplan and service selection are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/profiles/rateplan-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rateplan_id: Number(linkServiceForm.rateplan_id),
          service_id: Number(linkServiceForm.service_id),
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to link service');
      }
      await loadRateplanServices(linkServiceForm.rateplan_id);
    } catch (err: any) {
      setError(err.message || 'Link service failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleAssignFee() {
    if (!assignFeeForm.msisdn || !assignFeeForm.feeId || !assignFeeForm.feeType) {
      setError('MSISDN, fee ID, and fee type are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          msisdn: assignFeeForm.msisdn,
          feeId: Number(assignFeeForm.feeId),
          feeType: assignFeeForm.feeType,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to assign fee');
      }
      setAssignFeeForm({ msisdn: '', feeId: '', feeType: 'RECURRING' });
    } catch (err: any) {
      setError(err.message || 'Fee assignment failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleRateplanSelection(rateplanId: string) {
    setSelectedRateplanId(rateplanId);
    setLinkServiceForm({ ...linkServiceForm, rateplan_id: rateplanId });
    await loadRateplanServices(rateplanId);
  }

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/login');
  }

  async function handleAddCustomer() {
    if (!newCustomer.name || !newCustomer.email) {
      setError('Customer name and email are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer),
      });
      if (!res.ok) throw new Error('Failed to create customer');
      setNewCustomer({ name: '', email: '', address: '' });
      await loadCustomers();
    } catch (err: any) {
      setError(err.message || 'Add customer failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateCustomer(email: string) {
    if (!editedAddress) {
      setError('Address is required to update customer.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/customer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, address: editedAddress }),
      });
      if (!res.ok) throw new Error('Failed to update customer');
      setEditCustomerEmail(null);
      setEditedAddress('');
      await loadCustomers();
    } catch (err: any) {
      setError(err.message || 'Update customer failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCustomer(email: string) {
    const confirmed = window.confirm(`Delete customer ${email}?`);
    if (!confirmed) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/customer?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete customer');
      await loadCustomers();
    } catch (err: any) {
      setError(err.message || 'Delete customer failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddRateplan() {
    if (!rateplanForm.name || !rateplanForm.ror || !rateplanForm.plan_price) {
      setError('Rateplan name, rate of return, and price are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: rateplanForm.name,
        ror: rateplanForm.ror,
        plan_price: rateplanForm.plan_price,
        free_units: rateplanForm.free_units,
      };
      const res = await fetch('/api/profiles/rateplans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to add rateplan');
      setRateplanForm({ name: '', ror: '', plan_price: '', free_units: '' });
      await loadRateplans();
    } catch (err: any) {
      setError(err.message || 'Add rateplan failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateContract() {
    if (!newContract.email || !newContract.msisdn || !newContract.rateplan_id || !newContract.credit_limit) {
      setError('All contract fields are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newContract.email,
          msisdn: newContract.msisdn,
          rateplan_id: Number(newContract.rateplan_id),
          credit_limit: Number(newContract.credit_limit),
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to create contract');
      }
      setNewContract({ email: '', msisdn: '', rateplan_id: '', credit_limit: '' });
      setContractEmail('');
      await loadContracts(newContract.email);
    } catch (err: any) {
      setError(err.message || 'Create contract failed');
    } finally {
      setSaving(false);
    }
  }

  const rateplanChartData = useMemo(
    () =>
      analytics
        ? Object.entries(analytics.rateplanPopularity).map(([name, count]) => ({ name, count }))
        : [],
    [analytics]
  );

  const usageChartData = useMemo(
    () =>
      analytics ? Object.entries(analytics.usageDistribution).map(([name, units]) => ({ name, units })) : [],
    [analytics]
  );

  const invoiceChartData = useMemo(
    () =>
      analytics ? Object.entries(analytics.invoiceCounts).map(([status, count]) => ({ status, count })) : [],
    [analytics]
  );

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#f43f5e'];

  const renderOverview = () => (
    <motion.div className="space-y-8">
      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid gap-6 md:grid-cols-3"
      >
        <StatBox
          label="Active Subscribers"
          value={analytics?.totalCustomers.toLocaleString() ?? '--'}
          change={12}
          icon={Users}
          gradient="blue"
          delay={0.1}
        />
        <StatBox
          label="Total Revenue"
          value={`$${analytics?.totalRevenue.toFixed(2) ?? '--'}`}
          change={8}
          icon={TrendingUp}
          gradient="emerald"
          delay={0.2}
        />
        <StatBox
          label="Pending Settlements"
          value={`$${analytics?.pendingRevenue.toFixed(2) ?? '--'}`}
          change={-5}
          icon={AlertCircle}
          gradient="amber"
          delay={0.3}
        />
      </motion.div>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Subscription Heatmap</h3>
            <div className="h-72 w-full" style={{ minHeight: 260, minWidth: 200 }}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={rateplanChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f2b" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} />
                  <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#111115', borderRadius: '12px', borderColor: '#2a2a3a' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Usage Distribution</h3>
            <div className="h-72 w-full" style={{ minHeight: 260, minWidth: 200 }}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={usageChartData} innerRadius={50} outerRadius={90} dataKey="units" nameKey="name" paddingAngle={4}>
                    {usageChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111115', borderRadius: '12px', borderColor: '#2a2a3a' }} />
                  <Legend verticalAlign="bottom" height={30} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderCustomers = () => (
    <motion.div className="space-y-6">
      <Card>
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Customer Management</h2>
          <p className="text-slate-400 text-sm mt-2">Create, update, and manage customer accounts</p>
        </div>

        <div className="p-6 grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Plus size={20} /> Add New Customer
            </h3>
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
            />
            <Input
              label="Email Address"
              placeholder="john@example.com"
              value={newCustomer.email}
              onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
            />
            <Input
              label="Address"
              placeholder="123 Main St"
              value={newCustomer.address}
              onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
            />
            <Button fullWidth onClick={handleAddCustomer} disabled={saving}>
              {saving ? 'Creating...' : 'Create Customer'}
            </Button>
          </div>

          <Card gradient="violet">
            <div className="p-6">
              <h4 className="font-semibold text-white mb-2">Quick Tips</h4>
              <ul className="text-sm text-slate-300 space-y-2">
                <li>• Email must be unique</li>
                <li>• All fields required</li>
                <li>• Address can be updated later</li>
              </ul>
            </div>
          </Card>
        </div>
      </Card>

      {/* Customers Table */}
      <Table
        columns={[
          { key: 'name', label: 'Name', width: 'w-32' },
          { key: 'email', label: 'Email' },
          { key: 'address', label: 'Address', width: 'w-40' },
          { key: 'created_at', label: 'Joined' },
        ]}
        data={customers.map((c) => ({
          name: c.name,
          email: c.email,
          address: editCustomerEmail === c.email ? (
            <Input
              value={editedAddress}
              onChange={(e) => setEditedAddress(e.target.value)}
              className="w-full"
            />
          ) : (
            c.address || '—'
          ),
          created_at: c.created_at || '—',
        }))}
        loading={loading}
      />
    </motion.div>
  );

  const renderProfiles = () => (
    <motion.div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Add Rateplan Card */}
        <Card gradient="blue">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap size={20} /> Create Rate Plan
            </h3>
            <div className="space-y-4">
              <Input
                label="Plan Name"
                placeholder="Premium Bundle"
                value={rateplanForm.name}
                onChange={(e) => setRateplanForm({ ...rateplanForm, name: e.target.value })}
              />
              <Input
                label="Monthly Price"
                placeholder="99.99"
                value={rateplanForm.plan_price}
                onChange={(e) => setRateplanForm({ ...rateplanForm, plan_price: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Rate of Return"
                  placeholder="3.5"
                  value={rateplanForm.ror}
                  onChange={(e) => setRateplanForm({ ...rateplanForm, ror: e.target.value })}
                />
                <Input
                  label="Free Units"
                  placeholder="5000"
                  value={rateplanForm.free_units}
                  onChange={(e) => setRateplanForm({ ...rateplanForm, free_units: e.target.value })}
                />
              </div>
              <Button fullWidth onClick={handleAddRateplan} disabled={saving}>
                {saving ? 'Creating...' : 'Create Rate Plan'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Add Service Card */}
        <Card gradient="emerald">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Plus size={20} /> Create Service
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Service Type</label>
                <select
                  value={newService.service_type}
                  onChange={(e) => setNewService({ ...newService, service_type: e.target.value })}
                  className="w-full glass-card bg-white/[0.02] px-4 py-2.5 text-white border border-white/10 rounded-lg"
                >
                  <option value="1">Voice</option>
                  <option value="2">SMS</option>
                  <option value="3">Data</option>
                </select>
              </div>
              <Input
                label="Description"
                placeholder="Service details"
                value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Price"
                  placeholder="5.00"
                  value={newService.rating_price}
                  onChange={(e) => setNewService({ ...newService, rating_price: e.target.value })}
                />
                <Input
                  label="Units"
                  placeholder="100"
                  value={newService.units}
                  onChange={(e) => setNewService({ ...newService, units: e.target.value })}
                />
              </div>
              <Input
                label="Zone ID"
                placeholder="1"
                value={newService.zone_id}
                onChange={(e) => setNewService({ ...newService, zone_id: e.target.value })}
              />
              <Button fullWidth onClick={handleAddServicePackage} disabled={saving}>
                {saving ? 'Creating...' : 'Create Service'}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Tables for Rateplans and Services */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">Rate Plans</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-slate-300">Name</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-300">Price</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-300">ROR</th>
                </tr>
              </thead>
<tbody>
                {rateplans.map((plan, index) => (
                  <tr key={plan.rateplan_id ?? index} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-6 py-3 text-white">{plan.name}</td>
                    <td className="px-6 py-3 text-white">${plan.plan_price != null ? plan.plan_price.toFixed(2) : '--'}</td>
                    <td className="px-6 py-3 text-slate-300">{plan.ror ?? '--'}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">Services</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-slate-300">Name</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-300">Type</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-300">Price</th>
                </tr>
              </thead>
<tbody>
                {services.map((service, index) => (
                  <tr key={service.id ?? index} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-6 py-3 text-white">{service.name}</td>
                    <td className="px-6 py-3"><Badge variant="info">{service.type}</Badge></td>
                    <td className="px-6 py-3 text-white">${service.price != null ? service.price.toFixed(2) : '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </motion.div>
  );

  const renderContracts = () => (
    <motion.div className="space-y-6">
      <Card>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Contract Management</h2>
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Plus size={20} /> Create Contract
              </h3>
              <Input
                label="Customer Email"
                placeholder="customer@example.com"
                value={newContract.email}
                onChange={(e) => setNewContract({ ...newContract, email: e.target.value })}
              />
              <Input
                label="MSISDN"
                placeholder="201XXXXXXXXX"
                value={newContract.msisdn}
                onChange={(e) => setNewContract({ ...newContract, msisdn: e.target.value })}
              />
              <Input
                label="Rate Plan ID"
                placeholder="1"
                value={newContract.rateplan_id}
                onChange={(e) => setNewContract({ ...newContract, rateplan_id: e.target.value })}
              />
              <Input
                label="Credit Limit"
                placeholder="1000"
                value={newContract.credit_limit}
                onChange={(e) => setNewContract({ ...newContract, credit_limit: e.target.value })}
              />
              <Button fullWidth onClick={handleCreateContract} disabled={saving}>
                {saving ? 'Creating...' : 'Create Contract'}
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users size={20} /> Lookup Contracts
              </h3>
              <Input
                label="Search by Email"
                placeholder="customer@example.com"
                value={contractEmail}
                onChange={(e) => setContractEmail(e.target.value)}
              />
              <Button fullWidth variant="secondary" onClick={() => contractEmail && loadContracts(contractEmail)}>
                Search Contracts
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Contracts Table */}
      <Table
        columns={[
          { key: 'msisdn', label: 'MSISDN' },
          { key: 'rateplan_name', label: 'Rate Plan' },
          { key: 'credit_limit', label: 'Credit Limit' },
          { key: 'balance', label: 'Balance', render: (val) => `$${val.toFixed(2)}` },
          { key: 'created_at', label: 'Created' },
        ]}
        data={contracts}
        loading={contractLoading}
        emptyMessage="Search for a customer to view their contracts"
      />
    </motion.div>
  );

  const renderAnalytics = () => (
    <motion.div className="space-y-6">
      <Card>
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Analytics & Reports</h2>
          <p className="text-slate-400 text-sm mt-2">Revenue, usage, and subscription metrics</p>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Invoice Status</h3>
            <div className="w-full" style={{ minHeight: 300 }}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={invoiceChartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f2b" vertical={false} />
                  <XAxis dataKey="status" stroke="#94a3b8" tickLine={false} />
                  <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#111115', borderRadius: '12px', borderColor: '#2a2a3a' }} />
                  <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#colorRevenue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Top Plans</h3>
            <div className="w-full" style={{ minHeight: 300 }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={rateplanChartData} innerRadius={50} outerRadius={90} dataKey="count" nameKey="name">
                    {rateplanChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111115', borderRadius: '12px', borderColor: '#2a2a3a' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );

  const renderTabContent = () => {
    if (activeTab === 'overview') return renderOverview();
    if (activeTab === 'customers') return renderCustomers();
    if (activeTab === 'profiles') return renderProfiles();
    if (activeTab === 'contracts') return renderContracts();
    if (activeTab === 'analytics') return renderAnalytics();
    return null;
  };

  return (
    <DashboardLayout
      title={tabNames[activeTab]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
      userInfo={user ? { name: user.username, role: user.role } : undefined}
    >
      <div className="p-6 md:p-8">
        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 rounded-lg bg-accent-rose/20 border border-accent-rose/50 text-accent-rose flex items-center gap-3"
          >
            <AlertCircle size={20} />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Tab Content */}
        {loading && activeTab === 'overview' ? <Skeleton count={3} /> : renderTabContent()}
      </div>
    </DashboardLayout>
  );
}
