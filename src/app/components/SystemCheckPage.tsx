import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { LogOut, FileCode, Cog, RefreshCw, CheckCircle, FileText, AlertCircle, Database, MessageSquare, Code, Send, Loader2, Check, X, Activity, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";

type ServiceStatus = "healthy" | "degraded" | "down" | "checking";

type SystemService = {
  id: number;
  name: string;
  type: string;
  status: ServiceStatus;
  responseTime: string;
  uptime: string;
  lastChecked: string;
  cpu: string;
  memory: string;
  requests: string;
};

const initialServices: SystemService[] = [
  {
    id: 1,
    name: "API Gateway",
    type: "REST API",
    status: "healthy",
    responseTime: "45ms",
    uptime: "99.98%",
    lastChecked: "Just now",
    cpu: "23%",
    memory: "1.2 GB",
    requests: "1,245/min"
  },
  {
    id: 2,
    name: "MongoDB Primary",
    type: "Database",
    status: "healthy",
    responseTime: "12ms",
    uptime: "99.99%",
    lastChecked: "Just now",
    cpu: "45%",
    memory: "3.8 GB",
    requests: "892/min"
  },
  {
    id: 3,
    name: "RabbitMQ",
    type: "Message Queue",
    status: "healthy",
    responseTime: "8ms",
    uptime: "99.95%",
    lastChecked: "Just now",
    cpu: "18%",
    memory: "896 MB",
    requests: "3,421/min"
  },
  {
    id: 4,
    name: "Redis Cache",
    type: "Cache",
    status: "healthy",
    responseTime: "3ms",
    uptime: "99.97%",
    lastChecked: "Just now",
    cpu: "12%",
    memory: "512 MB",
    requests: "5,678/min"
  },
  {
    id: 5,
    name: "Worker Service",
    type: "Background Worker",
    status: "degraded",
    responseTime: "234ms",
    uptime: "98.45%",
    lastChecked: "Just now",
    cpu: "78%",
    memory: "2.1 GB",
    requests: "234/min"
  },
  {
    id: 6,
    name: "Kafka Broker",
    type: "Event Stream",
    status: "healthy",
    responseTime: "15ms",
    uptime: "99.92%",
    lastChecked: "Just now",
    cpu: "34%",
    memory: "1.8 GB",
    requests: "2,890/min"
  },
  {
    id: 7,
    name: "PostgreSQL",
    type: "Database",
    status: "healthy",
    responseTime: "18ms",
    uptime: "99.96%",
    lastChecked: "Just now",
    cpu: "38%",
    memory: "2.4 GB",
    requests: "567/min"
  },
  {
    id: 8,
    name: "Load Balancer",
    type: "Network",
    status: "healthy",
    responseTime: "5ms",
    uptime: "99.99%",
    lastChecked: "Just now",
    cpu: "15%",
    memory: "428 MB",
    requests: "8,945/min"
  }
];

export function SystemCheckPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState<SystemService[]>(initialServices);
  const [isCheckingAll, setIsCheckingAll] = useState(false);
  
  // Input data state
  const [inputData, setInputData] = useState("");
  const [inputError, setInputError] = useState("");
  const [targetType, setTargetType] = useState<"rabbitmq" | "mongodb">("mongodb");
  const [rabbitmqQueue, setRabbitmqQueue] = useState("default-queue");
  const [mongoCollection, setMongoCollection] = useState("test-collection");
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const handleLogout = () => {
    navigate("/");
  };

  const handleCheckAllServices = () => {
    setIsCheckingAll(true);
    
    // Set all services to "checking" status
    setServices(prev => prev.map(s => ({ ...s, status: "checking" as ServiceStatus })));
    
    // Simulate checking each service
    setTimeout(() => {
      setServices(prev => prev.map(s => {
        // Randomly assign status for demo purposes
        const random = Math.random();
        let newStatus: ServiceStatus = "healthy";
        if (random < 0.1) newStatus = "degraded";
        else if (random < 0.05) newStatus = "down";
        
        return {
          ...s,
          status: newStatus,
          lastChecked: "Just now"
        };
      }));
      setIsCheckingAll(false);
    }, 2000);
  };

  const handleCheckSingleService = (serviceId: number) => {
    setServices(prev => prev.map(s => 
      s.id === serviceId ? { ...s, status: "checking" as ServiceStatus } : s
    ));
    
    setTimeout(() => {
      setServices(prev => prev.map(s => {
        if (s.id === serviceId) {
          const random = Math.random();
          let newStatus: ServiceStatus = "healthy";
          if (random < 0.15) newStatus = "degraded";
          else if (random < 0.05) newStatus = "down";
          
          return { ...s, status: newStatus, lastChecked: "Just now" };
        }
        return s;
      }));
    }, 1000);
  };

  const handleValidateJSON = () => {
    try {
      JSON.parse(inputData);
      setInputError("");
      return true;
    } catch (error) {
      setInputError("Invalid JSON format. Please check your syntax.");
      return false;
    }
  };

  const handleBeautifyJSON = () => {
    try {
      const parsed = JSON.parse(inputData);
      const beautified = JSON.stringify(parsed, null, 2);
      setInputData(beautified);
      setInputError("");
    } catch (error) {
      setInputError("Invalid JSON format. Cannot beautify.");
    }
  };

  const handleSendData = () => {
    if (!handleValidateJSON()) return;
    
    setIsSending(true);
    setSendSuccess(false);
    
    // Simulate sending data
    setTimeout(() => {
      const targetName = targetType === "rabbitmq" 
        ? `RabbitMQ queue: ${rabbitmqQueue}` 
        : `MongoDB collection: ${mongoCollection}`;
      
      console.log(`Sending data to ${targetName}:`, inputData);
      
      setIsSending(false);
      setSendSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSendSuccess(false);
      }, 3000);
    }, 1500);
  };

  const getStatusBadge = (status: ServiceStatus) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-green-100 text-green-700 gap-1"><Check className="size-3" />Healthy</Badge>;
      case "degraded":
        return <Badge className="bg-orange-100 text-orange-700 gap-1"><AlertTriangle className="size-3" />Degraded</Badge>;
      case "down":
        return <Badge className="bg-red-100 text-red-700 gap-1"><X className="size-3" />Down</Badge>;
      case "checking":
        return <Badge className="bg-blue-100 text-blue-700 gap-1"><Loader2 className="size-3 animate-spin" />Checking</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: ServiceStatus) => {
    switch (status) {
      case "healthy":
        return <Check className="size-5 text-green-600" />;
      case "degraded":
        return <AlertTriangle className="size-5 text-orange-600" />;
      case "down":
        return <X className="size-5 text-red-600" />;
      case "checking":
        return <Loader2 className="size-5 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="size-5 text-gray-400" />;
    }
  };

  const healthyCount = services.filter(s => s.status === "healthy").length;
  const degradedCount = services.filter(s => s.status === "degraded").length;
  const downCount = services.filter(s => s.status === "down").length;

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
                <Button variant="ghost" className="gap-2 bg-indigo-50">
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
      <main className="flex-1 bg-gray-50 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl mb-2">System Check</h2>
            <p className="text-gray-600">
              Monitor system health, check service status, and test data placement in RabbitMQ or MongoDB.
            </p>
          </div>

          {/* System Overview Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Services</CardDescription>
                <CardTitle className="text-3xl">{services.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-1">
                  <Check className="size-3 text-green-600" />
                  Healthy
                </CardDescription>
                <CardTitle className="text-3xl text-green-600">{healthyCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-1">
                  <AlertTriangle className="size-3 text-orange-600" />
                  Degraded
                </CardDescription>
                <CardTitle className="text-3xl text-orange-600">{degradedCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-1">
                  <X className="size-3 text-red-600" />
                  Down
                </CardDescription>
                <CardTitle className="text-3xl text-red-600">{downCount}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Data Input & Placement Tool */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl mb-2">Data Input & Placement Tool</CardTitle>
                  <CardDescription>
                    Input JSON data and send it to RabbitMQ queue or MongoDB collection for testing
                  </CardDescription>
                </div>
                {sendSuccess && (
                  <Badge className="bg-green-100 text-green-700 gap-1">
                    <Check className="size-3" />
                    Data sent successfully!
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* JSON Input */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">JSON Input</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBeautifyJSON}
                        className="gap-2"
                      >
                        <Code className="size-3" />
                        Beautify
                      </Button>
                    </div>
                    <Textarea
                      value={inputData}
                      onChange={(e) => {
                        setInputData(e.target.value);
                        setInputError("");
                        setSendSuccess(false);
                      }}
                      placeholder='{"key": "value", "data": "example"}'
                      className="font-mono text-sm min-h-[300px] resize-y"
                    />
                    {inputError && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="size-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{inputError}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Target Selection */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Target Type</Label>
                    <Select value={targetType} onValueChange={(value) => setTargetType(value as "rabbitmq" | "mongodb")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mongodb">
                          <div className="flex items-center gap-2">
                            <Database className="size-4 text-green-600" />
                            MongoDB
                          </div>
                        </SelectItem>
                        <SelectItem value="rabbitmq">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="size-4 text-orange-600" />
                            RabbitMQ
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {targetType === "mongodb" && (
                    <div className="space-y-2">
                      <Label htmlFor="mongo-collection" className="text-sm font-medium">
                        MongoDB Collection
                      </Label>
                      <Input
                        id="mongo-collection"
                        value={mongoCollection}
                        onChange={(e) => setMongoCollection(e.target.value)}
                        placeholder="Enter collection name"
                      />
                      <p className="text-xs text-gray-500">
                        Data will be inserted as a document
                      </p>
                    </div>
                  )}

                  {targetType === "rabbitmq" && (
                    <div className="space-y-2">
                      <Label htmlFor="rabbitmq-queue" className="text-sm font-medium">
                        RabbitMQ Queue
                      </Label>
                      <Input
                        id="rabbitmq-queue"
                        value={rabbitmqQueue}
                        onChange={(e) => setRabbitmqQueue(e.target.value)}
                        placeholder="Enter queue name"
                      />
                      <p className="text-xs text-gray-500">
                        Data will be published to the queue
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg text-sm">
                      <p className="text-gray-600 mb-1">Target:</p>
                      <p className="font-medium">
                        {targetType === "mongodb" 
                          ? `MongoDB: ${mongoCollection}` 
                          : `RabbitMQ: ${rabbitmqQueue}`}
                      </p>
                    </div>
                    
                    <Button
                      onClick={handleSendData}
                      disabled={!inputData || isSending}
                      className="w-full gap-2"
                      size="lg"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="size-4" />
                          Send to {targetType === "mongodb" ? "MongoDB" : "RabbitMQ"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Status Insights */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl mb-2">System Status Insights</CardTitle>
                  <CardDescription>
                    Real-time health monitoring of all system services
                  </CardDescription>
                </div>
                <Button
                  onClick={handleCheckAllServices}
                  disabled={isCheckingAll}
                  className="gap-2"
                  size="lg"
                >
                  {isCheckingAll ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Activity className="size-4" />
                      Check All Services
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {services.map((service) => (
                  <Card key={service.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-lg ${
                            service.status === "healthy" ? "bg-green-100" :
                            service.status === "degraded" ? "bg-orange-100" :
                            service.status === "down" ? "bg-red-100" :
                            "bg-blue-100"
                          }`}>
                            {getStatusIcon(service.status)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-base">{service.name}</h3>
                              {getStatusBadge(service.status)}
                              <Badge variant="outline" className="text-xs">{service.type}</Badge>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600 text-xs mb-1">Response Time</p>
                                <p className="font-medium">{service.responseTime}</p>
                              </div>
                              <div>
                                <p className="text-gray-600 text-xs mb-1">Uptime</p>
                                <p className="font-medium">{service.uptime}</p>
                              </div>
                              <div>
                                <p className="text-gray-600 text-xs mb-1">CPU Usage</p>
                                <p className="font-medium">{service.cpu}</p>
                              </div>
                              <div>
                                <p className="text-gray-600 text-xs mb-1">Memory</p>
                                <p className="font-medium">{service.memory}</p>
                              </div>
                              <div>
                                <p className="text-gray-600 text-xs mb-1">Requests</p>
                                <p className="font-medium">{service.requests}</p>
                              </div>
                              <div>
                                <p className="text-gray-600 text-xs mb-1">Last Checked</p>
                                <p className="font-medium text-xs">{service.lastChecked}</p>
                              </div>
                              <div className="flex items-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCheckSingleService(service.id)}
                                  disabled={service.status === "checking"}
                                  className="gap-1"
                                >
                                  {service.status === "checking" ? (
                                    <Loader2 className="size-3 animate-spin" />
                                  ) : (
                                    <RefreshCw className="size-3" />
                                  )}
                                  Check
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}