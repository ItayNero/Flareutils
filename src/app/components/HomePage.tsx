import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { LogOut, FileCode, Cog, RefreshCw, CheckCircle, FileText, LayoutDashboard, User } from "lucide-react";

export function HomePage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="size-full flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <div className="flex-shrink-0">
                <h1 className="font-semibold text-xl text-indigo-600">MyWebsite</h1>
              </div>
              <div className="hidden md:flex items-center gap-1">
                <Button variant="ghost" className="gap-2" onClick={() => navigate("/scripts")}>
                  <FileCode className="size-4" />
                  Scripts
                </Button>
                <Button variant="ghost" className="gap-2" onClick={() => navigate("/config")}>
                  <Cog className="size-4" />
                  Config Management
                </Button>
                <Button variant="ghost" className="gap-2" onClick={() => navigate("/failover")}>
                  <RefreshCw className="size-4" />
                  Automatic Failover
                </Button>
                <Button variant="ghost" className="gap-2" onClick={() => navigate("/system-check")}>
                  <CheckCircle className="size-4" />
                  System Check
                </Button>
                <Button variant="ghost" className="gap-2" onClick={() => navigate("/rules")}>
                  <FileText className="size-4" />
                  Rules Management
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut className="size-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 overflow-y-auto flex items-center justify-center">
        <div className="text-center">
          <LayoutDashboard className="size-24 text-indigo-600 mx-auto mb-6" />
          <h1 className="text-4xl mb-4">Welcome to MyWebsite</h1>
          <p className="text-xl text-gray-600 mb-8">Select a page from the navigation menu</p>
        </div>
      </main>
    </div>
  );
}
