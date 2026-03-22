import { Layout } from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { Mail, Send, FileText, Eye, MousePointerClick, AlertCircle, ExternalLink, TrendingUp } from "lucide-react";
import { formatDate } from "@/lib/utils";

async function fetchHubspot(path: string) {
  const res = await fetch(`/api${path}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

function statCard(icon: any, label: string, value: string | number, color: string) {
  const Icon = icon;
  return (
    <div className="glass-panel rounded-xl p-4 flex items-center gap-4">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div>
        <p className="text-xl font-bold text-white">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function stateBadge(state: string) {
  const map: Record<string, string> = {
    SENT: "bg-primary/10 text-primary border-primary/20",
    DRAFT: "bg-white/5 text-muted-foreground border-white/10",
    SCHEDULED: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    PUBLISHED: "bg-primary/10 text-primary border-primary/20",
    AUTOMATED: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  };
  const cls = map[state?.toUpperCase()] || "bg-white/5 text-muted-foreground border-white/10";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {state || "Unknown"}
    </span>
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
          Connect your HubSpot account to view email campaign analytics, open rates, and click-through data.
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

export default function EmailBlast() {
  const { data: status } = useQuery({
    queryKey: ["hubspot-status"],
    queryFn: () => fetchHubspot("/hubspot/status"),
    retry: false,
  });

  const { data: campaignsData, isLoading, error } = useQuery({
    queryKey: ["hubspot-email-campaigns"],
    queryFn: () => fetchHubspot("/hubspot/email-campaigns"),
    enabled: status?.connected === true,
    retry: false,
  });

  const connected = status?.connected === true;
  const campaigns = campaignsData?.campaigns || [];

  const sent = campaigns.filter((c: any) => c.state === "SENT" || c.state === "PUBLISHED").length;
  const drafts = campaigns.filter((c: any) => c.state === "DRAFT").length;
  const scheduled = campaigns.filter((c: any) => c.state === "SCHEDULED").length;

  return (
    <Layout title="Email Blast">
      <p className="text-muted-foreground mb-6">Track your email marketing campaigns via HubSpot</p>

      {!connected && status !== undefined ? (
        <HubSpotNotConnected />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {statCard(Mail, "Total Campaigns", isLoading ? "..." : campaigns.length, "bg-primary/10 text-primary")}
            {statCard(Send, "Sent", isLoading ? "..." : sent, "bg-green-500/10 text-green-400")}
            {statCard(FileText, "Drafts", isLoading ? "..." : drafts, "bg-white/5 text-muted-foreground")}
            {statCard(TrendingUp, "Scheduled", isLoading ? "..." : scheduled, "bg-blue-500/10 text-blue-400")}
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-semibold text-white">Email Campaigns</h3>
              <a
                href="https://app.hubspot.com/email"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
              >
                Open in HubSpot <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white/5 text-muted-foreground text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Campaign Name</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Send Date</th>
                    <th className="px-6 py-4">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoading ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading campaigns from HubSpot...</td></tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-orange-400" />
                          <p className="text-orange-400 text-sm">Marketing Email access requires the Content scope in HubSpot.</p>
                          <p className="text-muted-foreground text-xs">You may need to reconnect HubSpot with additional permissions.</p>
                        </div>
                      </td>
                    </tr>
                  ) : campaigns.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No email campaigns found in HubSpot.</td></tr>
                  ) : (
                    campaigns.map((c: any) => (
                      <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-medium text-white">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Mail className="w-3.5 h-3.5 text-primary" />
                            </div>
                            {c.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground max-w-xs truncate">{c.subject || "—"}</td>
                        <td className="px-6 py-4">{stateBadge(c.state)}</td>
                        <td className="px-6 py-4 text-muted-foreground">{c.sendDate ? formatDate(c.sendDate) : "—"}</td>
                        <td className="px-6 py-4 text-muted-foreground">{formatDate(c.updatedAt)}</td>
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
