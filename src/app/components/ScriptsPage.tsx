import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { LogOut, FileCode, Cog, RefreshCw, CheckCircle, FileText, Database, Trash2, MessageSquare, Loader2, Check, X, Clock, AlertCircle, FileJson, Download, Filter, Send, Eye, Search, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Checkbox } from "./ui/checkbox";
import { Textarea } from "./ui/textarea";

const replicasets = [
  { id: 1, name: "myapp-deployment-1", pods: "3/3", deployment: "myapp-deployment", created: "2024-01-15", status: "Active", lastAccessed: "2 hours ago" },
  { id: 2, name: "myapp-deployment-2", pods: "0/0", deployment: "myapp-deployment", created: "2024-02-01", status: "Inactive", lastAccessed: "15 days ago" },
  { id: 3, name: "myapp-deployment-3", pods: "0/0", deployment: "myapp-deployment", created: "2024-01-20", status: "Inactive", lastAccessed: "30 days ago" },
  { id: 4, name: "worker-deployment-5", pods: "2/2", deployment: "worker-deployment", created: "2024-01-10", status: "Active", lastAccessed: "1 hour ago" },
  { id: 5, name: "worker-deployment-6", pods: "0/0", deployment: "worker-deployment", created: "2024-02-10", status: "Inactive", lastAccessed: "45 days ago" },
  { id: 6, name: "api-deployment-8", pods: "0/0", deployment: "api-deployment", created: "2023-12-01", status: "Inactive", lastAccessed: "90 days ago" },
  { id: 7, name: "api-deployment-9", pods: "0/0", deployment: "api-deployment", created: "2024-01-05", status: "Inactive", lastAccessed: "60 days ago" },
  { id: 8, name: "cache-deployment-4", pods: "1/1", deployment: "cache-deployment", created: "2024-02-12", status: "Active", lastAccessed: "30 minutes ago" },
  { id: 9, name: "queue-deployment-7", pods: "0/0", deployment: "queue-deployment", created: "2024-01-25", status: "Inactive", lastAccessed: "50 days ago" },
  { id: 10, name: "scheduler-deployment-2", pods: "0/0", deployment: "scheduler-deployment", created: "2024-02-08", status: "Inactive", lastAccessed: "20 days ago" },
];

type ConnectionConfig = {
  id: string;
  name: string;
  type: string;
  status: "connected" | "disconnected" | "error";
  host: string;
  port: string;
  username: string;
  database?: string;
  lastChecked: string;
};

const initialConnections: ConnectionConfig[] = [
  {
    id: "mongodb",
    name: "MongoDB",
    type: "Database",
    status: "connected",
    host: "mongodb.production.local",
    port: "27017",
    username: "admin",
    database: "main_db",
    lastChecked: "2 minutes ago"
  },
  {
    id: "redis",
    name: "Redis Cache",
    type: "Cache",
    status: "connected",
    host: "redis.production.local",
    port: "6379",
    username: "default",
    lastChecked: "5 minutes ago"
  },
  {
    id: "rabbitmq",
    name: "RabbitMQ",
    type: "Message Queue",
    status: "connected",
    host: "rabbitmq.production.local",
    port: "5672",
    username: "admin",
    lastChecked: "1 minute ago"
  },
  {
    id: "kafka",
    name: "Kafka Broker",
    type: "Message Streaming",
    status: "connected",
    host: "kafka.production.local",
    port: "9092",
    username: "kafka-admin",
    lastChecked: "3 minutes ago"
  },
  {
    id: "postgresql",
    name: "PostgreSQL",
    type: "Database",
    status: "disconnected",
    host: "postgres.production.local",
    port: "5432",
    username: "postgres",
    database: "analytics_db",
    lastChecked: "Never"
  }
];

type Stage = {
  name: string;
  status: "pending" | "running" | "completed" | "error";
};

