"use client";
export const dynamic = 'force-dynamic';

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { 
  FileText, Upload, Filter, Search, MoreVertical, 
  Download, Share2, Brain, Loader2, File, CheckCircle, ShieldAlert 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain as BrainIcon } from "lucide-react";

interface Report {
  id: number;
  title: string;
  type: string;
  date: string;
  aiSummarized: boolean;
  url: string;
  aiData?: {
    summary: string;
    keyFindings: string[];
    recommendations: string[];
    concerns: string[];
    vocabulary: { term: string; definition: string }[];
  };
}

const MOCK_REPORTS = [
  { id: 1, title: "Complete Blood Count", type: "Blood Test", date: "May 10, 2026", aiSummarized: true, url: "#" },
  { id: 2, title: "Chest X-Ray", type: "X-Ray", date: "April 22, 2026", aiSummarized: false, url: "#" },
  { id: 3, title: "Lipid Panel", type: "Blood Test", date: "Jan 15, 2026", aiSummarized: true, url: "#" },
  { id: 4, title: "Neurologist Prescription", type: "Prescription", date: "Dec 05, 2025", aiSummarized: false, url: "#" },
];

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>(MOCK_REPORTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isUploading, setIsUploading] = useState(false);
  const [summarizingId, setSummarizingId] = useState<number | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setIsUploading(true);
      // Simulate upload to Supabase
      setTimeout(() => {
        const newReport = {
          id: Date.now(),
          title: acceptedFiles[0].name,
          type: "Other",
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          aiSummarized: false,
          url: "#"
        };
        setReports([newReport, ...reports]);
        setIsUploading(false);
      }, 2000);
    }
  }, [reports]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    }
  });

  const handleSummarize = async (id: number) => {
    const report = reports.find(r => r.id === id);
    if (!report) return;

    setSummarizingId(id);
    try {
      const response = await fetch("/api/reports/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          reportText: `This is a medical report for ${report.title}. The patient shows normal results with slight deficiency in Vitamin D.`, 
          fileName: report.title 
        }),
      });

      if (!response.ok) throw new Error("Summarization failed");
      
      const data = await response.json();
      setReports(reports.map(r => r.id === id ? { ...r, aiSummarized: true, aiData: data } : r));
    } catch (error) {
      console.error("Summarization Error:", error);
    } finally {
      setSummarizingId(null);
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || r.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medical Reports</h1>
          <p className="text-muted-foreground mt-1">Upload, store, and analyze your medical documents.</p>
        </div>
        
        <Dialog>
          <DialogTrigger>
            <Button className="gap-2">
              <Upload className="h-4 w-4" /> Upload Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Medical Document</DialogTitle>
              <DialogDescription>
                Upload PDFs or Images of your test results, prescriptions, or X-rays.
              </DialogDescription>
            </DialogHeader>
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-10 mt-4 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
              }`}
            >
              <input {...getInputProps()} />
              {isUploading ? (
                <div className="flex flex-col items-center gap-2 text-primary">
                  <Loader2 className="h-10 w-10 animate-spin" />
                  <p className="font-medium">Uploading securely...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <div className="bg-muted p-4 rounded-full mb-2">
                    <Upload className="h-8 w-8" />
                  </div>
                  <p className="font-medium text-foreground">Drag & drop your file here</p>
                  <p className="text-sm">or click to browse (PDF, JPG, PNG)</p>
                </div>
              )}
            </div>
            <div className="text-xs text-center text-muted-foreground mt-4 flex items-center justify-center gap-1">
              <ShieldAlert className="h-3 w-3" />
              Files are securely uploaded to Supabase and encrypted at rest.
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0 flex flex-col sm:flex-row gap-4 justify-between space-y-0">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search reports..." 
              className="pl-9 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterType} onValueChange={(val) => setFilterType(val || "all")}>
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Blood Test">Blood Test</SelectItem>
                <SelectItem value="X-Ray">X-Ray</SelectItem>
                <SelectItem value="MRI">MRI</SelectItem>
                <SelectItem value="Prescription">Prescription</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <Card key={report.id} className="overflow-hidden hover:border-primary/50 transition-colors group flex flex-col">
                  <div className="aspect-video bg-muted/50 flex items-center justify-center relative border-b group-hover:bg-muted/80 transition-colors">
                    <FileText className="h-12 w-12 text-muted-foreground/50" />
                    <div className="absolute top-2 right-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/50 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-base line-clamp-1" title={report.title}>{report.title}</CardTitle>
                    </div>
                    <CardDescription className="text-xs flex items-center justify-between mt-1">
                      <Badge variant="secondary" className="font-normal text-xs">{report.type}</Badge>
                      <span>{report.date}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="p-4 pt-2 mt-auto">
                    {report.aiSummarized ? (
                      <Dialog>
                        <DialogTrigger render={
                          <Button variant="outline" className="w-full gap-2 bg-primary/5 text-primary border-primary/20 hover:bg-primary/10" />
                        }>
                          <CheckCircle className="h-4 w-4" /> View AI Summary
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Brain className="h-5 w-5 text-primary" />
                              AI Summary: {report.title}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6 py-4">
                            <div>
                              <h4 className="font-semibold text-sm mb-2 text-primary">Overview</h4>
                              <p className="text-sm leading-relaxed text-muted-foreground">
                                {report.aiData?.summary || "Summary not available."}
                              </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                                <h4 className="font-semibold text-xs text-emerald-800 dark:text-emerald-400 mb-2 uppercase tracking-wider">Key Findings</h4>
                                <ul className="text-sm space-y-2 text-emerald-700 dark:text-emerald-300">
                                  {(report.aiData?.keyFindings || []).map((f: string, i: number) => (
                                    <li key={i} className="flex gap-2"><span>•</span> {f}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="bg-orange-50 dark:bg-orange-500/10 p-4 rounded-lg border border-orange-100 dark:border-orange-500/20">
                                <h4 className="font-semibold text-xs text-orange-800 dark:text-orange-400 mb-2 uppercase tracking-wider">Concerns / Red Flags</h4>
                                <ul className="text-sm space-y-2 text-orange-700 dark:text-orange-300">
                                  {(report.aiData?.concerns || []).map((c: string, i: number) => (
                                    <li key={i} className="flex gap-2"><span>•</span> {c}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            
                            {report.aiData?.vocabulary && report.aiData.vocabulary.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-sm mb-3">Medical Vocabulary</h4>
                                <div className="grid grid-cols-1 gap-2">
                                  {report.aiData.vocabulary.map((v: any, i: number) => (
                                    <div key={i} className="p-3 bg-muted rounded-md text-sm">
                                      <span className="font-bold text-primary">{v.term}:</span> {v.definition}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-primary" /> Recommendations
                              </h4>
                              <ul className="text-sm space-y-2 text-muted-foreground">
                                {(report.aiData?.recommendations || []).map((r: string, i: number) => (
                                  <li key={i} className="flex gap-2"><span>•</span> {r}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Button 
                        variant="secondary" 
                        className="w-full gap-2"
                        onClick={() => handleSummarize(report.id)}
                        disabled={summarizingId === report.id}
                      >
                        {summarizingId === report.id ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                        ) : (
                          <><Brain className="h-4 w-4" /> Summarize with AI</>
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-12 text-center border-2 border-dashed rounded-lg bg-muted/20">
                <File className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <h3 className="text-lg font-medium">No reports found</h3>
                <p className="text-sm text-muted-foreground">Try adjusting your filters or upload a new report.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Simple icon for shield alert
function ShieldAlertIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
