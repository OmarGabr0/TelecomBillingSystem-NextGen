"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UserSession = {
  username: string;
  role: string;
};

type CustomerProfile = {
  customer_name: string;
  msisdn: string;
  rateplan_name: string;
  total_voice: number;
  total_sms: number;
  total_data: number;
  total_free: number;
};

type Invoice = {
  invoice_id: number;
  msisdn: string;
  start: string;
  end: string;
  sub_total: number;
  tax: number;
  total: number;
  invoice_status: string;
};

type Rateplan = {
  rateplan_id: number;
  name: string;
  ror: number;
  plan_price: number;
  free_units: number;
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

type Contract = {
  msisdn: string;
  credit_limit: number;
  balance: number;
  rateplan_id: number;
  rateplan_name: string;
  created_at: string;
};

export default function UserDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [rateplans, setRateplans] = useState<Rateplan[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedInvoice = selectedInvoiceId ? invoices.find((invoice) => invoice.invoice_id === selectedInvoiceId) ?? null : null;

  function handleInvoiceSelect(invoiceId: number) {
    setSelectedInvoiceId((current) => (current === invoiceId ? null : invoiceId));
  }

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/auth");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const sessionData = (await res.json()) as UserSession;
        if (sessionData.role?.toLowerCase() !== "user") {
          router.push("/login");
          return;
        }

        setSession(sessionData);

        const [profileRes, invoicesRes, rateplansRes, contractsRes, servicesRes, feesRes] = await Promise.all([
          fetch(`/api/customer/profile?email=${encodeURIComponent(sessionData.username)}`),
          fetch(`/api/customer/invoices?email=${encodeURIComponent(sessionData.username)}`),
          fetch("/api/profiles/rateplans"),
          fetch(`/api/contract?email=${encodeURIComponent(sessionData.username)}`),
          fetch("/api/profiles/services"),
          fetch("/api/profiles/fees"),
        ]);

        if (
          !profileRes.ok ||
          !invoicesRes.ok ||
          !rateplansRes.ok ||
          !contractsRes.ok ||
          !servicesRes.ok ||
          !feesRes.ok
        ) {
          throw new Error("Unable to load user data");
        }

        const profileJson = await profileRes.json();
        setProfile(Array.isArray(profileJson) ? profileJson[0] ?? null : profileJson);
        setInvoices(await invoicesRes.json());
        setRateplans(await rateplansRes.json());
        setContracts(await contractsRes.json());
        setServices(await servicesRes.json());
        setFees(await feesRes.json());
      } catch (err: any) {
        setError(err.message || "Could not load user dashboard");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-950 flex flex-col items-center justify-center gap-4 text-slate-200">
        <div className="w-10 h-10 rounded-full border-2 border-accent-blue border-t-transparent animate-spin" />
        <p className="text-sm text-slate-400">Loading your subscriber dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-950 flex flex-col items-center justify-center gap-4 px-4 text-center text-slate-200">
        <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-6">
          <p className="font-semibold text-rose-200">Unable to load dashboard</p>
          <p className="text-sm text-slate-300 mt-2">{error}</p>
        </div>
        <button onClick={() => window.location.reload()} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950 px-4 py-8 md:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-white">Subscriber Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Access your profile, invoices, and active rateplan details.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <span className="rounded-full border border-surface-700 bg-surface-900 px-4 py-2 text-sm text-slate-300">{session?.username}</span>
          <button onClick={handleLogout} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200">Logout</button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-white">Hello {profile?.customer_name ?? session?.username}</h2>
            <p className="text-sm text-slate-400">Your current selected rateplan and billing overview are shown below.</p>
          </div>

          <div className="glass-card p-6 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-surface-800 bg-surface-900 p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-3">Current subscription</h3>
              <p className="text-lg font-semibold text-white">{profile?.rateplan_name ?? "No active plan"}</p>
              <p className="text-sm text-slate-400 mt-2">MSISDN: {profile?.msisdn ?? "—"}</p>
            </div>
            <div className="rounded-3xl border border-surface-800 bg-surface-900 p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-3">Remaining allowances</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <p>Voice units: <span className="font-semibold text-white">{profile?.total_voice ?? 0}</span></p>
                <p>SMS units: <span className="font-semibold text-white">{profile?.total_sms ?? 0}</span></p>
                <p>Data units: <span className="font-semibold text-white">{profile?.total_data ?? 0}</span></p>
                <p>Free units: <span className="font-semibold text-white">{profile?.total_free ?? 0}</span></p>
              </div>
            </div>
            <div className="rounded-3xl border border-surface-800 bg-surface-900 p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-3">Active contract</h3>
              {contracts.length > 0 ? (
                contracts.map((contract) => (
                  <div key={contract.msisdn} className="space-y-2 text-sm text-slate-300">
                    <p><span className="font-medium text-slate-100">MSISDN:</span> {contract.msisdn}</p>
                    <p><span className="font-medium text-slate-100">Plan:</span> {contract.rateplan_name}</p>
                    <p><span className="font-medium text-slate-100">Balance:</span> ${contract.balance.toFixed(2)}</p>
                    <p><span className="font-medium text-slate-100">Credit limit:</span> ${contract.credit_limit.toFixed(2)}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No active contract information found.</p>
              )}
            </div>
          </div>

          <div className="glass-card overflow-x-auto p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent invoices</h3>
            <table className="min-w-full text-left text-sm text-slate-200">
              <thead className="border-b border-surface-700 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3">Period</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length > 0 ? (
                  invoices.map((invoice) => (
                    <tr key={invoice.invoice_id} className="border-b border-surface-800 hover:bg-surface-900">
                      <td className="px-4 py-3">#{invoice.invoice_id}</td>
                      <td className="px-4 py-3">{invoice.start} → {invoice.end}</td>
                      <td className="px-4 py-3">${invoice.total.toFixed(2)}</td>
                      <td className="px-4 py-3 text-slate-200">{invoice.invoice_status}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleInvoiceSelect(invoice.invoice_id)} className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700">
                          {selectedInvoiceId === invoice.invoice_id ? "Hide" : "View"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">No invoices available.</td>
                  </tr>
                )}
              </tbody>
            </table>
            {selectedInvoice && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
                <div className="w-full max-w-3xl rounded-3xl border border-surface-800 bg-surface-950 p-6 shadow-2xl">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h4 className="text-2xl font-semibold text-white">Invoice #{selectedInvoice.invoice_id}</h4>
                      <p className="text-sm text-slate-400">{selectedInvoice.start} → {selectedInvoice.end}</p>
                    </div>
                    <button onClick={() => setSelectedInvoiceId(null)} className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700">
                      Close
                    </button>
                  </div>

                  <div className="mt-6 grid gap-6 md:grid-cols-2 text-sm text-slate-300">
                    <div className="space-y-3 rounded-3xl border border-surface-800 bg-surface-900 p-5">
                      <p><span className="font-medium text-slate-100">Status:</span> {selectedInvoice.invoice_status}</p>
                      <p><span className="font-medium text-slate-100">MSISDN:</span> {selectedInvoice.msisdn}</p>
                      <p><span className="font-medium text-slate-100">Period:</span> {selectedInvoice.start} → {selectedInvoice.end}</p>
                      <p><span className="font-medium text-slate-100">Subtotal:</span> ${selectedInvoice.sub_total.toFixed(2)}</p>
                    </div>
                    <div className="space-y-3 rounded-3xl border border-surface-800 bg-surface-900 p-5">
                      <p><span className="font-medium text-slate-100">Tax:</span> ${selectedInvoice.tax.toFixed(2)}</p>
                      <p><span className="font-medium text-slate-100">Total:</span> ${selectedInvoice.total.toFixed(2)}</p>
                      <p className="text-slate-400">This modal shows the invoice breakdown and can be extended with line-item details when available.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Available plans</h3>
            <div className="space-y-4">
              {rateplans.map((plan, index) => {
                const price = Number(plan.plan_price ?? 0);
                const ror = Number(plan.ror ?? 0);
                const freeUnits = Number(plan.free_units ?? 0);
                const planKey = plan.rateplan_id ?? `${plan.name}-${index}`;

                return (
                  <div key={planKey} className="rounded-3xl border border-surface-800 bg-surface-900 p-4">
                    <p className="text-sm text-slate-400">{plan.name}</p>
                    <p className="mt-2 text-xl font-semibold text-white">${price.toFixed(2)}</p>
                    <p className="text-xs text-slate-500 mt-1">{ror}% rate · {freeUnits} free units</p>
                  </div>
                );
              })}
              {rateplans.length === 0 && <p className="text-sm text-slate-400">No plans loaded.</p>}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Available add-ons</h3>
            <div className="space-y-4">
              {services.slice(0, 3).map((service, index) => {
                const serviceKey = service.id ?? `${service.name}-${index}`;
                const price = Number(service.price ?? 0);
                const units = Number(service.units ?? 0);
                return (
                  <div key={serviceKey} className="rounded-3xl border border-surface-800 bg-surface-900 p-4">
                    <p className="text-sm text-slate-400">{service.name}</p>
                    <p className="mt-2 text-sm text-slate-200">Rate: ${price.toFixed(2)} · {units} units</p>
                    <p className="text-xs text-slate-500 mt-1">Type: {service.type}</p>
                  </div>
                );
              })}
              {services.length === 0 && <p className="text-sm text-slate-400">No service packages available.</p>}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Current fees</h3>
            <div className="space-y-4">
              {fees.slice(0, 3).map((fee, index) => {
                const feeKey = fee.id ?? `${fee.name}-${index}`;
                const amount = Number(fee.amount ?? 0);
                return (
                  <div key={feeKey} className="rounded-3xl border border-surface-800 bg-surface-900 p-4">
                    <p className="text-sm text-slate-400">{fee.name}</p>
                    <p className="mt-2 text-sm text-slate-200">${amount.toFixed(2)}</p>
                    <p className="text-xs text-slate-500 mt-1">{fee.type}</p>
                  </div>
                );
              })}
              {fees.length === 0 && <p className="text-sm text-slate-400">No fees loaded.</p>}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Support</h3>
            <div className="space-y-3 text-sm text-slate-300">
              <p>Need help with your invoice or plan? Contact customer support.</p>
              <p><span className="font-medium text-slate-100">Phone:</span> +20 123 456 7890</p>
              <p><span className="font-medium text-slate-100">Email:</span> support@telecom.example</p>
              <p className="text-slate-400">For urgent issues, please call our hotline or open a support ticket through the portal.</p>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Profile summary</h3>
            <div className="space-y-3 text-sm text-slate-300">
              <p><span className="font-medium text-slate-100">Name:</span> {profile?.customer_name ?? "—"}</p>
              <p><span className="font-medium text-slate-100">Email:</span> {session?.username}</p>
              <p><span className="font-medium text-slate-100">Current plan:</span> {profile?.rateplan_name ?? "None"}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
