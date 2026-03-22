import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { useListVideos, useListShoots } from "@workspace/api-client-react";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, parseISO, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Video, Camera } from "lucide-react";
import { Button, Badge } from "@/components/ui-elements";

type VideoTypeFilter = "all" | "long_form" | "short_form";

export default function Calendar() {
  const { data: videos } = useListVideos();
  const { data: shoots } = useListShoots();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [videoTypeFilter, setVideoTypeFilter] = useState<VideoTypeFilter>("all");

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const filteredVideos = useMemo(() => {
    if (!videos) return [];
    if (videoTypeFilter === "all") return videos;
    return videos.filter(v => (v as any).videoType === videoTypeFilter);
  }, [videos, videoTypeFilter]);

  const getEventsForDay = (day: Date) => {
    const dayVideos = filteredVideos.filter(v => v.scheduledDate && isSameDay(parseISO(v.scheduledDate), day));
    const dayShoots = shoots?.filter(s => s.shootDate && isSameDay(parseISO(s.shootDate), day)) || [];
    return { dayVideos, dayShoots };
  };

  const filterBtnClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
      active
        ? "bg-primary text-black"
        : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
    }`;

  return (
    <Layout title="Content Calendar">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <p className="text-muted-foreground">Global view of all planned content</p>
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/5">
            <button className={filterBtnClass(videoTypeFilter === "all")} onClick={() => setVideoTypeFilter("all")}>All Videos</button>
            <button className={filterBtnClass(videoTypeFilter === "long_form")} onClick={() => setVideoTypeFilter("long_form")}>Long Form</button>
            <button className={filterBtnClass(videoTypeFilter === "short_form")} onClick={() => setVideoTypeFilter("short_form")}>Short Form</button>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-white/5 p-1 rounded-xl border border-white/5">
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="font-display font-semibold text-lg w-32 text-center text-white">
            {format(currentDate, "MMMM yyyy")}
          </span>
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-primary/30 inline-block" /><Video className="w-3 h-3" /> Video</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-500/30 inline-block" /><Camera className="w-3 h-3" /> Shoot</span>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        <div className="grid grid-cols-7 border-b border-white/10 bg-black/40">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 bg-[#111]">
          {days.map((day) => {
            const { dayVideos, dayShoots } = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[120px] p-2 border-r border-b border-white/5 transition-colors ${
                  !isCurrentMonth ? 'bg-black/40 text-white/20' : 'hover:bg-white/[0.02]'
                }`}
              >
                <div className={`text-right text-sm font-medium mb-2 ${isSameDay(day, new Date()) ? 'text-primary' : ''}`}>
                  {format(day, "d")}
                </div>
                <div className="space-y-1.5 overflow-y-auto max-h-[80px] pr-1 custom-scrollbar">
                  {dayVideos.map(v => (
                    <div key={`v-${v.id}`} className="px-2 py-1 bg-primary/10 border border-primary/20 rounded-md text-xs text-white truncate flex items-center gap-1.5 hover:bg-primary/20 cursor-pointer transition-colors" title={v.title}>
                      <Video className="w-3 h-3 text-primary shrink-0" />
                      <span className="truncate">{v.title}</span>
                    </div>
                  ))}
                  {dayShoots.map(s => (
                    <div key={`s-${s.id}`} className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-md text-xs text-white truncate flex items-center gap-1.5 hover:bg-blue-500/20 cursor-pointer transition-colors" title={s.title}>
                      <Camera className="w-3 h-3 text-blue-400 shrink-0" />
                      <span className="truncate">{s.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
