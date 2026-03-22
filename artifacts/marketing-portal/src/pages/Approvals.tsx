import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button, Input, Modal, Badge, Label, Select, Textarea } from "@/components/ui-elements";
import { useListApprovals, useUpdateApproval, getListApprovalsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle, AlertCircle, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function Approvals() {
  const queryClient = useQueryClient();
  const { data: approvals, isLoading } = useListApprovals();
  const { mutate: updateApproval, isPending } = useUpdateApproval({
    mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListApprovalsQueryKey() }); closeForm(); } }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeApproval, setActiveApproval] = useState<any>(null);
  const [formData, setFormData] = useState({ status: "", reviewerName: "", comments: "" });

  const openReview = (a: any) => {
    setActiveApproval(a);
    setFormData({
      status: a.status,
      reviewerName: a.reviewerName || "",
      comments: a.comments || "",
    });
    setIsModalOpen(true);
  };

  const closeForm = () => {
    setIsModalOpen(false);
    setActiveApproval(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApproval) return;
    updateApproval({
      id: activeApproval.id,
      data: {
        status: formData.status as any,
        reviewerName: formData.reviewerName || null,
        comments: formData.comments || null
      }
    });
  };

  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock className="w-5 h-5 text-yellow-500" />,
    approved: <CheckCircle2 className="w-5 h-5 text-primary" />,
    rejected: <XCircle className="w-5 h-5 text-red-500" />,
    revision_requested: <AlertCircle className="w-5 h-5 text-orange-500" />,
  };

  return (
    <Layout title="Content Approvals">
      <div className="mb-6">
        <p className="text-muted-foreground">Review and approve video content</p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <p className="text-muted-foreground">Loading approvals...</p>
        ) : approvals?.length === 0 ? (
          <div className="glass-panel p-8 text-center rounded-2xl">
            <CheckCircle2 className="w-12 h-12 text-primary/50 mx-auto mb-3" />
            <p className="text-lg font-medium text-white">All caught up!</p>
            <p className="text-muted-foreground">No pending approvals.</p>
          </div>
        ) : (
          approvals?.map(a => (
            <div key={a.id} className="glass-panel p-5 rounded-2xl hover-card-effect flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-white/5 p-2 rounded-xl">
                  {statusIcons[a.status]}
                </div>
                <div>
                  <h3 className="text-lg font-display font-semibold text-white">{a.videoTitle}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                    <span>Submitted: {formatDate(a.submittedAt)}</span>
                    {a.reviewerName && <span>Reviewer: {a.reviewerName}</span>}
                  </div>
                  {a.comments && (
                    <div className="mt-3 p-3 bg-black/40 rounded-lg text-sm italic border-l-2 border-primary/50">
                      "{a.comments}"
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                <Badge variant={a.status} className="md:mr-4">{a.status.replace("_", " ")}</Badge>
                <Button variant="outline" onClick={() => openReview(a)} className="w-full md:w-auto">
                  Review
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeForm} title="Review Content">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 mb-6">
            <p className="text-sm text-primary mb-1 font-semibold">Video Under Review:</p>
            <p className="text-lg font-display text-white">{activeApproval?.videoTitle}</p>
          </div>
          
          <div>
            <Label>Approval Decision</Label>
            <Select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="pending">Pending</option>
              <option value="approved">Approve</option>
              <option value="revision_requested">Request Revision</option>
              <option value="rejected">Reject</option>
            </Select>
          </div>
          <div>
            <Label>Your Name</Label>
            <Input placeholder="Reviewer name" value={formData.reviewerName} onChange={e => setFormData({...formData, reviewerName: e.target.value})} />
          </div>
          <div>
            <Label>Feedback / Comments</Label>
            <Textarea placeholder="Required for revisions..." value={formData.comments} onChange={e => setFormData({...formData, comments: e.target.value})} />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={closeForm}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
