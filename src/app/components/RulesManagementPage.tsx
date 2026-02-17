import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { LogOut, FileCode, Cog, RefreshCw, CheckCircle, FileText, Map as MapIcon, Plus, Search, Filter, Eye, Trash2, Edit, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import type { GeoJsonObject } from "geojson";

type Rule = {
  id: number;
  name: string;
  isActive: boolean;
  geoJson: GeoJsonObject;
  description: string;
  createdDate: string;
  lastModified: string;
  tags: string[];
};

// Sample GeoJSON data for different rule types
const sampleRules: Rule[] = [
  {
    id: 1,
    name: "Downtown Delivery Zone",
    isActive: true,
    description: "Primary delivery area covering downtown district",
    createdDate: "2024-01-15",
    lastModified: "2024-02-10",
    tags: ["delivery", "zone-A", "priority"],
    geoJson: {
      type: "Polygon",
      coordinates: [
        [
          [-73.9857, 40.7580],
          [-73.9857, 40.7480],
          [-73.9757, 40.7480],
          [-73.9757, 40.7580],
          [-73.9857, 40.7580]
        ]
      ]
    }
  },
  {
    id: 2,
    name: "Airport Service Route",
    isActive: true,
    description: "Service route connecting airport to city center",
    createdDate: "2024-01-20",
    lastModified: "2024-02-14",
    tags: ["route", "airport", "express"],
    geoJson: {
      type: "LineString",
      coordinates: [
        [-73.9857, 40.7580],
        [-73.9800, 40.7550],
        [-73.9750, 40.7520],
        [-73.9700, 40.7500],
        [-73.9650, 40.7480]
      ]
    }
  },
  {
    id: 3,
    name: "Warehouse Location",
    isActive: false,
    description: "Primary warehouse and distribution center",
    createdDate: "2024-02-01",
    lastModified: "2024-02-01",
    tags: ["warehouse", "storage"],
    geoJson: {
      type: "Point",
      coordinates: [-73.9700, 40.7500]
    }
  },
  {
    id: 4,
    name: "Restricted Area - Construction",
    isActive: true,
    description: "Temporary restriction due to construction work",
    createdDate: "2024-02-05",
    lastModified: "2024-02-12",
    tags: ["restricted", "temporary", "construction"],
    geoJson: {
      type: "Polygon",
      coordinates: [
        [
          [-73.9800, 40.7560],
          [-73.9800, 40.7540],
          [-73.9780, 40.7540],
          [-73.9780, 40.7560],
          [-73.9800, 40.7560]
        ]
      ]
    }
  },
  {
    id: 5,
    name: "North Side Coverage",
    isActive: true,
    description: "Extended coverage area for north side neighborhoods",
    createdDate: "2024-01-10",
    lastModified: "2024-02-15",
    tags: ["coverage", "zone-B", "extended"],
    geoJson: {
      type: "Polygon",
      coordinates: [
        [
          [-73.9900, 40.7650],
          [-73.9900, 40.7550],
          [-73.9800, 40.7550],
          [-73.9800, 40.7650],
          [-73.9900, 40.7650]
        ]
      ]
    }
  },
  {
    id: 6,
    name: "Express Lane Highway",
    isActive: false,
    description: "High-speed delivery route along highway",
    createdDate: "2024-01-25",
    lastModified: "2024-02-08",
    tags: ["route", "highway", "express"],
    geoJson: {
      type: "LineString",
      coordinates: [
        [-73.9900, 40.7600],
        [-73.9850, 40.7580],
        [-73.9800, 40.7560],
        [-73.9750, 40.7540]
      ]
    }
  },
  {
    id: 7,
    name: "Pickup Point - Station A",
    isActive: true,
    description: "Main pickup point at central station",
    createdDate: "2024-02-10",
    lastModified: "2024-02-14",
    tags: ["pickup", "station"],
    geoJson: {
      type: "Point",
      coordinates: [-73.9850, 40.7580]
    }
  },
  {
    id: 8,
    name: "South District Zone",
    isActive: false,
    description: "Service area for southern district",
    createdDate: "2024-01-18",
    lastModified: "2024-01-30",
    tags: ["zone-C", "coverage"],
    geoJson: {
      type: "Polygon",
      coordinates: [
        [
          [-73.9850, 40.7500],
          [-73.9850, 40.7420],
          [-73.9750, 40.7420],
          [-73.9750, 40.7500],
          [-73.9850, 40.7500]
        ]
      ]
    }
  }
];

export function RulesManagementPage() {
  const navigate = useNavigate();
  const [rules, setRules] = useState<Rule[]>(sampleRules);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);

  const handleLogout = () => {
    navigate("/");
  };

  const handleToggleRule = (ruleId: number) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, isActive: !rule.isActive, lastModified: new Date().toISOString().split('T')[0] } : rule
    ));
  };

  const handleViewOnMap = (rule: Rule) => {
    setSelectedRule(rule);
    setIsMapDialogOpen(true);
  };

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rule.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filterActive === "all" || 
                         (filterActive === "active" && rule.isActive) ||
                         (filterActive === "inactive" && !rule.isActive);
    
    return matchesSearch && matchesFilter;
  });

  const activeCount = rules.filter(r => r.isActive).length;
  const inactiveCount = rules.filter(r => !r.isActive).length;

  const getGeoJsonStyle = (feature: any) => {
    return {
      color: "#4f46e5",
      weight: 3,
      opacity: 0.8,
      fillColor: "#818cf8",
      fillOpacity: 0.3
    };
  };

  const getGeometryType = (geoJson: GeoJsonObject): string => {
    return geoJson.type;
  };

  // Get coordinate info for display
  const getCoordinateInfo = (geoJson: GeoJsonObject): string => {
    if (geoJson.type === "Point") {
      const coords = geoJson.coordinates as number[];
      return `Longitude: ${coords[0].toFixed(4)}, Latitude: ${coords[1].toFixed(4)}`;
    } else if (geoJson.type === "LineString") {
      const coords = geoJson.coordinates as number[][];
      return `${coords.length} points along the route`;
    } else if (geoJson.type === "Polygon") {
      const coords = geoJson.coordinates[0] as number[][];
      return `${coords.length - 1} vertices defining the area`;
    }
    return "Complex geometry";
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
                <Button variant="ghost" className="gap-2 bg-indigo-50">
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
            <h2 className="text-3xl mb-2">Rules Management</h2>
            <p className="text-gray-600">
              Manage Elasticsearch rules with geographic data. Activate/deactivate rules and visualize their GeoJSON on a map.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Rules</CardDescription>
                <CardTitle className="text-3xl">{rules.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-1">
                  <CheckCircle className="size-3 text-green-600" />
                  Active Rules
                </CardDescription>
                <CardTitle className="text-3xl text-green-600">{activeCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-1">
                  Inactive Rules
                </CardDescription>
                <CardTitle className="text-3xl text-gray-400">{inactiveCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Filtered Results</CardDescription>
                <CardTitle className="text-3xl text-indigo-600">{filteredRules.length}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Search & Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, description, or tags..."
                    className="pl-9"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="size-4 text-gray-600" />
                  <div className="flex gap-2 flex-1">
                    <Button
                      variant={filterActive === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterActive("all")}
                      className="flex-1"
                    >
                      All
                    </Button>
                    <Button
                      variant={filterActive === "active" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterActive("active")}
                      className="flex-1"
                    >
                      Active
                    </Button>
                    <Button
                      variant={filterActive === "inactive" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterActive("inactive")}
                      className="flex-1"
                    >
                      Inactive
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rules List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Rules ({filteredRules.length})</CardTitle>
                  <CardDescription>
                    Click on a rule to view its GeoJSON on the map
                  </CardDescription>
                </div>
                <Button className="gap-2">
                  <Plus className="size-4" />
                  Add New Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredRules.map((rule) => (
                  <Card key={rule.id} className={`hover:shadow-md transition-all ${rule.isActive ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-gray-300'}`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <MapPin className={`size-5 ${rule.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                            <h3 className="font-semibold text-lg">{rule.name}</h3>
                            <Badge variant={rule.isActive ? "default" : "secondary"} className={rule.isActive ? "bg-green-100 text-green-700" : ""}>
                              {rule.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {getGeometryType(rule.geoJson)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{rule.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Created: {rule.createdDate}</span>
                            <span>Modified: {rule.lastModified}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            {rule.tags.map((tag, idx) => (
                              <span key={idx} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div 
                            className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded"
                            onClick={() => handleToggleRule(rule.id)}
                          >
                            <Label htmlFor={`rule-${rule.id}`} className="text-sm font-medium cursor-pointer whitespace-nowrap">
                              {rule.isActive ? "Deactivate" : "Activate"}
                            </Label>
                            <Switch
                              id={`rule-${rule.id}`}
                              checked={rule.isActive}
                              onCheckedChange={() => handleToggleRule(rule.id)}
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewOnMap(rule)}
                            className="gap-2 whitespace-nowrap"
                          >
                            <MapIcon className="size-3" />
                            View on Map
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 whitespace-nowrap"
                          >
                            <Edit className="size-3" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}

                {filteredRules.length === 0 && (
                  <div className="text-center py-12">
                    <MapIcon className="size-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No rules found</h3>
                    <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Map View Dialog */}
      <Dialog open={isMapDialogOpen} onOpenChange={setIsMapDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapIcon className="size-5 text-indigo-600" />
              {selectedRule?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedRule?.description} • Geometry Type: {selectedRule && getGeometryType(selectedRule.geoJson)}
            </DialogDescription>
          </DialogHeader>

          {selectedRule && (
            <div className="space-y-4">
              {/* Rule Details */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg text-sm">
                <div>
                  <p className="text-gray-600">Status</p>
                  <Badge variant={selectedRule.isActive ? "default" : "secondary"} className={selectedRule.isActive ? "bg-green-100 text-green-700 mt-1" : "mt-1"}>
                    {selectedRule.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-600">Type</p>
                  <p className="font-medium mt-1">{getGeometryType(selectedRule.geoJson)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Created</p>
                  <p className="font-medium mt-1">{selectedRule.createdDate}</p>
                </div>
                <div>
                  <p className="text-gray-600">Last Modified</p>
                  <p className="font-medium mt-1">{selectedRule.lastModified}</p>
                </div>
                <div>
                  <p className="text-gray-600">Coordinates</p>
                  <p className="font-medium mt-1">{getCoordinateInfo(selectedRule.geoJson)}</p>
                </div>
              </div>

              {/* Map Visualization */}
              <div className="h-[500px] rounded-lg overflow-hidden border-2 border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center relative">
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%234f46e5\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
                }}></div>
                <div className="text-center z-10">
                  <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
                    <MapIcon className="size-16 text-indigo-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">GeoJSON Visualization</h3>
                    <p className="text-gray-600 mb-4">
                      This rule contains geographic data of type <Badge variant="outline" className="ml-1">{getGeometryType(selectedRule.geoJson)}</Badge>
                    </p>
                    <div className="text-sm text-left bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium text-gray-700 mb-2">Coordinate Information:</p>
                      <p className="text-gray-600">{getCoordinateInfo(selectedRule.geoJson)}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                      View the full GeoJSON data below
                    </p>
                  </div>
                </div>
              </div>

              {/* GeoJSON Raw Data */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">GeoJSON Data</Label>
                <pre className="p-4 bg-gray-900 text-green-400 rounded-lg text-xs overflow-x-auto max-h-40 overflow-y-auto">
                  {JSON.stringify(selectedRule.geoJson, null, 2)}
                </pre>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => handleToggleRule(selectedRule.id)}
                  variant={selectedRule.isActive ? "outline" : "default"}
                  className="flex-1"
                >
                  {selectedRule.isActive ? "Deactivate Rule" : "Activate Rule"}
                </Button>
                <Button
                  onClick={() => setIsMapDialogOpen(false)}
                  variant="outline"
                >
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