import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Download, Trash2, Shield, LogIn, RefreshCw,
  Mail, CheckCircle2, TrendingUp, ChevronLeft, ChevronRight
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function AdminWaitlist() {
  const { user, loading, isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  const { data: stats, refetch: refetchStats } = trpc.admin.getStats.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
    retry: false,
  });

  const { data: subData, refetch: refetchSubs, isLoading } = trpc.admin.getSubscribers.useQuery(
    { page, pageSize: PAGE_SIZE, verifiedOnly: true },
    { enabled: isAuthenticated && user?.role === "admin", retry: false }
  );

  const { data: csvData, refetch: fetchCsv } = trpc.admin.exportCsv.useQuery(undefined, {
    enabled: false,
    retry: false,
  });

  const deleteSubscriber = trpc.admin.deleteSubscriber.useMutation({
    onSuccess: () => {
      toast.success("Subscriber removed");
      refetchSubs();
      refetchStats();
    },
    onError: (err) => toast.error("Delete failed", { description: err.message }),
  });

  const handleExportCsv = async () => {
    const result = await fetchCsv();
    if (result.data?.csv) {
      const blob = new Blob([result.data.csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hero-waitlist-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${result.data.count} subscribers`);
    }
  };

  // Not logged in
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gold/40 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Admin Access Required</h2>
          <p className="text-muted-foreground mb-6">Sign in to access the Hero Letters dashboard.</p>
          <a
            href={getLoginUrl()}
            className="inline-flex items-center gap-2 px-6 py-3 font-accent text-sm tracking-wider bg-gradient-to-r from-[#C9A84C] to-[#A8893A] text-[oklch(0.12_0.02_260)] rounded"
          >
            <LogIn className="w-4 h-4" />
            SIGN IN
          </a>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-400/40 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground">This area is restricted to VETS admin accounts.</p>
          <a href="/" className="mt-4 inline-block text-gold hover:underline text-sm">← Back to site</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <a href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </a>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-gold" />
              <span className="font-accent tracking-wider text-foreground">HERO LETTERS</span>
              <span className="text-xs text-muted-foreground">Admin Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { refetchSubs(); refetchStats(); }}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-2 px-4 py-2 font-accent text-xs tracking-wider bg-gradient-to-r from-[#C9A84C] to-[#A8893A] text-[oklch(0.12_0.02_260)] rounded hover:shadow-[0_0_20px_oklch(0.75_0.12_85/0.3)] transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              EXPORT CSV
            </button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            {
              label: "Verified Subscribers",
              value: stats?.totalVerified ?? "—",
              icon: CheckCircle2,
              color: "text-green-400",
            },
            {
              label: "Total Sign-ups",
              value: stats?.totalAll ?? "—",
              icon: Users,
              color: "text-gold",
            },
            {
              label: "Sending Domain",
              value: "novareign.ai",
              icon: Mail,
              color: "text-blue-400",
            },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl p-5 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-accent font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Subscribers */}
        {stats?.recentSubscribers && stats.recentSubscribers.length > 0 && (
          <div className="mb-6 p-4 bg-card/50 border border-border rounded-xl">
            <p className="text-xs font-accent tracking-wider text-muted-foreground mb-3">MOST RECENT SIGN-UPS</p>
            <div className="flex flex-wrap gap-2">
              {stats.recentSubscribers.map((sub) => (
                <span key={sub.id} className="px-3 py-1 text-xs bg-[#C9A84C]/10 border border-[#C9A84C]/20 text-gold rounded-full">
                  {sub.email}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Subscriber Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-accent tracking-wider text-foreground text-sm">
              VERIFIED SUBSCRIBERS
              {subData && (
                <span className="ml-2 text-muted-foreground font-body font-normal text-xs">
                  ({subData.total} total)
                </span>
              )}
            </h2>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : subData?.subscribers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground">No verified subscribers yet.</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Share the waitlist link to start building your list.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-background/50">
                      <th className="text-left px-6 py-3 text-xs font-accent tracking-wider text-muted-foreground">#</th>
                      <th className="text-left px-6 py-3 text-xs font-accent tracking-wider text-muted-foreground">EMAIL</th>
                      <th className="text-left px-6 py-3 text-xs font-accent tracking-wider text-muted-foreground">VERIFIED AT</th>
                      <th className="text-left px-6 py-3 text-xs font-accent tracking-wider text-muted-foreground">IP</th>
                      <th className="text-right px-6 py-3 text-xs font-accent tracking-wider text-muted-foreground">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subData?.subscribers.map((sub, idx) => (
                      <tr
                        key={sub.id}
                        className="border-b border-border/50 hover:bg-card/80 transition-colors"
                      >
                        <td className="px-6 py-3 text-muted-foreground text-xs">
                          {(page - 1) * PAGE_SIZE + idx + 1}
                        </td>
                        <td className="px-6 py-3 text-foreground font-body">{sub.email}</td>
                        <td className="px-6 py-3 text-muted-foreground text-xs">
                          {sub.verifiedAt
                            ? new Date(sub.verifiedAt).toLocaleString()
                            : "—"}
                        </td>
                        <td className="px-6 py-3 text-muted-foreground text-xs font-mono">
                          {sub.ipAddress ?? "—"}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => {
                              if (confirm(`Remove ${sub.email} from waitlist?`)) {
                                deleteSubscriber.mutate({ id: sub.id });
                              }
                            }}
                            className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"
                            title="Remove subscriber"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {subData && subData.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Page {page} of {subData.totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(subData.totalPages, p + 1))}
                      disabled={page === subData.totalPages}
                      className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
