import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { LogOut, FileCode, Cog, RefreshCw, CheckCircle, FileText, Settings, Search, Save, RotateCcw, History, Code, Eye, Edit, Clock, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

type ConfigMapVersion = {
  id: number;
  timestamp: string;
  editor: string;
  changes: string;
  data: string;
};

type ConfigMap = {
  id: number;
  name: string;
  deployment: string;
  namespace: string;
  lastModified: string;
  size: string;
  data: string;
  versions: ConfigMapVersion[];
};

const configMaps: ConfigMap[] = [
  {
    id: 1,
    name: "myapp-config",
    deployment: "myapp-deployment",
    namespace: "production",
    lastModified: "2024-02-14 10:30",
    size: "2.3 KB",
    data: `{"server":{"port":8080,"host":"0.0.0.0","timeout":30000},"database":{"connectionString":"mongodb://localhost:27017","maxPoolSize":10,"retryWrites":true},"logging":{"level":"info","format":"json","destination":"stdout"},"features":{"enableCache":true,"enableMetrics":true,"enableHealthCheck":true}}`,
    versions: [
      {
        id: 1,
        timestamp: "2024-02-14 10:30",
        editor: "john.doe@company.com",
        changes: "Updated server timeout from 20000 to 30000",
        data: `{"server":{"port":8080,"host":"0.0.0.0","timeout":30000},"database":{"connectionString":"mongodb://localhost:27017","maxPoolSize":10,"retryWrites":true},"logging":{"level":"info","format":"json","destination":"stdout"},"features":{"enableCache":true,"enableMetrics":true,"enableHealthCheck":true}}`
      },
      {
        id: 2,
        timestamp: "2024-02-13 15:20",
        editor: "jane.smith@company.com",
        changes: "Enabled metrics and health check features",
        data: `{"server":{"port":8080,"host":"0.0.0.0","timeout":20000},"database":{"connectionString":"mongodb://localhost:27017","maxPoolSize":10,"retryWrites":true},"logging":{"level":"info","format":"json","destination":"stdout"},"features":{"enableCache":true,"enableMetrics":true,"enableHealthCheck":true}}`
      },
      {
        id: 3,
        timestamp: "2024-02-12 09:15",
        editor: "john.doe@company.com",
        changes: "Changed log level to info",
        data: `{"server":{"port":8080,"host":"0.0.0.0","timeout":20000},"database":{"connectionString":"mongodb://localhost:27017","maxPoolSize":10,"retryWrites":true},"logging":{"level":"info","format":"json","destination":"stdout"},"features":{"enableCache":true,"enableMetrics":false,"enableHealthCheck":false}}`
      }
    ]
  },
  {
    id: 2,
    name: "worker-config",
    deployment: "worker-deployment",
    namespace: "production",
    lastModified: "2024-02-13 14:45",
    size: "1.8 KB",
    data: `{"worker":{"concurrency":5,"timeout":60000,"retryAttempts":3},"queue":{"name":"default","priority":"normal","prefetch":10},"monitoring":{"enabled":true,"interval":5000}}`,
    versions: [
      {
        id: 1,
        timestamp: "2024-02-13 14:45",
        editor: "admin@company.com",
        changes: "Increased worker concurrency to 5",
        data: `{"worker":{"concurrency":5,"timeout":60000,"retryAttempts":3},"queue":{"name":"default","priority":"normal","prefetch":10},"monitoring":{"enabled":true,"interval":5000}}`
      },
      {
        id: 2,
        timestamp: "2024-02-11 11:30",
        editor: "john.doe@company.com",
        changes: "Enabled monitoring",
        data: `{"worker":{"concurrency":3,"timeout":60000,"retryAttempts":3},"queue":{"name":"default","priority":"normal","prefetch":10},"monitoring":{"enabled":true,"interval":5000}}`
      }
    ]
  },
  {
    id: 3,
    name: "api-config",
    deployment: "api-deployment",
    namespace: "production",
    lastModified: "2024-02-15 08:00",
    size: "3.1 KB",
    data: `{"api":{"version":"v1","basePath":"/api","rateLimit":{"enabled":true,"maxRequests":100,"windowMs":60000}},"cors":{"enabled":true,"origins":["https://example.com","https://app.example.com"],"methods":["GET","POST","PUT","DELETE"]},"authentication":{"type":"jwt","expiresIn":"1h","refreshTokenExpiry":"7d"},"cache":{"ttl":300,"maxSize":1000}}`,
    versions: [
      {
        id: 1,
        timestamp: "2024-02-15 08:00",
        editor: "jane.smith@company.com",
        changes: "Added rate limiting configuration",
        data: `{"api":{"version":"v1","basePath":"/api","rateLimit":{"enabled":true,"maxRequests":100,"windowMs":60000}},"cors":{"enabled":true,"origins":["https://example.com","https://app.example.com"],"methods":["GET","POST","PUT","DELETE"]},"authentication":{"type":"jwt","expiresIn":"1h","refreshTokenExpiry":"7d"},"cache":{"ttl":300,"maxSize":1000}}`
      }
    ]
  },
  {
    id: 4,
    name: "cache-config",
    deployment: "cache-deployment",
    namespace: "production",
    lastModified: "2024-02-10 16:20",
    size: "1.2 KB",
    data: `{"redis":{"host":"redis-service","port":6379,"maxRetries":3,"retryDelay":500},"ttl":{"default":3600,"sessions":86400,"temp":300}}`,
    versions: [
      {
        id: 1,
        timestamp: "2024-02-10 16:20",
        editor: "admin@company.com",
        changes: "Initial configuration",
        data: `{"redis":{"host":"redis-service","port":6379,"maxRetries":3,"retryDelay":500},"ttl":{"default":3600,"sessions":86400,"temp":300}}`
      }
    ]
  },
  {
    id: 5,
    name: "scheduler-config",
    deployment: "scheduler-deployment",
    namespace: "production",
    lastModified: "2024-02-14 12:00",
    size: "1.5 KB",
    data: `{"scheduler":{"enabled":true,"timezone":"UTC","jobs":[{"name":"cleanup","cron":"0 2 * * *","enabled":true},{"name":"backup","cron":"0 0 * * *","enabled":true},{"name":"reports","cron":"0 8 * * 1","enabled":false}]}}`,
    versions: [
      {
        id: 1,
        timestamp: "2024-02-14 12:00",
        editor: "john.doe@company.com",
        changes: "Disabled weekly reports job",
        data: `{"scheduler":{"enabled":true,"timezone":"UTC","jobs":[{"name":"cleanup","cron":"0 2 * * *","enabled":true},{"name":"backup","cron":"0 0 * * *","enabled":true},{"name":"reports","cron":"0 8 * * 1","enabled":false}]}}`
      },
      {
        id: 2,
        timestamp: "2024-02-13 09:30",
        editor: "jane.smith@company.com",
        changes: "Added backup and reports jobs",
        data: `{"scheduler":{"enabled":true,"timezone":"UTC","jobs":[{"name":"cleanup","cron":"0 2 * * *","enabled":true},{"name":"backup","cron":"0 0 * * *","enabled":true},{"name":"reports","cron":"0 8 * * 1","enabled":true}]}}`
      }
    ]
  }
];

export function ConfigManagementPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConfigMap, setSelectedConfigMap] = useState<ConfigMap | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState("");
  const [viewMode, setViewMode] = useState<"view" | "edit" | "history">("view");
  const [selectedVersion, setSelectedVersion] = useState<ConfigMapVersion | null>(null);
  const [jsonError, setJsonError] = useState<string>("");

  const handleLogout = () => {
    navigate("/");
  };

  const handleViewConfigMap = (configMap: ConfigMap) => {
    setSelectedConfigMap(configMap);
    setEditedData(configMap.data);
    setViewMode("view");
    setIsEditing(false);
    setJsonError("");
  };

  const handleEditConfigMap = () => {
    setViewMode("edit");
    setIsEditing(true);
  };

  const handleBeautifyJSON = () => {
    try {
      const parsed = JSON.parse(editedData);
      const beautified = JSON.stringify(parsed, null, 2);
      setEditedData(beautified);
      setJsonError("");
    } catch (error) {
      setJsonError("Invalid JSON format. Please check your syntax.");
    }
  };

  const handleSaveConfigMap = () => {
    try {
      // Validate JSON
      JSON.parse(editedData);
      
      // Here you would save to OpenShift
      console.log("Saving ConfigMap:", editedData);
      
      // Update local state
      if (selectedConfigMap) {
        selectedConfigMap.data = editedData;
        selectedConfigMap.lastModified = new Date().toISOString().slice(0, 16).replace("T", " ");
      }
      
      setIsEditing(false);
      setViewMode("view");
      setJsonError("");
    } catch (error) {
      setJsonError("Cannot save invalid JSON. Please fix the errors first.");
    }
  };

  const handleCancelEdit = () => {
    if (selectedConfigMap) {
      setEditedData(selectedConfigMap.data);
    }
    setIsEditing(false);
    setViewMode("view");
    setJsonError("");
  };

  const handleViewHistory = () => {
    setViewMode("history");
  };

  const handleRestoreVersion = (version: ConfigMapVersion) => {
    setEditedData(version.data);
    setSelectedConfigMap(prev => prev ? { ...prev, data: version.data } : null);
    setViewMode("view");
    setSelectedVersion(null);
  };

  const filteredConfigMaps = configMaps.filter(cm =>
    cm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cm.deployment.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getBeautifiedJSON = (jsonString: string) => {
    try {
      return JSON.stringify(JSON.parse(jsonString), null, 2);
    } catch {
      return jsonString;
    }
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
                <Button variant="ghost" className="gap-2 bg-indigo-50">
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
      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl mb-2">Config Management</h2>
            <p className="text-gray-600">
              Manage OpenShift ConfigMaps for all deployments. View, edit, beautify JSON, and track configuration history.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by ConfigMap name or deployment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total ConfigMaps</CardDescription>
                <CardTitle className="text-3xl">{configMaps.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Deployments</CardDescription>
                <CardTitle className="text-3xl">
                  {new Set(configMaps.map(cm => cm.deployment)).size}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Namespace</CardDescription>
                <CardTitle className="text-xl">production</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Last Modified</CardDescription>
                <CardTitle className="text-base">
                  {configMaps[0]?.lastModified || "N/A"}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* ConfigMaps List */}
          <div className="space-y-3">
            {filteredConfigMaps.map((configMap) => (
              <Card key={configMap.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">{configMap.name}</CardTitle>
                        <Badge variant="secondary">{configMap.size}</Badge>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Deployment:</span>
                          <span className="ml-2 font-medium">{configMap.deployment}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Namespace:</span>
                          <span className="ml-2 font-medium">{configMap.namespace}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Last Modified:</span>
                          <span className="ml-2 font-medium">{configMap.lastModified}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Versions:</span>
                          <span className="ml-2 font-medium">{configMap.versions.length}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleViewConfigMap(configMap)}
                      className="gap-2"
                    >
                      <Eye className="size-4" />
                      View/Edit
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* ConfigMap Viewer/Editor Dialog */}
      <Dialog open={selectedConfigMap !== null} onOpenChange={() => {
        setSelectedConfigMap(null);
        setIsEditing(false);
        setViewMode("view");
        setJsonError("");
      }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code className="size-5 text-indigo-600" />
              {selectedConfigMap?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedConfigMap?.deployment} • {selectedConfigMap?.namespace}
            </DialogDescription>
          </DialogHeader>

          {selectedConfigMap && (
            <div className="space-y-4 py-4">
              {/* Action Tabs */}
              <div className="flex items-center gap-2 border-b pb-3">
                <Button
                  variant={viewMode === "view" || viewMode === "edit" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("view")}
                  className="gap-2"
                >
                  <Eye className="size-4" />
                  {isEditing ? "Edit" : "View"} Config
                </Button>
                <Button
                  variant={viewMode === "history" ? "default" : "outline"}
                  size="sm"
                  onClick={handleViewHistory}
                  className="gap-2"
                >
                  <History className="size-4" />
                  History ({selectedConfigMap.versions.length})
                </Button>
              </div>

              {/* View/Edit Mode */}
              {(viewMode === "view" || viewMode === "edit") && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Configuration Data (JSON)</Label>
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <Button variant="outline" size="sm" onClick={handleBeautifyJSON} className="gap-2">
                            <Code className="size-4" />
                            Beautify JSON
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleCancelEdit} className="gap-2">
                            <RotateCcw className="size-4" />
                            Cancel
                          </Button>
                          <Button variant="default" size="sm" onClick={handleSaveConfigMap} className="gap-2">
                            <Save className="size-4" />
                            Save Changes
                          </Button>
                        </>
                      ) : (
                        <Button variant="default" size="sm" onClick={handleEditConfigMap} className="gap-2">
                          <Edit className="size-4" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>

                  {jsonError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">{jsonError}</p>
                    </div>
                  )}

                  {isEditing ? (
                    <Textarea
                      value={editedData}
                      onChange={(e) => setEditedData(e.target.value)}
                      className="font-mono text-sm min-h-[500px] resize-y"
                      placeholder="Enter JSON configuration..."
                    />
                  ) : (
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm font-mono whitespace-pre">
                        {getBeautifiedJSON(editedData)}
                      </pre>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg text-sm">
                    <div>
                      <p className="text-gray-600">Last Modified</p>
                      <p className="font-medium">{selectedConfigMap.lastModified}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Size</p>
                      <p className="font-medium">{selectedConfigMap.size}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Version History</p>
                      <p className="font-medium">{selectedConfigMap.versions.length} versions</p>
                    </div>
                  </div>
                </div>
              )}

              {/* History Mode */}
              {viewMode === "history" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-semibold">Configuration History</h3>
                    <Badge variant="secondary">{selectedConfigMap.versions.length} versions</Badge>
                  </div>

                  {selectedConfigMap.versions.map((version) => (
                    <Card key={version.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <Clock className="size-4 text-gray-500" />
                                <span className="font-semibold">{version.timestamp}</span>
                              </div>
                              <Badge variant="outline" className="gap-1">
                                <User className="size-3" />
                                {version.editor}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Changes:</span> {version.changes}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedVersion(version)}
                              className="gap-2"
                            >
                              <Eye className="size-3" />
                              View
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleRestoreVersion(version)}
                              className="gap-2"
                            >
                              <RotateCcw className="size-3" />
                              Restore
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Version Preview Dialog */}
      <Dialog open={selectedVersion !== null} onOpenChange={() => setSelectedVersion(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Version Preview</DialogTitle>
            <DialogDescription>
              {selectedVersion?.timestamp} • {selectedVersion?.editor}
            </DialogDescription>
          </DialogHeader>

          {selectedVersion && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Changes:</span> {selectedVersion.changes}
                </p>
              </div>

              <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm font-mono whitespace-pre">
                  {getBeautifiedJSON(selectedVersion.data)}
                </pre>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => {
                    handleRestoreVersion(selectedVersion);
                  }}
                  className="flex-1 gap-2"
                >
                  <RotateCcw className="size-4" />
                  Restore This Version
                </Button>
                <Button onClick={() => setSelectedVersion(null)} variant="outline">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}