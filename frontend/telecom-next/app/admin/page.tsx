"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
} from "recharts";

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

const tabs = ["overview", "customers", "profiles", "contracts", "analytics"] as const;
type Tab = (typeof tabs)[number];

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rateplans, setRateplans] = useState<Rateplan[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", address: "" });
  const [rateplanForm, setRateplanForm] = useState({ name: "", ror: "", plan_price: "", free_units: "" });
  const [contractEmail, setContractEmail] = useState("");
  const [newContract, setNewContract] = useState({ email: "", msisdn: "", rateplan_id: "", credit_limit: "" });
  const [newService, setNewService] = useState({ service_type: "1", description: "", rating_price: "", units: "", zone_id: "" });
  const [newFee, setNewFee] = useState({ type: "recurring", name: "", description: "", amount: "" });
  const [services, setServices] = useState<Service[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [rateplanServices, setRateplanServices] = useState<Service[]>([]);
  const [selectedRateplanId, setSelectedRateplanId] = useState("");
  const [linkServiceForm, setLinkServiceForm] = useState({ rateplan_id: "", service_id: "" });
  const [assignFeeForm, setAssignFeeForm] = useState({ msisdn: "", feeId: "", feeType: "RECURRING" });
  const [contractLoading, setContractLoading] = useState(false);
  const [editCustomerEmail, setEditCustomerEmail] = useState<string | null>(null);
  const [editedAddress, setEditedAddress] = useState("");

  useEffect(() => {
    init();
  }, [router]);

  useEffect(() => {
    if (activeTab === "customers") {
      loadCustomers();
    }
    if (activeTab === "profiles") {
      loadRateplans();
      loadServices();
      loadFees();
    }
    if (activeTab === "contracts" && contractEmail) {
      loadContracts(contractEmail);
    }
    if (activeTab === "analytics") {
      loadAnalytics();
    }
  }, [activeTab, contractEmail]);

  async function init() {
    try {
      const session = await fetchSession();
      if (!session || session.role?.toLowerCase() !== "admin") {
        router.push("/login");
        return;
      }
      setUser(session);
      await Promise.all([loadAnalytics(), loadCustomers(), loadRateplans()]);
    } catch (err) {
      setError("Unable to initialize admin panel. Please log in again.");
      router.push("/login");
    }
  }

  async function fetchSession() {
    const res = await fetch("/api/auth");
    if (!res.ok) return null;
    return (await res.json()) as Session;
  }

  async function loadAnalytics() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/analytics");
      if (!res.ok) throw new Error("Unable to load analytics");
      setAnalytics(await res.json());
    } catch (err: any) {
      setError(err.message || "Analytics fetch failed");
    } finally {
      setLoading(false);
    }
  }

  async function loadCustomers() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/customer");
      if (!res.ok) throw new Error("Unable to load customers");
      setCustomers(await res.json());
    } catch (err: any) {
      setError(err.message || "Customer fetch failed");
    } finally {
      setLoading(false);
    }
  }

  async function loadContracts(email: string) {
    setContractLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/contract?email=${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error("Unable to load contracts");
      setContracts(await res.json());
    } catch (err: any) {
      setError(err.message || "Contract fetch failed");
    } finally {
      setContractLoading(false);
    }
  }

  async function loadRateplans() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/profiles/rateplans");
      if (!res.ok) throw new Error("Unable to load rateplans");
      setRateplans(await res.json());
    } catch (err: any) {
      setError(err.message || "Rateplan fetch failed");
    } finally {
      setLoading(false);
    }
  }

  async function loadServices() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/profiles/services");
      if (!res.ok) throw new Error("Unable to load services");
      setServices(await res.json());
    } catch (err: any) {
      setError(err.message || "Service fetch failed");
    } finally {
      setLoading(false);
    }
  }

  async function loadFees() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/profiles/fees");
      if (!res.ok) throw new Error("Unable to load fees");
      setFees(await res.json());
    } catch (err: any) {
      setError(err.message || "Fee fetch failed");
    } finally {
      setLoading(false);
    }
  }

  async function loadRateplanServices(rateplanId: string) {
    if (!rateplanId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/profiles/rateplan-services?rateplan_id=${encodeURIComponent(rateplanId)}`);
      if (!res.ok) throw new Error("Unable to load rateplan services");
      setRateplanServices(await res.json());
    } catch (err: any) {
      setError(err.message || "Rateplan services fetch failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddServicePackage() {
    if (!newService.description || !newService.rating_price || !newService.units || !newService.zone_id) {
      setError("All service package fields are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/profiles/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        throw new Error(text || "Failed to save service package");
      }
      setNewService({ service_type: "1", description: "", rating_price: "", units: "", zone_id: "" });
      await loadServices();
    } catch (err: any) {
      setError(err.message || "Service package creation failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddFee() {
    if (!newFee.name || !newFee.description || !newFee.amount) {
      setError("Fee name, description, and amount are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const endpoint = newFee.type === "recurring" ? "/api/profiles/recurring" : "/api/profiles/onetime";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFee.name,
          description: newFee.description,
          amount: Number(newFee.amount),
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to save fee");
      }
      setNewFee({ type: "recurring", name: "", description: "", amount: "" });
      await loadFees();
    } catch (err: any) {
      setError(err.message || "Fee creation failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleLinkServiceToRateplan() {
    if (!linkServiceForm.rateplan_id || !linkServiceForm.service_id) {
      setError("Rateplan and service selection are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/profiles/rateplan-services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rateplan_id: Number(linkServiceForm.rateplan_id),
          service_id: Number(linkServiceForm.service_id),
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to link service");
      }
      await loadRateplanServices(linkServiceForm.rateplan_id);
    } catch (err: any) {
      setError(err.message || "Link service failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleAssignFee() {
    if (!assignFeeForm.msisdn || !assignFeeForm.feeId || !assignFeeForm.feeType) {
      setError("MSISDN, fee ID, and fee type are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          msisdn: assignFeeForm.msisdn,
          feeId: Number(assignFeeForm.feeId),
          feeType: assignFeeForm.feeType,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to assign fee");
      }
      setAssignFeeForm({ msisdn: "", feeId: "", feeType: "RECURRING" });
    } catch (err: any) {
      setError(err.message || "Fee assignment failed");
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
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  }

  async function handleAddCustomer() {
    if (!newCustomer.name || !newCustomer.email) {
      setError("Customer name and email are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustomer),
      });
      if (!res.ok) throw new Error("Failed to create customer");
      setNewCustomer({ name: "", email: "", address: "" });
      await loadCustomers();
    } catch (err: any) {
      setError(err.message || "Add customer failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateCustomer(email: string) {
    if (!editedAddress) {
      setError("Address is required to update customer.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/customer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, address: editedAddress }),
      });
      if (!res.ok) throw new Error("Failed to update customer");
      setEditCustomerEmail(null);
      setEditedAddress("");
      await loadCustomers();
    } catch (err: any) {
      setError(err.message || "Update customer failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCustomer(email: string) {
    const confirmed = window.confirm(`Delete customer ${email}?`);
    if (!confirmed) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/customer?email=${encodeURIComponent(email)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete customer");
      await loadCustomers();
    } catch (err: any) {
      setError(err.message || "Delete customer failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddRateplan() {
    if (!rateplanForm.name || !rateplanForm.ror || !rateplanForm.plan_price) {
      setError("Rateplan name, rate of return, and price are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: rateplanForm.name,
        ror: rateplanForm.ror,
        plan_price: rateplanForm.plan_price,
        free_units: rateplanForm.free_units,
      };
      const res = await fetch("/api/profiles/rateplans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to add rateplan");
      setRateplanForm({ name: "", ror: "", plan_price: "", free_units: "" });
      await loadRateplans();
    } catch (err: any) {
      setError(err.message || "Add rateplan failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateContract() {
    if (!newContract.email || !newContract.msisdn || !newContract.rateplan_id || !newContract.credit_limit) {
      setError("All contract fields are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newContract.email,
          msisdn: newContract.msisdn,
          rateplan_id: Number(newContract.rateplan_id),
          credit_limit: Number(newContract.credit_limit),
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to create contract");
      }
      setNewContract({ email: "", msisdn: "", rateplan_id: "", credit_limit: "" });
      setContractEmail("");
      await loadContracts(newContract.email);
    } catch (err: any) {
      setError(err.message || "Create contract failed");
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

  const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#f43f5e"];

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="col-span-full flex items-center justify-center py-10">
          <div className="w-10 h-10 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (activeTab === "overview") {
      return (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="glass-card p-6">
              <p className="text-xs uppercase tracking-widest text-slate-400">Active subscribers</p>
              <p className="mt-4 text-3xl font-bold text-white">{analytics?.totalCustomers.toLocaleString() ?? "--"}</p>
            </div>
            <div className="glass-card p-6">
              <p className="text-xs uppercase tracking-widest text-slate-400">Total revenue</p>
              <p className="mt-4 text-3xl font-bold text-emerald-400">${analytics?.totalRevenue.toFixed(2) ?? "--"}</p>
            </div>
            <div className="glass-card p-6">
              <p className="text-xs uppercase tracking-widest text-slate-400">Pending settlements</p>
              <p className="mt-4 text-3xl font-bold text-amber-400">${analytics?.pendingRevenue.toFixed(2) ?? "--"}</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="glass-card p-6">
              <h2 className="text-sm font-semibold text-slate-200 mb-4">Subscription heatmap</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rateplanChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f1f2b" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} />
                    <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#111115", borderRadius: "12px", borderColor: "#2a2a3a" }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[5, 5, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="glass-card p-6">
              <h2 className="text-sm font-semibold text-slate-200 mb-4">Usage distribution</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={usageChartData} innerRadius={55} outerRadius={90} dataKey="units" nameKey="name" paddingAngle={4}>
                      {usageChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#111115", borderRadius: "12px", borderColor: "#2a2a3a" }} />
                    <Legend verticalAlign="bottom" height={30} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "customers") {
      return (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white">Customer directory</h2>
            <p className="text-sm text-slate-400">Create, update, and remove customer accounts backed by the servlet datastore.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-white mb-4">New customer</h3>
              <div className="space-y-4">
                <label className="block text-sm text-slate-300">Name</label>
                <input value={newCustomer.name} onChange={(event) => setNewCustomer({ ...newCustomer, name: event.target.value })} className="w-full rounded-2xl border border-surface-700 bg-surface-900 px-4 py-3 text-sm text-white" placeholder="Customer name" />
                <label className="block text-sm text-slate-300">Email</label>
                <input value={newCustomer.email} onChange={(event) => setNewCustomer({ ...newCustomer, email: event.target.value })} className="w-full rounded-2xl border border-surface-700 bg-surface-900 px-4 py-3 text-sm text-white" placeholder="Email address" />
                <label className="block text-sm text-slate-300">Address</label>
                <input value={newCustomer.address} onChange={(event) => setNewCustomer({ ...newCustomer, address: event.target.value })} className="w-full rounded-2xl border border-surface-700 bg-surface-900 px-4 py-3 text-sm text-white" placeholder="Postal address" />
                <button disabled={saving} onClick={handleAddCustomer} className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-200 transition-all disabled:opacity-60">
                  Add customer
                </button>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Customer update</h3>
              <p className="text-sm text-slate-400">Select a row to update the saved address immediately.</p>
            </div>
          </div>

          <div className="glass-card overflow-x-auto p-6">
            <table className="min-w-full text-left text-sm text-slate-200">
              <thead className="border-b border-surface-700 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.email} className="border-b border-surface-800">
                    <td className="px-4 py-3">{customer.name}</td>
                    <td className="px-4 py-3">{customer.email}</td>
                    <td className="px-4 py-3">
                      {editCustomerEmail === customer.email ? (
                        <input value={editedAddress} onChange={(event) => setEditedAddress(event.target.value)} className="w-full rounded-2xl border border-surface-700 bg-surface-900 px-3 py-2 text-sm text-white" />
                      ) : (
                        customer.address || "—"
                      )}
                    </td>
                    <td className="px-4 py-3">{customer.created_at ?? "—"}</td>
                    <td className="px-4 py-3 space-x-2">
                      {editCustomerEmail === customer.email ? (
                        <>
                          <button onClick={() => handleUpdateCustomer(customer.email)} className="rounded-2xl bg-emerald-500 px-3 py-2 text-xs text-white">Save</button>
                          <button onClick={() => setEditCustomerEmail(null)} className="rounded-2xl bg-slate-700 px-3 py-2 text-xs text-slate-100">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditCustomerEmail(customer.email); setEditedAddress(customer.address); }} className="rounded-2xl bg-slate-800 px-3 py-2 text-xs text-slate-100">Edit</button>
                          <button onClick={() => handleDeleteCustomer(customer.email)} className="rounded-2xl bg-rose-600 px-3 py-2 text-xs text-white">Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeTab === "profiles") {
      return (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white">Rateplan and service management</h2>
            <p className="text-sm text-slate-400">Manage rateplans, service packages, fees, and assignments through legacy servlet endpoints.</p>
          </div>

          <div className="glass-card p-6 grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Create new rateplan</h3>
              <label className="block text-sm text-slate-300">Plan name</label>
              <input value={rateplanForm.name} onChange={(event) => setRateplanForm({ ...rateplanForm, name: event.target.value })} className="w-full rounded-2xl border border-surface-700 bg-surface-900 px-4 py-3 text-sm text-white" placeholder="Super Saver" />
              <label className="block text-sm text-slate-300">Monthly price</label>
              <input value={rateplanForm.plan_price} onChange={(event) => setRateplanForm({ ...rateplanForm, plan_price: event.target.value })} className="w-full rounded-2xl border border-surface-700 bg-surface-900 px-4 py-3 text-sm text-white" placeholder="120.00" />
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm text-slate-300">Rate of return</label>
                  <input value={rateplanForm.ror} onChange={(event) => setRateplanForm({ ...rateplanForm, ror: event.target.value })} className="w-full rounded-2xl border border-surface-700 bg-surface-900 px-4 py-3 text-sm text-white" placeholder="3.4" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300">Free units</label>
                  <input value={rateplanForm.free_units} onChange={(event) => setRateplanForm({ ...rateplanForm, free_units: event.target.value })} className="w-full rounded-2xl border border-surface-700 bg-surface-900 px-4 py-3 text-sm text-white" placeholder="2500" />
                </div>
              </div>
              <button disabled={saving} onClick={handleAddRateplan} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-200 transition-all disabled:opacity-60">Create rateplan</button>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Create service package</h3>
              <label className="block text-sm text-slate-300">Service type</label>
              <select value={newService.service_type} onChange={(event) => setNewService({ ...newService, service_type: event.target.value })} className="w-full rounded-2xl border border-surface-700 bg-surface-900 px-4 py-3 text-sm text-white">
                <option value="1">Voice</option>
                <option value="2">SMS</option>
                <option value="3">Data</option>
              </select>
              <label className="block text-sm text-slate-300">Description</label>
              <input value={newService.description} onChange={(event) => setNewService({ ...newService, description: event.target.value })} className="w-full rounded-2xl border border-surface-700 bg-surface-900 px-4 py-3 text-sm text-white" placeholder="Service description" />
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm text-slate-300">Price</label>
                  <input value={newService.rating_price} onChange={(event) => setNewService({ ...newService, rating_price: event.target.value })} className="w-full rounded-2xl border border-surface-700 bg-surface-900 px-4 py-3 text-sm text-white" placeholder="5.00" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300">Units</label>
                  <input value={newService.units} onChange={(event) => setNewService({ ...newService, units: event.target.value })} className="w-full rounded-2xl border border-surface-700 bg-surface-900 px-4 py-3 text-sm text-white" placeholder="100" />
                </div>
              </div>
              <label className="block text-sm text-slate-300">Zone ID</label>
              <input value={newService.zone_id} onChange={(event) => setNewService({ ...newService, zone_id: event.target.value })} className="w-full rounded-2xl border border-surface-700 bg-surface-900 px-4 py-3 text-sm text-white" placeholder="1" />
              <button disabled={saving} onClick={handleAddServicePackage} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-200 transition-all disabled:opacity-60">Save service package</button>
            </div>
          </div>

          <div className="glass-card p-6 grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Create fee</h3>
              <label className="block text-sm text-slate-300">Fee type</label>
              <select value={newFee.type} onChange={(event) => setNewFee({ ...newFee, type: event.target.value })} className="w-full rounded-2xl border border-surface-700 bg-surface-900 px-4 py-3 text-sm text-white">
                <option value="recurring">Recurring</option>
                <option value="onetime">One-time</option>
              </select>
              <label className="block text-sm text-slate-300">Name</label>
              <input value={newFee.name} onChange={(event) => setNewFee({ ...newFee, name: event.target.value })} className="w-full rounded-2xl border border-surface-700 bg-surface-900 px-4 py-3 text-sm text-white" placeholder="Service name" />
              <label className="block text-sm text-slate-300">Description</label>
              <input value={newFee.description} onChange={(event) => setNewFee({ ...newFee, description: event.target.value })} className="w-full rounded-2xl border border-surface-700 bg-surface-900 px-4 py-3 text-sm text-white" placeholder="Short description" />
              <label className="block text-sm text-slate-300">Amount</label>
              <input value={newFee.amount} onChange={(event) => setNewFee({ ...newFee, amount: event.target.value })} className="w-full rounded-2xl border border-surface-700 bg-surface-900 px-4 py-3 text-sm text-white" placeholder="25.00" />
              <button disabled={saving} onClick={handleAddFee} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-200 transition-all disabled:opacity-60">Save fee</button>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Assign fee to customer</h3>
              <label className="block text-sm text-slate-300">Subscriber MSISDN</label>
              <input value={assignFeeForm.msisdn} onChange={(event) => setAssignFeeForm({ ...assignFeeForm, msisdn: event.target.value })} className="w-full rounded-2xl border border-surface-700 bg-surface-900 px-4 py-3 text-sm text-white" placeholder="002016XXXXXXXX" />
              <label className="block text-sm text-slate-300">Fee ID</label>
              <input value={assignFeeForm.feeId} onChange={(event) => setAssignFeeForm({ ...assignFeeForm, feeId: event.target.value })} className="w-full rounded-2xl border border-surface-700 bg-surface-900 px-4 py-3 text-sm text-white" placeholder="Fee ID" />
              <label className="block text-sm text-slate-300">Fee type</label>
              <select value={assignFeeForm.feeType} onChange={(event) => setAssignFeeForm({ ...assignFeeForm, feeType: event.target.value })} className="w-full rounded-2xl border border-surface-700 bg-surface-900 px-4 py-3 text-sm text-white">
                <option value="RECURRING">Recurring</option>
                <option value="ONE_TIME">One-time</option>
              </select>
              <button disabled={saving} onClick={handleAssignFee} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-200 transition-all disabled:opacity-60">Assign fee</button>
            </div>
          </div>

          <div className="glass-card p-6 grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Link service to rateplan</h3>
              <label className="block text-sm text-slate-300">Select rateplan</label>
              <select value={linkServiceForm.rateplan_id} onChange={(event) => handleRateplanSelection(event.target.value)} className="w-full rounded-2xl border border-surface-700 bg-surface-900 px-4 py-3 text-sm text-white">
                <option value="">Choose a rateplan</option>
                {rateplans.map((plan) => (
                  <option key={plan.rateplan_id} value={String(plan.rateplan_id)}>{plan.name}</option>
                ))}
              </select>
              <label className="block text-sm text-slate-300">Select service</label>
              <select value={linkServiceForm.service_id} onChange={(event) => setLinkServiceForm({ ...linkServiceForm, service_id: event.target.value })} className="w-full rounded-2xl border border-surface-700 bg-surface-900 px-4 py-3 text-sm text-white">
                <option value="">Choose a service</option>
                {services.map((service) => (
                  <option key={service.id} value={String(service.id)}>{service.name} ({service.type})</option>
                ))}
              </select>
              <button disabled={saving} onClick={handleLinkServiceToRateplan} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-200 transition-all disabled:opacity-60">Link to rateplan</button>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Selected rateplan services</h3>
              {selectedRateplanId ? (
                <div className="space-y-3">
                  <div className="rounded-3xl border border-surface-800 bg-surface-900 p-4 text-sm text-slate-300">
                    {rateplanServices.length === 0 ? (
                      <p>No services linked yet.</p>
                    ) : (
                      <ul className="space-y-2">
                        {rateplanServices.map((service) => (
                          <li key={service.id} className="rounded-2xl border border-surface-700 bg-surface-950 p-3">
                            <p className="text-sm text-white">{service.name} ({service.type})</p>
                            <p className="text-xs text-slate-400">Price: ${service.price.toFixed(2)} · Units: {service.units}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">Select a rateplan to view linked services.</p>
              )}
            </div>
          </div>

          <div className="glass-card overflow-x-auto p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Existing rateplans</h3>
            <table className="min-w-full text-left text-sm text-slate-200">
              <thead className="border-b border-surface-700 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Plan ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">ROR</th>
                  <th className="px-4 py-3">Free units</th>
                </tr>
              </thead>
              <tbody>
                {rateplans.map((plan) => (
                  <tr key={plan.rateplan_id} className="border-b border-surface-800">
                    <td className="px-4 py-3">{plan.rateplan_id}</td>
                    <td className="px-4 py-3">{plan.name}</td>
                    <td className="px-4 py-3">${plan.plan_price.toFixed(2)}</td>
                    <td className="px-4 py-3">{plan.ror}%</td>
                    <td className="px-4 py-3">{plan.free_units}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="glass-card overflow-x-auto p-6 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">All services</h3>
              <table className="min-w-full text-left text-sm text-slate-200">
                <thead className="border-b border-surface-700 text-slate-400">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Units</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.id} className="border-b border-surface-800">
                      <td className="px-4 py-3">{service.id}</td>
                      <td className="px-4 py-3">{service.name}</td>
                      <td className="px-4 py-3">{service.type}</td>
                      <td className="px-4 py-3">${service.price.toFixed(2)}</td>
                      <td className="px-4 py-3">{service.units}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">All fees</h3>
              <table className="min-w-full text-left text-sm text-slate-200">
                <thead className="border-b border-surface-700 text-slate-400">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map((fee) => (
                    <tr key={fee.id} className="border-b border-surface-800">
                      <td className="px-4 py-3">{fee.id}</td>
                      <td className="px-4 py-3">{fee.name}</td>
                      <td className="px-4 py-3">{fee.type}</td>
                      <td className="px-4 py-3">${fee.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "contracts") {
      return (
        <div className="space-y-6">
          <div className="glass-card p-6 grid gap-4 md:grid-cols-[1fr_320px]">
            <div>
              <h2 className="text-lg font-semibold text-white">Contract lookup</h2>
              <p className="text-sm text-slate-400">Search signed contracts by customer email and inspect billing assignments.</p>
            </div>
            <div className="space-y-3">
              <input value={contractEmail} onChange={(event) => setContractEmail(event.target.value)} className="w-full rounded-2xl border border-surface-700 bg-surface-900 px-4 py-3 text-sm text-white" placeholder="customer@example.com" />
              <button onClick={() => loadContracts(contractEmail)} className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-200 transition-all">Fetch contract</button>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Create new contract</h3>
            <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
              <div>
                <label className="block text-sm text-slate-300">Customer email</label>
                <input value={newContract.email} onChange={(event) => setNewContract({ ...newContract, email: event.target.value })} className="w-full rounded-2xl border border-surface-700 bg-surface-900 px-4 py-3 text-sm text-white" placeholder="customer@example.com" />
              </div>
              <div>
                <label className="block text-sm text-slate-300">MSISDN</label>
                <input value={newContract.msisdn} onChange={(event) => setNewContract({ ...newContract, msisdn: event.target.value })} className="w-full rounded-2xl border border-surface-700 bg-surface-900 px-4 py-3 text-sm text-white" placeholder="002016XXXXXXXX" />
              </div>
              <div>
                <label className="block text-sm text-slate-300">Rateplan ID</label>
                <input value={newContract.rateplan_id} onChange={(event) => setNewContract({ ...newContract, rateplan_id: event.target.value })} className="w-full rounded-2xl border border-surface-700 bg-surface-900 px-4 py-3 text-sm text-white" placeholder="101" />
              </div>
              <div>
                <label className="block text-sm text-slate-300">Credit limit</label>
                <input value={newContract.credit_limit} onChange={(event) => setNewContract({ ...newContract, credit_limit: event.target.value })} className="w-full rounded-2xl border border-surface-700 bg-surface-900 px-4 py-3 text-sm text-white" placeholder="1000" />
              </div>
              <div className="lg:col-span-2">
                <button onClick={handleCreateContract} disabled={saving} className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-200 transition-all disabled:opacity-60">Create contract</button>
              </div>
            </div>
          </div>

          <div className="glass-card overflow-x-auto p-6">
            <table className="min-w-full text-left text-sm text-slate-200">
              <thead className="border-b border-surface-700 text-slate-400">
                <tr>
                  <th className="px-4 py-3">MSISDN</th>
                  <th className="px-4 py-3">Rateplan</th>
                  <th className="px-4 py-3">Credit limit</th>
                  <th className="px-4 py-3">Balance</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {contracts.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No contracts to display.</td></tr>
                ) : (
                  contracts.map((contract) => (
                    <tr key={contract.msisdn} className="border-b border-surface-800">
                      <td className="px-4 py-3">{contract.msisdn}</td>
                      <td className="px-4 py-3">{contract.rateplan_name}</td>
                      <td className="px-4 py-3">{contract.credit_limit}</td>
                      <td className="px-4 py-3">${contract.balance.toFixed(2)}</td>
                      <td className="px-4 py-3">{contract.created_at}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeTab === "analytics") {
      return (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white">Revenue and usage analytics</h2>
            <p className="text-sm text-slate-400">All metrics come from the legacy servlet analytics endpoint.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="glass-card p-6">
              <h3 className="mb-4 text-sm font-semibold text-slate-200">Invoice status</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={invoiceChartData}>
                    <defs>
                      <linearGradient id="totalRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f1f2b" vertical={false} />
                    <XAxis dataKey="status" stroke="#94a3b8" tickLine={false} />
                    <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#111115", borderRadius: "12px", borderColor: "#2a2a3a" }} />
                    <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#totalRevenueGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="glass-card p-6">
              <h3 className="mb-4 text-sm font-semibold text-slate-200">Top plans by subscriptions</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={rateplanChartData} innerRadius={50} outerRadius={90} dataKey="count" nameKey="name">
                      {rateplanChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#111115", borderRadius: "12px", borderColor: "#2a2a3a" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-surface-950 px-4 py-6 md:px-8 md:py-8 text-slate-100">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-white">Admin command center</h1>
          <p className="text-sm text-slate-400 mt-1">Operate legacy customer, rateplan, contract, and analytics workflows from the new UI.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <span className="rounded-full border border-surface-700 bg-surface-900 px-4 py-2 text-sm text-slate-300">{user?.username || "admin"}</span>
          <button onClick={handleLogout} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200 transition-all">Logout</button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <aside className="glass-card rounded-3xl border border-surface-800 p-4">
          <div className="space-y-4">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`block w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all ${activeTab === tab ? "bg-slate-900 text-white shadow" : "bg-surface-900 text-slate-300 hover:bg-surface-800"}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </aside>
        <main className="space-y-6"> 
          {error ? (
            <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>
          ) : null}
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}
