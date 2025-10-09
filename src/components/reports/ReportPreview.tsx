import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Printer } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ReportPreviewProps {
  report: any;
}

export const ReportPreview = ({ report }: ReportPreviewProps) => {
  const handleExportCSV = () => {
    let csv = "";

    // Header
    csv += `${report.title}\n`;
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;

    // Statistics
    csv += "Summary Statistics\n";
    csv += `Total Observations,${report.statistics.totalObservations}\n`;
    csv += `Average On-Task %,${report.statistics.averageOnTask}%\n`;
    csv += `Total Duration,${Math.floor(report.statistics.totalDuration / 60)}m ${report.statistics.totalDuration % 60}s\n\n`;

    // Type-specific data
    if (report.observerData) {
      csv += "Observer,Observation Count,Avg On-Task %\n";
      report.observerData.forEach((d: any) => {
        csv += `${d.observer},${d.count},${d.avgOnTask}%\n`;
      });
    }

    if (report.activityData) {
      csv += "Activity,Observation Count,Avg On-Task %\n";
      report.activityData.forEach((d: any) => {
        csv += `${d.activity},${d.count},${d.avgOnTask}%\n`;
      });
    }

    if (report.locationData) {
      csv += "Location,Observation Count,Avg On-Task %\n";
      report.locationData.forEach((d: any) => {
        csv += `${d.location},${d.count},${d.avgOnTask}%\n`;
      });
    }

    if (report.promptData) {
      csv += "Prompt Type,Total Used,Effective,Partially Effective,Ineffective,Success Rate\n";
      report.promptData.forEach((d: any) => {
        csv += `${d.type},${d.total},${d.effective},${d.partial},${d.ineffective},${d.successRate}%\n`;
      });
    }

    // Download
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6 print:p-8">
      {/* Header with Export Options */}
      <Card className="print:shadow-none">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{report.title}</CardTitle>
              <CardDescription>
                Generated on {new Date().toLocaleString()}
              </CardDescription>
            </div>
            <div className="flex gap-2 print:hidden">
              <Button onClick={handleExportCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={handlePrint} variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Statistics */}
      <Card className="print:shadow-none">
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Observations</p>
              <p className="text-3xl font-bold">{report.statistics.totalObservations}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Average On-Task</p>
              <p className="text-3xl font-bold text-green-600">
                {report.statistics.averageOnTask}%
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Duration</p>
              <p className="text-3xl font-bold">
                {formatDuration(report.statistics.totalDuration)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observer Data */}
      {report.observerData && (
        <Card className="print:shadow-none">
          <CardHeader>
            <CardTitle>Observer Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Observer</TableHead>
                  <TableHead className="text-right">Observation Count</TableHead>
                  <TableHead className="text-right">Avg On-Task %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.observerData.map((d: any) => (
                  <TableRow key={d.observer}>
                    <TableCell className="font-medium">{d.observer}</TableCell>
                    <TableCell className="text-right">{d.count}</TableCell>
                    <TableCell className="text-right">{d.avgOnTask}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Activity Data */}
      {report.activityData && (
        <Card className="print:shadow-none">
          <CardHeader>
            <CardTitle>Activity Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activity</TableHead>
                  <TableHead className="text-right">Observation Count</TableHead>
                  <TableHead className="text-right">Avg On-Task %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.activityData.map((d: any) => (
                  <TableRow key={d.activity}>
                    <TableCell className="font-medium">{d.activity}</TableCell>
                    <TableCell className="text-right">{d.count}</TableCell>
                    <TableCell className="text-right">{d.avgOnTask}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Location Data */}
      {report.locationData && (
        <Card className="print:shadow-none">
          <CardHeader>
            <CardTitle>Location Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Observation Count</TableHead>
                  <TableHead className="text-right">Avg On-Task %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.locationData.map((d: any) => (
                  <TableRow key={d.location}>
                    <TableCell className="font-medium">{d.location}</TableCell>
                    <TableCell className="text-right">{d.count}</TableCell>
                    <TableCell className="text-right">{d.avgOnTask}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Prompt Effectiveness Data */}
      {report.promptData && (
        <Card className="print:shadow-none">
          <CardHeader>
            <CardTitle>Prompt Effectiveness Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prompt Type</TableHead>
                  <TableHead className="text-right">Total Used</TableHead>
                  <TableHead className="text-right">Effective</TableHead>
                  <TableHead className="text-right">Partial</TableHead>
                  <TableHead className="text-right">Ineffective</TableHead>
                  <TableHead className="text-right">Success Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.promptData.map((d: any) => (
                  <TableRow key={d.type}>
                    <TableCell className="font-medium">{d.type}</TableCell>
                    <TableCell className="text-right">{d.total}</TableCell>
                    <TableCell className="text-right text-green-600">{d.effective}</TableCell>
                    <TableCell className="text-right text-yellow-600">{d.partial}</TableCell>
                    <TableCell className="text-right text-red-600">{d.ineffective}</TableCell>
                    <TableCell className="text-right font-semibold">{d.successRate}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Detailed Observations List */}
      <Card className="print:shadow-none print:break-before-page">
        <CardHeader>
          <CardTitle>Detailed Observations</CardTitle>
          <CardDescription>
            Complete list of observations included in this report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.observations.slice(0, 50).map((obs: any) => (
              <div key={obs.id} className="border-b pb-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">
                      {obs.student} - {obs.status.toUpperCase()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(obs.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-sm">
                    Duration: {formatDuration(obs.duration)}
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-2 text-xs">
                  <p>
                    <span className="font-medium">Observer:</span> {obs.observer}
                  </p>
                  <p>
                    <span className="font-medium">Activity:</span> {obs.context.what}
                  </p>
                  <p>
                    <span className="font-medium">Location:</span> {obs.context.where}
                  </p>
                  <p>
                    <span className="font-medium">When:</span> {obs.context.when}
                  </p>
                </div>
              </div>
            ))}
            {report.observations.length > 50 && (
              <p className="text-sm text-muted-foreground text-center">
                ... and {report.observations.length - 50} more observations
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
