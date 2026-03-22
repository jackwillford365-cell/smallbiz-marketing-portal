import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { Users, TrendingUp, Briefcase, Mail, Phone, Building2, AlertCircle, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";

type Period = "this_month" | "last_month" | "last_3_months" | "last_6_months" | "all";

const PERIOD_LABELS: Record<Period, string> = {
  this_month: "This Month",
  last_month: "Last Month",
  last_3_months: "Last 3 Months",
  last_6_months: "Last 6 Months",
  all: "All Time",
};

async function fetchHubspot(path: string) {
  const res = await fetch(`/api${path}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

function StatCard({ icon: Icon, label, value, color, period, onPeriodChange, periods }: any) {
  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {periods && (
          <select
            value={period}
            onChange={e => onPeriodChange(e.target.value as Period)}
            className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-muted-foreground focus:outline-none focus:border-primary/40"
          >
            {Object.entries(PERIOD_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold text-white">{value ?? "—"}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function HubSpotNotConnected() {
  return (
    <div className="glass-panel rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
        <AlertCircle className="w-7 h-7 text-orange-400" />
      </div>
      <div>
        <p className="text-white font-semibold text-lg">HubSpot Not Connected</p>
        <p className="text-muted-foreground text-sm mt-1 max-w-sm">
          Connect your HubSpot account to track leads and deals. Ask your workspace admin to complete the HubSpot integration.
        </p>
      </div>
      <a
        href="https://app.hubspot.com"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 text-sm hover:bg-orange-500/20 transition-colors"
      >
        Open HubSpot <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}

function stageBadge(stage: string) {
  const map: Record<string, string> = {
    lead: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
    subscriber: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    marketingqualifiedlead: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    salesqualifiedlead: "bg-primary/10 text-primary border-primary/20",
    opportunity: "bg-green-500/10 text-green-300 border-green-500/20",
    customer: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  };
  const cls = map[stage?.toLowerCase()] || "bg-white/5 text-muted-foreground border-white/10";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {stage ? stage.replace(/([a-z])([A-Z])/g, "$1 $2") : "Lead"}
    </span>
  );
}

export default function Leads() {
  const [leadPeriod, setLeadPeriod] = useState<Period>("this_month");
  const [dealPeriod, setDealPeriod] = useState<Period>("this_month");

  const { data: status } = useQuery({
    queryKey: ["hubspot-status"],
    queryFn: () => fetchHubspot("/hubspot/status"),
    retry: false,
  });

  const { data: leadsData, isLoading: leadsLoading, error: leadsError } = useQuery({
    queryKey: ["hubspot-leads", leadPeriod],
    queryFn: () => fetchHubspot(`/hubspot/leads?period=${leadPeriod}`),
    enabled: status?.connected === true,
    retry: false,
  });

  const { data: dealsData, isLoading: dealsLoading, error: dealsError } = useQuery({
    queryKey: ["hubspot-deals", dealPeriod],
    queryFn: () => fetchHubspot(`/hubspot/deals?period=${dealPeriod}`),
    enabled: status?.connected === true,
    retry: false,
  });

  const connected = status?.connected === true;

  return (
    <Layout title="Leads">
      <p className="text-muted-foreground mb-6">Track your leads and deals from HubSpot</p>

      {!connected && status !== undefined ? (
        <HubSpotNotConnected />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <StatCard
              icon={Users}
              label={`New Leads — ${PERIOD_LABELS[leadPeriod]}`}
              value={leadsLoading ? "..." : leadsData?.total}
              color="bg-primary/10 text-primary"
              period={leadPeriod}
              onPeriodChange={setLeadPeriod}
              periods={PERIOD_LABELS}
            />
            <StatCard
              icon={Briefcase}
              label={`New Deals Created — ${PERIOD_LABELS[dealPeriod]}`}
              value={dealsLoading ? "..." : dealsData?.total}
              color="bg-purple-500/10 text-purple-400"
              period={dealPeriod}
              onPeriodChange={setDealPeriod}
              periods={PERIOD_LABELS}
            />
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-semibold text-white">All Leads</h3>
              <span className="text-xs text-muted-foreground">{leadsData?.leads?.length ?? 0} contacts</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white/5 text-muted-foreground text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Company</th>
                    <th className="px-6 py-4">Stage</th>
                    <th className="px-6 py-4">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leadsLoading ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading leads from HubSpot...</td></tr>
                  ) : leadsError ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-red-400">Failed to load leads. Check your HubSpot connection.</td></tr>
                  ) : leadsData?.leads?.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No leads found for this period.</td></tr>
                  ) : (
                    leadsData?.leads?.map((lead: any) => (
                      <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-medium text-white">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                              {lead.name.charAt(0)}
                            </div>
                            {lead.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {lead.email ? (
                            <a href={`mailto:${lead.email}`} className="flex items-center gap-1 hover:text-white transition-colors">
                              <Mail className="w-3.5 h-3.5" /> {lead.email}
                            </a>
                          ) : "—"}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {lead.company ? (
                            <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {lead.company}</span>
                          ) : "—"}
                        </td>
                        <td className="px-6 py-4">{stageBadge(lead.stage)}</td>
                        <td className="px-6 py-4 text-muted-foreground">{formatDate(lead.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
