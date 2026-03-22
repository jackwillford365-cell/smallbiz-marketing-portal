import { Link, useLocation } from "wouter";
import { LayoutDashboard, Calendar, Video, Camera, CheckSquare, Mail, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/videos", label: "Videos", icon: Video },
  { href: "/shoots", label: "Shoots", icon: Camera },
  { href: "/approvals", label: "Approvals", icon: CheckSquare },
  { href: "/email-blast", label: "Email Blast", icon: Mail },
  { href: "/leads", label: "Leads", icon: Users },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 border-r border-white/5 bg-[#050505] hidden md:flex flex-col relative z-20">
      <div className="absolute top-0 left-0 w-full h-64 bg-primary/5 blur-[100px] pointer-events-none rounded-full -translate-y-1/2 -translate-x-1/2" />
      
      <div className="h-20 flex items-center px-6 border-b border-white/5 relative">
        <img 
          src={`${import.meta.env.BASE_URL}images/logo.png`} 
          alt="Smallbiz Logo" 
          className="w-8 h-8 mr-3"
        />
        <span className="font-display font-bold text-lg tracking-tight text-white">Smallbiz<span className="text-primary">Portal</span></span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">Menu</div>
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
              isActive 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:bg-white/5 hover:text-white"
            )}>
              <item.icon className={cn(
                "w-5 h-5 mr-3 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-white"
              )} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 border border-white/5">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            JD
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">Jane Doe</p>
            <p className="text-xs text-muted-foreground truncate">Marketing Director</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
