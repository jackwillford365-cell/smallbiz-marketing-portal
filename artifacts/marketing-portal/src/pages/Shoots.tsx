import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button, Input, Modal, Badge, Label, Select, Textarea } from "@/components/ui-elements";
import { useListShoots, useCreateShoot, useUpdateShoot, useDeleteShoot, getListShootsQueryKey, useListVideos } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, MapPin, Calendar as CalIcon, Edit2, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function Shoots() {
  const queryClient = useQueryClient();
  const { data: shoots, isLoading } = useListShoots();
  const { data: videos } = useListVideos();
  
  const { mutate: createShoot, isPending: isCreating } = useCreateShoot({
    mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListShootsQueryKey() }); closeForm(); } }
  });
  const { mutate: updateShoot, isPending: isUpdating } = useUpdateShoot({
    mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListShootsQueryKey() }); closeForm(); } }
  });
  const { mutate: deleteShoot } = useDeleteShoot({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListShootsQueryKey() }) }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    title: "", description: "", shootDate: "", location: "", status: "scheduled", videoId: "", notes: ""
  });

  const closeForm = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ title: "", description: "", shootDate: "", location: "", status: "scheduled", videoId: "", notes: "" });
  };

  const openEdit = (s: any) => {
    setEditingId(s.id);
    setFormData({
      title: s.title,
      description: s.description || "",
      shootDate: s.shootDate?.split("T")[0] || "",
      location: s.location || "",
      status: s.status,
      videoId: s.videoId ? String(s.videoId) : "",
      notes: s.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      status: formData.status as any,
      shootDate: new Date(formData.shootDate).toISOString(),
      videoId: formData.videoId ? parseInt(formData.videoId, 10) : null,
      description: formData.description || null,
      location: formData.location || null,
      notes: formData.notes || null,
    };

    if (editingId) {
      updateShoot({ id: editingId, data: payload });
    } else {
      createShoot({ data: payload });
    }
  };

  return (
    <Layout title="Shoot Scheduler">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">Coordinate timelines and locations</p>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Schedule Shoot
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p className="text-muted-foreground">Loading shoots...</p>
        ) : shoots?.length === 0 ? (
          <p className="text-muted-foreground col-span-3">No shoots scheduled.</p>
        ) : (
          shoots?.map(s => (
            <div key={s.id} className="glass-panel p-6 rounded-2xl hover-card-effect flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <Badge variant={s.status}>{s.status}</Badge>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(s)} className="p-1.5 text-muted-foreground hover:text-white transition-colors"><Edit2 className="w-4 h-4"/></button>
                  <button onClick={() => { if(confirm("Delete shoot?")) deleteShoot({ id: s.id }) }} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4"/></button>
                </div>
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-2">{s.title}</h3>
              <div className="space-y-2 mb-6 flex-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalIcon className="w-4 h-4 mr-2 text-primary" /> {formatDate(s.shootDate)}
                </div>
                {s.location && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2 text-primary" /> {s.location}
                  </div>
                )}
                {s.videoTitle && (
                  <div className="inline-block mt-2 px-2 py-1 bg-white/5 rounded text-xs">
                    Linked: <span className="text-white">{s.videoTitle}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeForm} title={editingId ? "Edit Shoot" : "Schedule Shoot"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Shoot Title *</Label>
            <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date *</Label>
              <Input required type="date" value={formData.shootDate} onChange={e => setFormData({...formData, shootDate: e.target.value})} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>
          </div>
          <div>
            <Label>Location</Label>
            <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
          </div>
          <div>
            <Label>Link to Video Content</Label>
            <Select value={formData.videoId} onChange={e => setFormData({...formData, videoId: e.target.value})}>
              <option value="">-- No Video Linked --</option>
              {videos?.map(v => (
                <option key={v.id} value={v.id}>{v.title}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={closeForm}>Cancel</Button>
            <Button type="submit" disabled={isCreating || isUpdating}>
              {isCreating || isUpdating ? "Saving..." : "Save Shoot"}
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