export function ScriptsPage() {
  const navigate = useNavigate();
  const [selectedScript, setSelectedScript] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [stages, setStages] = useState<Stage[]>([]);
  const [selectedReplicasets, setSelectedReplicasets] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [connections, setConnections] = useState<ConnectionConfig[]>(initialConnections);
  const [editingConnection, setEditingConnection] = useState<string | null>(null);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  
  // Clean Integration settings
  const [cleanMongo, setCleanMongo] = useState(true);
  const [cleanRedis, setCleanRedis] = useState(true);
  const [cleanRabbitMQ, setCleanRabbitMQ] = useState(true);
  
  // Kafka settings
  const [kafkaTopic, setKafkaTopic] = useState("default-topic");
  const [kafkaPartitions, setKafkaPartitions] = useState("3");
  const [purgeMessages, setPurgeMessages] = useState(false);
  const [kafkaUsername, setKafkaUsername] = useState("");
  const [kafkaPassword, setKafkaPassword] = useState("");
  const [filterByKey, setFilterByKey] = useState(false);
  const [filters, setFilters] = useState<Array<{id: string, key: string, value: string}>>([
    { id: crypto.randomUUID(), key: "", value: "" }
  ]);
  const [exportFormat, setExportFormat] = useState("json");
  const [cleanKafka, setCleanKafka] = useState(false);
  const [kafkaBrokerUrls, setKafkaBrokerUrls] = useState<Array<{id: string, url: string}>>([
    { id: crypto.randomUUID(), url: "kafka.production.local:9092" }
  ]);
  const [kafkaOperation, setKafkaOperation] = useState<"view" | "send" | "delete" | "update">("view");
  const [messageContent, setMessageContent] = useState("");
  const [messageKey, setMessageKey] = useState("");
  const [selectedPartition, setSelectedPartition] = useState("auto");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteByFilter, setDeleteByFilter] = useState(false);
  const [deleteFilters, setDeleteFilters] = useState<Array<{id: string, key: string, value: string}>>([
    { id: crypto.randomUUID(), key: "", value: "" }
  ]);

  const handleLogout = () => {
    navigate("/");
  };

  const handleOpenScript = (scriptId: number) => {
    setSelectedScript(scriptId);
    setIsDialogOpen(true);
    
    if (scriptId === 2) {
      setSelectedReplicasets([]);
    }
  };

  const handleTestConnection = (connectionId: string) => {
    setTestingConnection(connectionId);
    
    setTimeout(() => {
      setConnections((prev) =>
        prev.map((conn) =>
          conn.id === connectionId
            ? { ...conn, status: "connected", lastChecked: "Just now" }
            : conn
        )
      );
      setTestingConnection(null);
    }, 2000);
  };

  const handleUpdateConnection = (connectionId: string, field: string, value: string) => {
    setConnections((prev) =>
      prev.map((conn) =>
        conn.id === connectionId ? { ...conn, [field]: value } : conn
      )
    );
  };

  const handleToggleConnectionStatus = (connectionId: string) => {
    setConnections((prev) =>
      prev.map((conn) =>
        conn.id === connectionId
          ? {
              ...conn,
              status: conn.status === "connected" ? "disconnected" : "connected",
            }
          : conn
      )
    );
  };

  const handleRunCleanIntegration = () => {
    const integrationStages: Stage[] = [];
    
    if (cleanMongo) {
      integrationStages.push({ name: "Cleaning MongoDB collections", status: "pending" });
    }
    if (cleanRedis) {
      integrationStages.push({ name: "Flushing Redis cache", status: "pending" });
    }
    if (cleanRabbitMQ) {
      integrationStages.push({ name: "Cleaning RabbitMQ queues", status: "pending" });
    }
    integrationStages.push({ name: "Resetting API Connections", status: "pending" });
    integrationStages.push({ name: "Verifying Data Integrity", status: "pending" });
    
    setSelectedScript(1);
    setIsDialogOpen(true);
    setStages(integrationStages);
    runStages(integrationStages);
  };

  const handleRunKafka = () => {
    const kafkaStages: Stage[] = [
      { name: `Connecting to Kafka Broker`, status: "pending" },
      { name: `Accessing topic: ${kafkaTopic}`, status: "pending" },
      { name: `Checking ${kafkaPartitions} partitions`, status: "pending" },
    ];
    
    if (purgeMessages) {
      kafkaStages.push({ name: "Purging old messages", status: "pending" });
    }
    
    kafkaStages.push({ name: "Processing Messages", status: "pending" });
    kafkaStages.push({ name: "Updating Offsets", status: "pending" });
    
    setStages(kafkaStages);
    runStages(kafkaStages);
  };

  const runStages = (initialStages: Stage[]) => {
    let currentStageIndex = 0;
    
    const interval = setInterval(() => {
      setStages((prevStages) => {
        const newStages = [...prevStages];
        
        // Mark previous stage as completed
        if (currentStageIndex > 0 && newStages[currentStageIndex - 1]) {
          newStages[currentStageIndex - 1].status = "completed";
        }
        
        // Mark current stage as running
        if (currentStageIndex < newStages.length && newStages[currentStageIndex]) {
          newStages[currentStageIndex].status = "running";
        }
        
        // Move to next stage
        currentStageIndex++;
        
        // If all stages are done, mark the last one as completed and clear interval
        if (currentStageIndex > newStages.length) {
          clearInterval(interval);
          if (newStages[newStages.length - 1]) {
            newStages[newStages.length - 1].status = "completed";
          }
        }
        
        return newStages;
      });
    }, 1500);
  };

  const handleToggleReplicaset = (id: number) => {
    setSelectedReplicasets((prev) =>
      prev.includes(id) ? prev.filter((rsId) => rsId !== id) : [...prev, id]
    );
  };

  const handleDeleteReplicasets = () => {
    if (selectedReplicasets.length === 0) return;
    
    setIsDeleting(true);
    const deleteStages: Stage[] = [
      { name: `Backing up ${selectedReplicasets.length} replicaset(s)`, status: "pending" },
      { name: "Stopping replicaset connections", status: "pending" },
      { name: "Removing replicaset data", status: "pending" },
      { name: "Updating system registry", status: "pending" },
      { name: "Cleaning up disk space", status: "pending" },
    ];
    setStages(deleteStages);
    runStages(deleteStages);
    
    setTimeout(() => {
      setIsDeleting(false);
    }, deleteStages.length * 1500);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedScript(null);
    setStages([]);
    setSelectedReplicasets([]);
    setIsDeleting(false);
  };

  // Filter management functions
  const handleAddFilter = () => {
    setFilters([...filters, { id: crypto.randomUUID(), key: "", value: "" }]);
  };

  const handleRemoveFilter = (id: string) => {
    if (filters.length > 1) {
      setFilters(filters.filter(f => f.id !== id));
    }
  };

  const handleUpdateFilter = (id: string, field: 'key' | 'value', value: string) => {
    setFilters(filters.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const handleAddDeleteFilter = () => {
    setDeleteFilters([...deleteFilters, { id: crypto.randomUUID(), key: "", value: "" }]);
  };

  const handleRemoveDeleteFilter = (id: string) => {
    if (deleteFilters.length > 1) {
      setDeleteFilters(deleteFilters.filter(f => f.id !== id));
    }
  };

  const handleUpdateDeleteFilter = (id: string, field: 'key' | 'value', value: string) => {
    setDeleteFilters(deleteFilters.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  // Broker URL management functions
  const handleAddBrokerUrl = () => {
    setKafkaBrokerUrls([...kafkaBrokerUrls, { id: crypto.randomUUID(), url: "" }]);
  };

  const handleRemoveBrokerUrl = (id: string) => {
    if (kafkaBrokerUrls.length > 1) {
      setKafkaBrokerUrls(kafkaBrokerUrls.filter(b => b.id !== id));
    }
  };

  const handleUpdateBrokerUrl = (id: string, url: string) => {
    setKafkaBrokerUrls(kafkaBrokerUrls.map(b => b.id === id ? { ...b, url } : b));
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
                <Button variant="ghost" className="gap-2 bg-indigo-50">
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
      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl mb-2">Automation Scripts</h2>
            <p className="text-gray-600">
              Configure and execute system maintenance scripts
            </p>
          </div>

          <div className="space-y-6">
            {/* Clean Integration Script */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Database className="size-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-2">Clean Integration</CardTitle>
                      <CardDescription className="text-base">
                        Cleans up integration data across multiple databases and resets all API connections.
                        This script will ensure your integration layer is fresh and free from stale data.
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Ready</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div 
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => setCleanMongo(!cleanMongo)}
                    >
                      <Label className="text-sm font-medium cursor-pointer">Clean MongoDB</Label>
                      <Switch checked={cleanMongo} onCheckedChange={setCleanMongo} />
                    </div>
                    <div 
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => setCleanRedis(!cleanRedis)}
                    >
                      <Label className="text-sm font-medium cursor-pointer">Clean Redis</Label>
                      <Switch checked={cleanRedis} onCheckedChange={setCleanRedis} />
                    </div>
                    <div 
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => setCleanRabbitMQ(!cleanRabbitMQ)}
                    >
                      <Label className="text-sm font-medium cursor-pointer">Clean RabbitMQ</Label>
                      <Switch checked={cleanRabbitMQ} onCheckedChange={setCleanRabbitMQ} />
                    </div>
                  </div>
                  
                  
                  <Button 
                    onClick={handleRunCleanIntegration} 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    Execute Clean Integration
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Clean Replicasets Script */}
            <Card className="border-l-4 border-l-red-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <Trash2 className="size-6 text-red-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-2">Clean OpenShift Replicasets</CardTitle>
                      <CardDescription className="text-base">
                        Clean up unused OpenShift replicasets (showing 0/0 pods) to stay within project limits.
                        Currently showing {replicasets.filter(rs => rs.status === "Inactive").length} inactive replicasets out of {replicasets.length} total.
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Ready</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg text-sm">
                    <div>
                      <p className="text-gray-600">Total Replicasets</p>
                      <p className="text-xl font-semibold text-gray-900">{replicasets.length} / 50</p>
                      <p className="text-xs text-gray-500 mt-1">Project limit</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Active (In Use)</p>
                      <p className="text-xl font-semibold text-green-600">{replicasets.filter(rs => rs.status === "Active").length}</p>
                      <p className="text-xs text-gray-500 mt-1">Running pods</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Inactive (0/0)</p>
                      <p className="text-xl font-semibold text-red-600">{replicasets.filter(rs => rs.status === "Inactive").length}</p>
                      <p className="text-xs text-gray-500 mt-1">Can be cleaned</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleOpenScript(2)} 
                    className="w-full bg-red-600 hover:bg-red-700"
                    size="lg"
                  >
                    Manage Replicasets
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Kafka Messages Script */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <MessageSquare className="size-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-2">Kafka Messages</CardTitle>
                      <CardDescription className="text-base">
                        Connect to Kafka, retrieve and filter JSON messages by key/field, export in multiple formats, and clean messages.
                        Supports authentication and flexible message processing options.
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Ready</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg text-sm">
                    <div>
                      <p className="text-gray-600">Connection Status</p>
                      <p className="text-xl font-semibold text-green-600">Connected</p>
                      <p className="text-xs text-gray-500 mt-1">kafka.production.local</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Topics</p>
                      <p className="text-xl font-semibold text-gray-900">12</p>
                      <p className="text-xs text-gray-500 mt-1">Available topics</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Pending Messages</p>
                      <p className="text-xl font-semibold text-blue-600">1,543</p>
                      <p className="text-xs text-gray-500 mt-1">Across all topics</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleOpenScript(3)} 
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    Configure & Execute
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Script Execution Dialog - Clean Integration */}
      <Dialog open={isDialogOpen && selectedScript === 1} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Clean Integration - Execution Progress</DialogTitle>
            <DialogDescription>
              Cleaning up integration data and resetting connections
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative w-32 h-32 mb-6">
              {/* Circle track */}
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
              
              {/* Rolling dots */}
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '1.2s' }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full"></div>
              </div>
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '1.2s', animationDelay: '0.3s' }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full"></div>
              </div>
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '1.2s', animationDelay: '0.6s' }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-400 rounded-full"></div>
              </div>
            </div>
            
            <p className="text-lg font-medium text-gray-700">Processing request</p>
            <p className="text-sm text-gray-500 mt-2">Waiting for API response</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Script Execution Dialog - Clean Replicasets */}
      <Dialog open={isDialogOpen && selectedScript === 2} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Clean Replicasets - Select Items to Delete</DialogTitle>
            <DialogDescription>
              Choose which replicasets to remove from the system
            </DialogDescription>
          </DialogHeader>

          {!isDeleting && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Total Replicasets: <span className="font-semibold text-gray-900">{replicasets.length}</span>
                </p>
                <p className="text-sm font-medium text-red-600">
                  Selected for deletion: {selectedReplicasets.length}
                </p>
              </div>

              <div className="space-y-2">
                {replicasets.map((rs) => (
                  <div
                    key={rs.id}
                    className={`flex items-start gap-3 p-4 border-2 rounded-lg hover:bg-gray-50 transition-colors ${
                      selectedReplicasets.includes(rs.id) ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                  >
                    <Checkbox
                      checked={selectedReplicasets.includes(rs.id)}
                      onCheckedChange={() => handleToggleReplicaset(rs.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-lg">{rs.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs font-mono">{rs.pods}</Badge>
                          <Badge variant={rs.status === "Active" ? "default" : "secondary"}>
                            {rs.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Deployment:</span>
                          <span className="ml-2 font-medium">{rs.deployment}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Pods:</span>
                          <span className="ml-2 font-medium font-mono">{rs.pods}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Created:</span>
                          <span className="ml-2 font-medium">{rs.created}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Last Access:</span>
                          <span className="ml-2 font-medium">{rs.lastAccessed}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={handleDeleteReplicasets}
                  disabled={selectedReplicasets.length === 0}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  size="lg"
                >
                  Delete {selectedReplicasets.length} Replicaset{selectedReplicasets.length !== 1 ? "s" : ""}
                </Button>
                <Button onClick={handleCloseDialog} variant="outline" size="lg">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {isDeleting && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative w-32 h-32 mb-6">
                {/* Circle track */}
                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                
                {/* Rolling dots */}
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '1.2s' }}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-red-600 rounded-full"></div>
                </div>
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '1.2s', animationDelay: '0.3s' }}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full"></div>
                </div>
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '1.2s', animationDelay: '0.6s' }}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-red-400 rounded-full"></div>
                </div>
              </div>
              
              <p className="text-lg font-medium text-gray-700">Deleting replicasets</p>
              <p className="text-sm text-gray-500 mt-2">Waiting for API response</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Script Execution Dialog - Kafka Messages */}
      <Dialog open={isDialogOpen && selectedScript === 3} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="size-5 text-green-600" />
              Kafka Messages Manager
            </DialogTitle>
            <DialogDescription>
              Connect to any Kafka broker and manage messages with full CRUD operations
            </DialogDescription>
          </DialogHeader>

          {stages.length === 0 ? (
            <div className="space-y-6">
              {/* Connection Configuration - Outside tabs */}
              <div className="space-y-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 pb-2 border-b border-green-300">
                  <Database className="size-4 text-green-600" />
                  <h3 className="font-semibold">Connection Configuration</h3>
                  <Badge variant="outline" className="ml-auto">Applied to all operations</Badge>
                </div>
                
                {/* Broker URLs */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Broker URLs</Label>
                  {kafkaBrokerUrls.map((broker, index) => (
                    <div key={broker.id} className="flex items-center gap-2">
                      <Input
                        value={broker.url}
                        onChange={(e) => handleUpdateBrokerUrl(broker.id, e.target.value)}
                        placeholder={`kafka-broker-${index + 1}.local:9092`}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveBrokerUrl(broker.id)}
                        disabled={kafkaBrokerUrls.length === 1}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddBrokerUrl}
                    className="w-full border-dashed border-green-300 text-green-700 hover:bg-green-100"
                  >
                    <Plus className="size-4 mr-2" />
                    Add Broker URL
                  </Button>
                </div>

                {/* Topic and Auth */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Topic Name</Label>
                    <Input
                      value={kafkaTopic}
                      onChange={(e) => setKafkaTopic(e.target.value)}
                      placeholder="Enter topic name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Consumer Group</Label>
                    <Input
                      defaultValue="default-consumer-group"
                      placeholder="Consumer group ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Username</Label>
                    <Input
                      value={kafkaUsername}
                      onChange={(e) => setKafkaUsername(e.target.value)}
                      placeholder="Kafka username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Password</Label>
                    <Input
                      type="password"
                      value={kafkaPassword}
                      onChange={(e) => setKafkaPassword(e.target.value)}
                      placeholder="Password"
                    />
                  </div>
                </div>
              </div>

              {/* Kafka Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Messages in Topic</p>
                  <p className="text-2xl font-semibold text-green-600">8,547</p>
                  <p className="text-xs text-gray-500 mt-1">Current: {kafkaTopic}</p>
                </div>
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Partitions</p>
                  <p className="text-2xl font-semibold text-blue-600">6</p>
                  <p className="text-xs text-gray-500 mt-1">Across all brokers</p>
                </div>
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Consumer Lag</p>
                  <p className="text-2xl font-semibold text-orange-600">234</p>
                  <p className="text-xs text-gray-500 mt-1">Messages behind</p>
                </div>
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Broker Status</p>
                  <p className="text-2xl font-semibold text-green-600">{kafkaBrokerUrls.length}/{kafkaBrokerUrls.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Online / Total</p>
                </div>
              </div>

              {/* Tabs for Operations */}
              <Tabs defaultValue="view" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="view" className="gap-2">
                    <Eye className="size-4" />
                    View/Get
                  </TabsTrigger>
                  <TabsTrigger value="send" className="gap-2">
                    <Send className="size-4" />
                    Send/Add
                  </TabsTrigger>
                  <TabsTrigger value="delete" className="gap-2">
                    <Trash2 className="size-4" />
                    Delete
                  </TabsTrigger>
                </TabsList>

                {/* Tab: View/Get Messages */}
                <TabsContent value="view" className="space-y-6 mt-6">
                  {/* Message Filtering */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b">
                      <div className="flex items-center gap-2">
                        <Filter className="size-4 text-green-600" />
                        <h3 className="font-semibold">Message Filtering (JSON)</h3>
                      </div>
                      <Switch
                        checked={filterByKey}
                        onCheckedChange={setFilterByKey}
                      />
                    </div>
                    {filterByKey && (
                      <div className="space-y-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                        {filters.map((filter, index) => (
                          <div key={filter.id} className="flex items-end gap-2">
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                  JSON Key/Field {filters.length > 1 ? `#${index + 1}` : ''}
                                </Label>
                                <Input
                                  value={filter.key}
                                  onChange={(e) => handleUpdateFilter(filter.id, 'key', e.target.value)}
                                  placeholder="e.g., userId, status"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                  Filter Value
                                </Label>
                                <Input
                                  value={filter.value}
                                  onChange={(e) => handleUpdateFilter(filter.id, 'value', e.target.value)}
                                  placeholder="e.g., 12345, active"
                                />
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => handleRemoveFilter(filter.id)}
                              disabled={filters.length === 1}
                              className="flex-shrink-0"
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddFilter}
                          className="w-full border-dashed border-green-300 text-green-700 hover:bg-green-100 hover:text-green-800"
                        >
                          <Plus className="size-4 mr-2" />
                          Add Another Filter
                        </Button>
                        <div className="pt-2 border-t border-green-300">
                          <p className="text-xs text-green-700 flex items-start gap-2">
                            <AlertCircle className="size-3 mt-0.5 flex-shrink-0" />
                            <span>
                              Messages will be retrieved if they match ALL filters (AND logic)
                            </span>
                          </p>
                        </div>
                      </div>
                    )}
                    {!filterByKey && (
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <FileJson className="size-4" />
                          All messages from the topic will be retrieved
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Export Format */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <Download className="size-4 text-green-600" />
                      <h3 className="font-semibold">Export Format</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setExportFormat("json")}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          exportFormat === "json"
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <FileJson className={`size-6 mx-auto mb-2 ${
                          exportFormat === "json" ? "text-green-600" : "text-gray-400"
                        }`} />
                        <p className={`text-sm font-medium ${
                          exportFormat === "json" ? "text-green-700" : "text-gray-600"
                        }`}>
                          JSON
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Raw JSON format</p>
                      </button>
                      <button
                        onClick={() => setExportFormat("csv")}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          exportFormat === "csv"
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <FileText className={`size-6 mx-auto mb-2 ${
                          exportFormat === "csv" ? "text-green-600" : "text-gray-400"
                        }`} />
                        <p className={`text-sm font-medium ${
                          exportFormat === "csv" ? "text-green-700" : "text-gray-600"
                        }`}>
                          CSV
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Comma-separated</p>
                      </button>
                      <button
                        onClick={() => setExportFormat("txt")}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          exportFormat === "txt"
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <FileText className={`size-6 mx-auto mb-2 ${
                          exportFormat === "txt" ? "text-green-600" : "text-gray-400"
                        }`} />
                        <p className={`text-sm font-medium ${
                          exportFormat === "txt" ? "text-green-700" : "text-gray-600"
                        }`}>
                          TXT
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Plain text</p>
                      </button>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={handleRunKafka}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      <Download className="size-4 mr-2" />
                      Get Messages {exportFormat && `as ${exportFormat.toUpperCase()}`}
                    </Button>
                    <Button onClick={handleCloseDialog} variant="outline" size="lg">
                      Cancel
                    </Button>
                  </div>
                </TabsContent>

                {/* Tab: Send/Add Messages */}
                <TabsContent value="send" className="space-y-6 mt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <Send className="size-4 text-blue-600" />
                      <h3 className="font-semibold">Compose Message</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Message Content (JSON)</Label>
                        <Textarea
                          value={messageContent}
                          onChange={(e) => setMessageContent(e.target.value)}
                          placeholder={`{\n  "orderId": "12345",\n  "userId": "user-001",\n  "status": "pending",\n  "amount": 99.99\n}`}
                          className="font-mono text-sm min-h-[200px]"
                        />
                        <p className="text-xs text-gray-500">
                          Enter valid JSON data. The message will be validated before sending.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Message Key (Optional)</Label>
                          <Input
                            value={messageKey}
                            onChange={(e) => setMessageKey(e.target.value)}
                            placeholder="e.g., order-12345"
                          />
                          <p className="text-xs text-gray-500">
                            Used for message routing and partitioning
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Partition</Label>
                          <Input
                            value={selectedPartition}
                            onChange={(e) => setSelectedPartition(e.target.value)}
                            placeholder="auto"
                          />
                          <p className="text-xs text-gray-500">
                            Leave as "auto" for automatic partition assignment
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={handleRunKafka}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      size="lg"
                    >
                      <Send className="size-4 mr-2" />
                      Send Message to Topic
                    </Button>
                    <Button onClick={handleCloseDialog} variant="outline" size="lg">
                      Cancel
                    </Button>
                  </div>
                </TabsContent>

                {/* Tab: Delete Messages */}
                <TabsContent value="delete" className="space-y-6 mt-6">
                  <div className="space-y-4">
                    {/* Delete by Filter Option */}
                    <div className="flex items-center justify-between pb-2 border-b">
                      <div className="flex items-center gap-2">
                        <Filter className="size-4 text-red-600" />
                        <h3 className="font-semibold">Delete by Filter</h3>
                      </div>
                      <Switch
                        checked={deleteByFilter}
                        onCheckedChange={setDeleteByFilter}
                      />
                    </div>

                    {deleteByFilter ? (
                      <div className="space-y-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                        {deleteFilters.map((filter, index) => (
                          <div key={filter.id} className="flex items-end gap-2">
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                  JSON Key/Field {deleteFilters.length > 1 ? `#${index + 1}` : ''}
                                </Label>
                                <Input
                                  value={filter.key}
                                  onChange={(e) => handleUpdateDeleteFilter(filter.id, 'key', e.target.value)}
                                  placeholder="e.g., userId, status"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                  Filter Value
                                </Label>
                                <Input
                                  value={filter.value}
                                  onChange={(e) => handleUpdateDeleteFilter(filter.id, 'value', e.target.value)}
                                  placeholder="e.g., 12345, inactive"
                                />
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => handleRemoveDeleteFilter(filter.id)}
                              disabled={deleteFilters.length === 1}
                              className="flex-shrink-0"
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddDeleteFilter}
                          className="w-full border-dashed border-red-300 text-red-700 hover:bg-red-100 hover:text-red-800"
                        >
                          <Plus className="size-4 mr-2" />
                          Add Another Filter
                        </Button>
                        <div className="pt-2 border-t border-red-300">
                          <p className="text-xs text-red-700 flex items-start gap-2">
                            <AlertCircle className="size-3 mt-0.5 flex-shrink-0" />
                            <span>
                              Only messages matching ALL filters will be deleted (AND logic)
                            </span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="size-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-red-900">Delete All Messages</p>
                            <p className="text-sm text-red-700 mt-1">
                              All messages from the topic "{kafkaTopic}" will be permanently deleted. This action cannot be undone.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Delete Statistics */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Messages to be deleted</p>
                        <p className="text-xl font-semibold text-red-600">
                          {deleteByFilter ? "~245" : "8,547"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {deleteByFilter ? "Matching filters" : "All messages"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Estimated time</p>
                        <p className="text-xl font-semibold text-gray-900">
                          {deleteByFilter ? "~5s" : "~30s"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Processing duration</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={handleRunKafka}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      size="lg"
                    >
                      <Trash2 className="size-4 mr-2" />
                      Delete Messages{deleteByFilter ? " (Filtered)" : " (All)"}
                    </Button>
                    <Button onClick={handleCloseDialog} variant="outline" size="lg">
                      Cancel
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative w-32 h-32 mb-6">
                {/* Circle track */}
                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                
                {/* Rolling dots */}
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '1.2s' }}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-green-600 rounded-full"></div>
                </div>
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '1.2s', animationDelay: '0.3s' }}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full"></div>
                </div>
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '1.2s', animationDelay: '0.6s' }}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-green-400 rounded-full"></div>
                </div>
              </div>
              
              <p className="text-lg font-medium text-gray-700">Processing Kafka operation</p>
              <p className="text-sm text-gray-500 mt-2">Waiting for API response</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}