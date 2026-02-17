import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { LogOut, FileCode, Cog, RefreshCw, CheckCircle, FileText, ArrowRightLeft, Server, Play, Square, Loader2, Check, X, Clock, AlertCircle, Database, Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";

type DeploymentStatus = "running" | "stopped" | "starting" | "stopping" | "error";

type Deployment = {
  id: number;
  name: string;
  type: string;
  primaryStatus: DeploymentStatus;
  secondaryStatus: DeploymentStatus;
  pods: {
    primary: string;
    secondary: string;
  };
  memory: string;
  cpu: string;
  replicas: number;
};

type Site = "primary" | "secondary";

type Stage = {
  name: string;
  status: "pending" | "running" | "completed" | "error";
};

const initialDeployments: Deployment[] = [
  {
    id: 1,
    name: "myapp-deployment",
    type: "Web Application",
    primaryStatus: "running",
    secondaryStatus: "stopped",
    pods: { primary: "3/3", secondary: "0/0" },
    memory: "2.4 GB",
    cpu: "1.2 cores",
    replicas: 3
  },
  {
    id: 2,
    name: "api-deployment",
    type: "REST API",
    primaryStatus: "running",
    secondaryStatus: "stopped",
    pods: { primary: "2/2", secondary: "0/0" },
    memory: "1.8 GB",
    cpu: "0.8 cores",
    replicas: 2
  },
  {
    id: 3,
    name: "worker-deployment",
    type: "Background Worker",
    primaryStatus: "running",
    secondaryStatus: "stopped",
    pods: { primary: "4/4", secondary: "0/0" },
    memory: "3.2 GB",
    cpu: "1.6 cores",
    replicas: 4
  },
  {
    id: 4,
    name: "cache-deployment",
    type: "Redis Cache",
    primaryStatus: "running",
    secondaryStatus: "stopped",
    pods: { primary: "1/1", secondary: "0/0" },
    memory: "1.0 GB",
    cpu: "0.4 cores",
    replicas: 1
  },
  {
    id: 5,
    name: "queue-deployment",
    type: "Message Queue",
    primaryStatus: "running",
    secondaryStatus: "stopped",
    pods: { primary: "2/2", secondary: "0/0" },
    memory: "1.5 GB",
    cpu: "0.6 cores",
    replicas: 2
  },
  {
    id: 6,
    name: "scheduler-deployment",
    type: "Task Scheduler",
    primaryStatus: "running",
    secondaryStatus: "stopped",
    pods: { primary: "1/1", secondary: "0/0" },
    memory: "0.8 GB",
    cpu: "0.3 cores",
    replicas: 1
  },
  {
    id: 7,
    name: "database-deployment",
    type: "PostgreSQL",
    primaryStatus: "running",
    secondaryStatus: "stopped",
    pods: { primary: "1/1", secondary: "0/0" },
    memory: "4.0 GB",
    cpu: "2.0 cores",
    replicas: 1
  },
  {
    id: 8,
    name: "monitoring-deployment",
    type: "Monitoring Service",
    primaryStatus: "running",
    secondaryStatus: "stopped",
    pods: { primary: "1/1", secondary: "0/0" },
    memory: "1.2 GB",
    cpu: "0.5 cores",
    replicas: 1
  }
];

export function AutomaticFailoverPage() {
  const navigate = useNavigate();
  const [deployments, setDeployments] = useState<Deployment[]>(initialDeployments);
  const [activeSite, setActiveSite] = useState<Site>("primary");
  const [selectedDeployments, setSelectedDeployments] = useState<number[]>([]);
  const [isFailoverDialogOpen, setIsFailoverDialogOpen] = useState(false);
  const [targetSite, setTargetSite] = useState<Site | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [isExecutingFailover, setIsExecutingFailover] = useState(false);

  const handleLogout = () => {
    navigate("/");
  };

  const handleToggleDeployment = (id: number) => {
    setSelectedDeployments((prev) =>
      prev.includes(id) ? prev.filter((depId) => depId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedDeployments.length === deployments.length) {
      setSelectedDeployments([]);
    } else {
      setSelectedDeployments(deployments.map(d => d.id));
    }
  };

  const handleInitiateFailover = (target: Site) => {
    if (selectedDeployments.length === 0) return;
    setTargetSite(target);
    setIsFailoverDialogOpen(true);
  };

  const handleExecuteFailover = () => {
    if (!targetSite) return;
    
    setIsExecutingFailover(true);
    const selectedCount = selectedDeployments.length;
    const sourceSite = targetSite === "primary" ? "secondary" : "primary";
    const sourceSiteName = sourceSite === "primary" ? "Primary Site" : "Secondary Site";
    const targetSiteName = targetSite === "primary" ? "Primary Site" : "Secondary Site";
    
    const failoverStages: Stage[] = [
      { name: `Validating ${selectedCount} deployment(s)`, status: "pending" },
      { name: `Creating snapshots on ${sourceSiteName}`, status: "pending" },
      { name: `Syncing data to ${targetSiteName}`, status: "pending" },
      { name: `Stopping deployments on ${sourceSiteName}`, status: "pending" },
      { name: `Updating DNS records`, status: "pending" },
      { name: `Starting deployments on ${targetSiteName}`, status: "pending" },
      { name: `Verifying health checks`, status: "pending" },
      { name: `Updating load balancer configuration`, status: "pending" },
      { name: `Finalizing failover`, status: "pending" },
    ];
    
    setStages(failoverStages);
    runStages(failoverStages, targetSite);
  };

  const runStages = (initialStages: Stage[], target: Site) => {
    let currentStageIndex = 0;
    
    const interval = setInterval(() => {
      setStages((prevStages) => {
        const newStages = [...prevStages];
        
        if (currentStageIndex > 0 && newStages[currentStageIndex - 1]) {
          newStages[currentStageIndex - 1].status = "completed";
        }
        
        if (currentStageIndex < newStages.length && newStages[currentStageIndex]) {
          newStages[currentStageIndex].status = "running";
        }
        
        currentStageIndex++;
        
        if (currentStageIndex > newStages.length) {
          clearInterval(interval);
          if (newStages[newStages.length - 1]) {
            newStages[newStages.length - 1].status = "completed";
          }
          
          // Update deployment statuses after failover completes
          setTimeout(() => {
            setDeployments(prev => prev.map(dep => {
              if (selectedDeployments.includes(dep.id)) {
                if (target === "primary") {
                  return {
                    ...dep,
                    primaryStatus: "running" as DeploymentStatus,
                    secondaryStatus: "stopped" as DeploymentStatus,
                    pods: { primary: `${dep.replicas}/${dep.replicas}`, secondary: "0/0" }
                  };
                } else {
                  return {
                    ...dep,
                    primaryStatus: "stopped" as DeploymentStatus,
                    secondaryStatus: "running" as DeploymentStatus,
                    pods: { primary: "0/0", secondary: `${dep.replicas}/${dep.replicas}` }
                  };
                }
              }
              return dep;
            }));
            setActiveSite(target);
            setIsExecutingFailover(false);
            setSelectedDeployments([]);
          }, 1000);
        }
        
        return newStages;
      });
    }, 1500);
  };

  const handleCloseFailoverDialog = () => {
    if (!isExecutingFailover) {
      setIsFailoverDialogOpen(false);
      setTargetSite(null);
      setStages([]);
    }
  };

  const getRunningCount = (site: Site) => {
    return deployments.filter(d => 
      site === "primary" ? d.primaryStatus === "running" : d.secondaryStatus === "running"
    ).length;
  };

  const getStatusBadge = (status: DeploymentStatus) => {
    switch (status) {
      case "running":
        return <Badge className="bg-green-100 text-green-700">Running</Badge>;
      case "stopped":
        return <Badge variant="secondary">Stopped</Badge>;
      case "starting":
        return <Badge className="bg-blue-100 text-blue-700">Starting</Badge>;
      case "stopping":
        return <Badge className="bg-orange-100 text-orange-700">Stopping</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-700">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
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
                <Button variant="ghost" className="gap-2" onClick={() => navigate("/config")}>
                  <Cog className="size-4" />
                  Config Management
                </Button>
                <Button variant="ghost" className="gap-2 bg-indigo-50">
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
            <h2 className="text-3xl mb-2">Automatic Failover</h2>
            <p className="text-gray-600">
              Manage failover between primary and secondary OpenShift sites. Select deployments to stop on one site and start on another.
            </p>
          </div>

          {/* Current Active Site */}
          <div className="mb-6 p-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm mb-1">Currently Active Site</p>
                <h3 className="text-3xl font-bold">
                  {activeSite === "primary" ? "Primary Site" : "Secondary Site"}
                </h3>
                <p className="text-indigo-100 mt-2">
                  {getRunningCount(activeSite)} of {deployments.length} deployments running
                </p>
              </div>
              <div className="p-4 bg-white/20 rounded-full">
                <Server className="size-12" />
              </div>
            </div>
          </div>

          {/* Sites Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Primary Site */}
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Globe className="size-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Primary Site</CardTitle>
                      <CardDescription>us-east-1.openshift.com</CardDescription>
                    </div>
                  </div>
                  {activeSite === "primary" && (
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Running</p>
                    <p className="text-2xl font-semibold text-green-600">
                      {getRunningCount("primary")}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Stopped</p>
                    <p className="text-2xl font-semibold text-gray-400">
                      {deployments.length - getRunningCount("primary")}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Pods</p>
                    <p className="text-2xl font-semibold text-blue-600">
                      {deployments.reduce((acc, d) => {
                        const pods = d.pods.primary.split("/")[0];
                        return acc + parseInt(pods);
                      }, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Secondary Site */}
            <Card className="border-2 border-purple-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Globe className="size-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Secondary Site</CardTitle>
                      <CardDescription>us-west-2.openshift.com</CardDescription>
                    </div>
                  </div>
                  {activeSite === "secondary" && (
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Running</p>
                    <p className="text-2xl font-semibold text-green-600">
                      {getRunningCount("secondary")}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Stopped</p>
                    <p className="text-2xl font-semibold text-gray-400">
                      {deployments.length - getRunningCount("secondary")}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Pods</p>
                    <p className="text-2xl font-semibold text-purple-600">
                      {deployments.reduce((acc, d) => {
                        const pods = d.pods.secondary.split("/")[0];
                        return acc + parseInt(pods);
                      }, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Deployment Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl mb-2">Select Deployments for Failover</CardTitle>
                  <CardDescription>
                    Choose which deployments to move between sites
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={selectedDeployments.length === deployments.length}
                      onCheckedChange={handleSelectAll}
                    />
                    <Label className="cursor-pointer" onClick={handleSelectAll}>
                      {selectedDeployments.length === deployments.length ? "Deselect All" : "Select All"}
                    </Label>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-6">
                {deployments.map((deployment) => (
                  <div
                    key={deployment.id}
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${
                      selectedDeployments.includes(deployment.id)
                        ? "border-indigo-300 bg-indigo-50"
                        : "border-gray-200"
                    }`}
                    onClick={() => handleToggleDeployment(deployment.id)}
                  >
                    <Checkbox
                      checked={selectedDeployments.includes(deployment.id)}
                      onCheckedChange={() => handleToggleDeployment(deployment.id)}
                    />
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="md:col-span-2">
                        <p className="font-semibold text-base">{deployment.name}</p>
                        <p className="text-sm text-gray-600">{deployment.type}</p>
                      </div>
                      <div className="text-sm">
                        <p className="text-gray-600 mb-1">Primary Site</p>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(deployment.primaryStatus)}
                          <span className="font-mono text-xs">{deployment.pods.primary}</span>
                        </div>
                      </div>
                      <div className="text-sm">
                        <p className="text-gray-600 mb-1">Secondary Site</p>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(deployment.secondaryStatus)}
                          <span className="font-mono text-xs">{deployment.pods.secondary}</span>
                        </div>
                      </div>
                      <div className="text-sm">
                        <p className="text-gray-600">Resources</p>
                        <p className="font-medium">{deployment.memory}</p>
                        <p className="text-xs text-gray-500">{deployment.cpu}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Failover Actions */}
              <div className="flex items-center gap-4 pt-6 border-t">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    Selected: <span className="font-semibold text-gray-900">{selectedDeployments.length}</span> deployment(s)
                  </p>
                </div>
                <Button
                  onClick={() => handleInitiateFailover("secondary")}
                  disabled={selectedDeployments.length === 0}
                  className="gap-2 bg-purple-600 hover:bg-purple-700"
                  size="lg"
                >
                  <ArrowRightLeft className="size-4" />
                  Failover to Secondary Site
                </Button>
                <Button
                  onClick={() => handleInitiateFailover("primary")}
                  disabled={selectedDeployments.length === 0}
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <ArrowRightLeft className="size-4" />
                  Failover to Primary Site
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Failover Execution Dialog */}
      <Dialog open={isFailoverDialogOpen} onOpenChange={handleCloseFailoverDialog}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="size-5 text-indigo-600" />
              Failover to {targetSite === "primary" ? "Primary" : "Secondary"} Site
            </DialogTitle>
            <DialogDescription>
              {stages.length === 0 ? (
                `You are about to failover ${selectedDeployments.length} deployment(s) to the ${targetSite} site`
              ) : (
                "Executing failover process..."
              )}
            </DialogDescription>
          </DialogHeader>

          {stages.length === 0 ? (
            <div className="space-y-6 py-4">
              {/* Confirmation Details */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="size-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900 mb-2">Important Information</h3>
                    <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                      <li>Selected deployments will be stopped on the current site</li>
                      <li>Data will be synchronized to the target site</li>
                      <li>Deployments will be started on the target site</li>
                      <li>DNS and load balancer configurations will be updated</li>
                      <li>This process may take several minutes</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Selected Deployments Summary */}
              <div className="space-y-3">
                <h3 className="font-semibold">Selected Deployments ({selectedDeployments.length})</h3>
                <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-3">
                  {deployments
                    .filter(d => selectedDeployments.includes(d.id))
                    .map(deployment => (
                      <div key={deployment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-sm">{deployment.name}</p>
                          <p className="text-xs text-gray-600">{deployment.type}</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <div className="text-right">
                            <p className="text-gray-600">Current</p>
                            <p className="font-mono">
                              {targetSite === "primary" ? deployment.pods.secondary : deployment.pods.primary}
                            </p>
                          </div>
                          <ArrowRightLeft className="size-3 text-gray-400" />
                          <div className="text-right">
                            <p className="text-gray-600">Target</p>
                            <p className="font-mono text-green-600">
                              {deployment.replicas}/{deployment.replicas}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={handleExecuteFailover}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  size="lg"
                >
                  <Play className="size-4 mr-2" />
                  Execute Failover
                </Button>
                <Button
                  onClick={handleCloseFailoverDialog}
                  variant="outline"
                  size="lg"
                  disabled={isExecutingFailover}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {stages.map((stage, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    {stage.status === "completed" && (
                      <div className="p-1 bg-green-100 rounded-full">
                        <Check className="size-4 text-green-600" />
                      </div>
                    )}
                    {stage.status === "running" && (
                      <Loader2 className="size-6 text-indigo-600 animate-spin" />
                    )}
                    {stage.status === "pending" && (
                      <div className="p-1 bg-gray-100 rounded-full">
                        <Clock className="size-4 text-gray-400" />
                      </div>
                    )}
                    {stage.status === "error" && (
                      <div className="p-1 bg-red-100 rounded-full">
                        <X className="size-4 text-red-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      stage.status === "completed" ? "text-green-600" :
                      stage.status === "running" ? "text-indigo-600" :
                      stage.status === "error" ? "text-red-600" :
                      "text-gray-500"
                    }`}>
                      {stage.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}