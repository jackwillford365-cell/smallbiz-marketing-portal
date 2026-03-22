import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Menu } from "lucide-react";
import { Button } from "./ui-elements";

export function Layout({ children, title }: { children: ReactNode, title?: string }) {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-white/5 flex items-center justify-between px-4 bg-[#0a0a0a]">
          <div className="flex items-center">
            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-6 h-6 mr-2" />
            <span className="font-display font-bold text-white tracking-tight">Smallbiz<span className="text-primary">Portal</span></span>
          </div>
          <Button variant="ghost" size="icon">
            <Menu className="w-5 h-5" />
          </Button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative z-10">
          {/* Subtle global gradient background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none -z-10" />
          
          <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-full">
            {title && (
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-8 tracking-tight">
                {title}
              </h1>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
