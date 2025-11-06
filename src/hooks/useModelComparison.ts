/**
 * React Hook for Model Comparison
 * Manages comparison runs, model selection, and results
 */
import { useState, useEffect, useCallback } from 'react';
import comparisonApi, {
  ModelVersion,
  ComparisonRun,
  ComparisonRunRequest,
  ModelRegistrationRequest,
} from '../services/comparisonApi';

export interface UseModelComparisonOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useModelComparison(options: UseModelComparisonOptions = {}) {
  const { autoRefresh = false, refreshInterval = 5000 } = options;

  const [models, setModels] = useState<ModelVersion[]>([]);
  const [runs, setRuns] = useState<ComparisonRun[]>([]);
  const [activeRun, setActiveRun] = useState<ComparisonRun | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all registered models
  const fetchModels = useCallback(async (filterByName?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await comparisonApi.listModels(filterByName);
      setModels(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch models');
      console.error('Error fetching models:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch comparison runs
  const fetchRuns = useCallback(async (status?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await comparisonApi.listComparisonRuns(status);
      setRuns(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch runs');
      console.error('Error fetching runs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Start a new comparison
  const startComparison = useCallback(
    async (config: ComparisonRunRequest): Promise<ComparisonRun | null> => {
      try {
        setLoading(true);
        setError(null);
        const run = await comparisonApi.createComparisonRun(config);
        setActiveRun(run);
        setRuns((prev) => [run, ...prev]);
        return run;
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to start comparison');
        console.error('Error starting comparison:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get detailed run information
  const fetchRunDetails = useCallback(async (runId: string) => {
    try {
      setLoading(true);
      setError(null);
      const run = await comparisonApi.getComparisonRun(runId);
      setActiveRun(run);
      return run;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch run details');
      console.error('Error fetching run details:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get run results with predictions
  const fetchRunResults = useCallback(
    async (runId: string, includePredictions: boolean = false) => {
      try {
        setLoading(true);
        setError(null);
        const results = await comparisonApi.getRunResults(runId, includePredictions);
        return results;
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to fetch run results');
        console.error('Error fetching run results:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Export results
  const exportResults = useCallback(
    async (runId: string, format: 'json' | 'csv' | 'pdf' = 'json') => {
      try {
        setLoading(true);
        setError(null);
        const data = await comparisonApi.exportResults(runId, format);

        // Download file
        if (format === 'json') {
          const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json',
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `comparison_${runId}.json`;
          a.click();
          URL.revokeObjectURL(url);
        } else if (format === 'csv' && data.csv_data) {
          const blob = new Blob([data.csv_data], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `comparison_${runId}.csv`;
          a.click();
          URL.revokeObjectURL(url);
        }

        return data;
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to export results');
        console.error('Error exporting results:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Register a new model
  const registerModel = useCallback(
    async (modelData: ModelRegistrationRequest): Promise<ModelVersion | null> => {
      try {
        setLoading(true);
        setError(null);
        const model = await comparisonApi.registerModel(modelData);
        setModels((prev) => [model, ...prev]);
        return model;
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to register model');
        console.error('Error registering model:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get cache statistics
  const fetchCacheStats = useCallback(async () => {
    try {
      const stats = await comparisonApi.getCacheStats();
      return stats;
    } catch (err: any) {
      console.error('Error fetching cache stats:', err);
      return null;
    }
  }, []);

  // Auto-refresh active run
  useEffect(() => {
    if (!autoRefresh || !activeRun || activeRun.status === 'completed' || activeRun.status === 'failed') {
      return;
    }

    const interval = setInterval(async () => {
      const updatedRun = await fetchRunDetails(activeRun.run_id);
      if (updatedRun && (updatedRun.status === 'completed' || updatedRun.status === 'failed')) {
        clearInterval(interval);
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, activeRun, refreshInterval, fetchRunDetails]);

  return {
    // State
    models,
    runs,
    activeRun,
    loading,
    error,

    // Actions
    fetchModels,
    fetchRuns,
    startComparison,
    fetchRunDetails,
    fetchRunResults,
    exportResults,
    registerModel,
    fetchCacheStats,
    setActiveRun,

    // Utilities
    clearError: () => setError(null),
  };
}

export default useModelComparison;
