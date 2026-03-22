import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button, Input, Modal, Badge, Label, Select, Textarea } from "@/components/ui-elements";
import { useListVideos, useCreateVideo, useUpdateVideo, useDeleteVideo, getListVideosQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Folder, Edit2, Trash2, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";

type VideoTypeFilter = "all" | "long_form" | "short_form";

export default function Videos() {
  const queryClient = useQueryClient();
  const { data: videos, isLoading } = useListVideos();
  const { mutate: createVideo, isPending: isCreating } = useCreateVideo({
    mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListVideosQueryKey() }); closeForm(); } }
  });
  const { mutate: updateVideo, isPending: isUpdating } = useUpdateVideo({
    mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListVideosQueryKey() }); closeForm(); } }
  });
  const { mutate: deleteVideo } = useDeleteVideo({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListVideosQueryKey() }) }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<VideoTypeFilter>("all");

  const [formData, setFormData] = useState({
    title: "", description: "", status: "planning", scheduledDate: "", folderLink: "", platform: "", tags: "", videoType: ""
  });

  const closeForm = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ title: "", description: "", status: "planning", scheduledDate: "", folderLink: "", platform: "", tags: "", videoType: "" });
  };

  const openEdit = (v: any) => {
    setEditingId(v.id);
    setFormData({
      title: v.title,
      description: v.description || "",
      status: v.status,
      scheduledDate: v.scheduledDate?.split("T")[0] || "",
      folderLink: v.folderLink || "",
      platform: v.platform || "",
      tags: v.tags || "",
      videoType: v.videoType || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      status: formData.status as any,
      videoType: formData.videoType || null,
      scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate).toISOString() : null,
      folderLink: formData.folderLink || null,
      description: formData.description || null,
      platform: formData.platform || null,
      tags: formData.tags || null,
    } as any;

    if (editingId) {
      updateVideo({ id: editingId, data: payload });
    } else {
      createVideo({ data: payload });
    }
  };

  const filteredVideos = (videos || []).filter(v => {
    if (typeFilter === "all") return true;
    return (v as any).videoType === typeFilter;
  });

  const filterBtnClass = (active: boolean) =>
    `px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
      active
        ? "bg-primary text-black"
        : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
    }`;

  return (
    <Layout title="Video Content">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground mr-3">Manage your video pipeline</p>
          <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-xl border border-white/5">
            <button className={filterBtnClass(typeFilter === "all")} onClick={() => setTypeFilter("all")}>All</button>
            <button className={filterBtnClass(typeFilter === "long_form")} onClick={() => setTypeFilter("long_form")}>Long Form</button>
            <button className={filterBtnClass(typeFilter === "short_form")} onClick={() => setTypeFilter("short_form")}>Short Form</button>
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Video
        </Button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-muted-foreground text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Video Title</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Scheduled</th>
                <th className="px-6 py-4">Platform</th>
                <th className="px-6 py-4">Assets</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">Loading videos...</td></tr>
              ) : filteredVideos.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">No videos found. Create one!</td></tr>
              ) : (
                filteredVideos.map((v) => (
                  <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{v.title}</td>
                    <td className="px-6 py-4">
                      {(v as any).videoType ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          (v as any).videoType === "long_form"
                            ? "bg-purple-500/10 text-purple-300 border border-purple-500/20"
                            : "bg-orange-500/10 text-orange-300 border border-orange-500/20"
                        }`}>
                          {(v as any).videoType === "long_form" ? "Long Form" : "Short Form"}
                        </span>
                      ) : <span className="text-muted-foreground">-</span>}
                    </td>
                    <td className="px-6 py-4"><Badge variant={v.status}>{v.status.replace("_", " ")}</Badge></td>
                    <td className="px-6 py-4 text-muted-foreground">{formatDate(v.scheduledDate)}</td>
                    <td className="px-6 py-4 text-muted-foreground">{v.platform || "-"}</td>
                    <td className="px-6 py-4">
                      {v.folderLink ? (
                        <a href={v.folderLink} target="_blank" rel="noreferrer" className="inline-flex items-center text-primary hover:text-primary/80 transition-colors">
                          <Folder className="w-4 h-4 mr-1" /> View Files <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      ) : <span className="text-muted-foreground">-</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(v)}>
                          <Edit2 className="w-4 h-4 text-blue-400" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                          if (confirm("Delete this video?")) deleteVideo({ id: v.id });
                        }}>
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeForm} title={editingId ? "Edit Video" : "Add New Video"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Title *</Label>
            <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="planning">Planning</option>
                <option value="in_production">In Production</option>
                <option value="review">Review</option>
                <option value="approved">Approved</option>
                <option value="published">Published</option>
              </Select>
            </div>
            <div>
              <Label>Video Type</Label>
              <Select value={formData.videoType} onChange={e => setFormData({...formData, videoType: e.target.value})}>
                <option value="">Not Set</option>
                <option value="long_form">Long Form</option>
                <option value="short_form">Short Form</option>
              </Select>
            </div>
          </div>
          <div>
            <Label>Scheduled Date</Label>
            <Input type="date" value={formData.scheduledDate} onChange={e => setFormData({...formData, scheduledDate: e.target.value})} />
          </div>
          <div>
            <Label>Platform (e.g. YouTube, TikTok)</Label>
            <Input value={formData.platform} onChange={e => setFormData({...formData, platform: e.target.value})} />
          </div>
          <div>
            <Label>Asset Folder Link (Dropbox/Drive)</Label>
            <Input type="url" placeholder="https://..." value={formData.folderLink} onChange={e => setFormData({...formData, folderLink: e.target.value})} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={closeForm}>Cancel</Button>
            <Button type="submit" disabled={isCreating || isUpdating}>
              {isCreating || isUpdating ? "Saving..." : "Save Video"}
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
