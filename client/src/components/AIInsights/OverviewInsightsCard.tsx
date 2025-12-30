import { useState, useEffect } from "react";
import { OverviewInsights } from "@/types";
import {
  fetchOverviewInsights,
  regenerateOverviewInsights,
} from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InsightItem } from "./InsightItem";
import { InsightsSkeleton } from "@/components/Skeletons/InsightsSkeleton";
import {
  RefreshCw,
  Loader2,
  Sparkles,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface OverviewInsightsCardProps {
  userId: string;
}

export function OverviewInsightsCard({ userId }: OverviewInsightsCardProps) {
  const [insights, setInsights] = useState<OverviewInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize from localStorage, default to true (expanded)
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem("overviewInsightsExpanded");
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Save to localStorage whenever collapse state changes
  useEffect(() => {
    localStorage.setItem(
      "overviewInsightsExpanded",
      JSON.stringify(isExpanded)
    );
  }, [isExpanded]);

  useEffect(() => {
    loadInsights();
  }, [userId]);

  const loadInsights = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchOverviewInsights(userId);
      setInsights(data);
    } catch (err: any) {
      setError(err.message || "Failed to load insights");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      setError(null);
      const data = await regenerateOverviewInsights(userId);
      setInsights(data);
    } catch (err: any) {
      setError(err.message || "Failed to regenerate insights");
    } finally {
      setIsRegenerating(false);
    }
  };

  if (isLoading) {
    return <InsightsSkeleton />;
  }

  if (error) {
    return (
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={loadInsights} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) return null;

  return (
    <Card className="bg-slate-800/50 border-slate-700/50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity"
          >
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Sparkles className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                AI Financial Insights
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Generated {new Date(insights.generatedAt).toLocaleDateString()}
                {!isExpanded &&
                  ` • Score: ${insights.financialHealthScore}/100`}
              </p>
            </div>
          </button>
          <Button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            variant="outline"
            size="sm"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-600 hover:border-slate-500 transition-all flex-shrink-0"
          >
            {isRegenerating ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>

        {isExpanded && (
          <>
            {/* Financial Health Score */}
            <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-white">
                  Financial Health Score
                </h3>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <span className="text-3xl font-bold text-emerald-400">
                    {insights.financialHealthScore}
                    <span className="text-lg text-slate-400">/100</span>
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 mb-3">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full transition-all"
                  style={{ width: `${insights.financialHealthScore}%` }}
                />
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {insights.summary}
              </p>
            </div>

            {/* Key Insights */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Key Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.insights.map((insight) => (
                  <InsightItem key={insight.id} insight={insight} />
                ))}
              </div>
            </div>

            {/* Predictions */}
            {insights.predictions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Predictions & Recommendations
                </h3>
                <div className="space-y-2">
                  {insights.predictions.map((prediction, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/30"
                    >
                      <TrendingUp className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-slate-300">{prediction}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
