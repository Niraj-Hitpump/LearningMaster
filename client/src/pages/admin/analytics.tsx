import { useQuery } from "@tanstack/react-query";
import { AlertCircle, BookOpen, GraduationCap, Loader2, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/dashboard/sidebar";
import StatsCard from "@/components/dashboard/stats-card";

interface AnalyticsData {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
  coursesByCategory: {
    category: string;
    count: number;
  }[];
}

// Colors for pie chart
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A259FF", "#FF6B6B"];

export default function AdminAnalytics() {
  const {
    data: analyticsData,
    isLoading,
    error,
    refetch,
  } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics/dashboard"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (error) {
    return (
      <div className="flex h-screen">
        <Sidebar isAdmin={true} />
        <div className="flex-1 p-8">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Error Loading Analytics</h2>
              <p className="text-muted-foreground mb-4">
                {error instanceof Error ? error.message : "An unknown error occurred"}
              </p>
              <Button onClick={() => refetch()}>Try Again</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar isAdmin={true} />
      <div className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">View statistics and metrics for your platform</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-[50vh]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : !analyticsData ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No analytics data available</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Total Users"
                value={analyticsData.totalUsers}
                icon={<Users className="h-5 w-5" />}
                description="Registered users"
              />
              <StatsCard
                title="Total Courses"
                value={analyticsData.totalCourses}
                icon={<BookOpen className="h-5 w-5" />}
                description="Available courses"
              />
              <StatsCard
                title="Enrollments"
                value={analyticsData.totalEnrollments}
                icon={<GraduationCap className="h-5 w-5" />}
                description="Total user enrollments"
              />
              <StatsCard
                title="Completion Rate"
                value={`${analyticsData.completionRate}%`}
                icon={<GraduationCap className="h-5 w-5" />}
                description={`${analyticsData.completedEnrollments} completed`}
                trend={
                  analyticsData.completionRate > 50
                    ? { value: analyticsData.completionRate, isPositive: true }
                    : { value: analyticsData.completionRate, isPositive: false }
                }
              />
            </div>

            {/* Charts */}
            <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
              {/* Courses by Category */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Courses by Category</CardTitle>
                  <CardDescription>
                    Distribution of courses across different categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analyticsData.coursesByCategory}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 80,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="category"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          interval={0}
                        />
                        <YAxis allowDecimals={false} />
                        <Tooltip
                          formatter={(value) => [`${value} course(s)`, "Count"]}
                        />
                        <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Category Distribution */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                  <CardDescription>
                    Percentage breakdown of courses by category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.coursesByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={90}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="category"
                        >
                          {analyticsData.coursesByCategory.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name, props) => [
                            `${value} course(s)`,
                            props.payload.category,
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}