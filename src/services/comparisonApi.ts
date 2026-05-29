/**
 * API Client for Model Comparison v2 Endpoints
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface ModelConfig {
  architecture?: string;
  input_size?: number[];
  num_classes?: number;
  [key: string]: any;
}

export interface ModelVersion {
  id: number;
  model_name: string;
  version: string;
  config: ModelConfig;
  created_at: string;
}

export interface Metrics {
  accuracy?: number;
  f1_score?: number;
  precision?: number;
  recall?: number;
  latency_mean_ms?: number;
  throughput_imgs_per_sec?: number;
  memory_peak_mb?: number;
}

export interface ModelResult {
  model_id: number;
  model_name: string;
  version: string;
  metrics: Metrics;
}

export interface ComparisonRun {
  run_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress_pct: number;
  dataset_name: string | null;
  models: ModelResult[];
  artifacts: Record<string, string>;
  created_at: string;
  completed_at: string | null;
}

export interface ImagePrediction {
  image_id: string;
  predicted_class: string;
  confidence: number;
  ground_truth: string | null;
  is_correct: boolean | null;
  inference_time_ms: number | null;
}

export interface ComparisonRunRequest {
  model_ids: number[];
  dataset_id: string;
  dataset_name?: string;
  config?: Record<string, any>;
  run_name?: string;
}

export interface ModelRegistrationRequest {
  model_name: string;
  version: string;
  config: ModelConfig;
  weights_path?: string;
}

class ComparisonApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Model Management
  async registerModel(data: ModelRegistrationRequest): Promise<ModelVersion> {
    const response = await axios.post(`${this.baseUrl}/api/v2/models/register`, data);
    return response.data;
  }

  async listModels(
    filterByName?: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<ModelVersion[]> {
    const params: any = { limit, offset };
    if (filterByName) params.filter_by_name = filterByName;
    
    const response = await axios.get(`${this.baseUrl}/api/v2/models`, { params });
    return response.data;
  }

  // Comparison Runs
  async createComparisonRun(data: ComparisonRunRequest): Promise<ComparisonRun> {
    const response = await axios.post(`${this.baseUrl}/api/v2/comparison/runs`, data);
    return response.data;
  }

  async listComparisonRuns(
    status?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ComparisonRun[]> {
    const params: any = { limit, offset };
    if (status) params.status = status;
    
    const response = await axios.get(`${this.baseUrl}/api/v2/comparison/runs`, { params });
    return response.data;
  }

  async getComparisonRun(runId: string): Promise<ComparisonRun> {
    const response = await axios.get(`${this.baseUrl}/api/v2/comparison/runs/${runId}`);
    return response.data;
  }

  async getRunResults(
    runId: string,
    includePredictions: boolean = false,
    limit: number = 100
  ): Promise<any> {
    const params = { include_predictions: includePredictions, limit };
    const response = await axios.get(
      `${this.baseUrl}/api/v2/comparison/runs/${runId}/results`,
      { params }
    );
    return response.data;
  }

  async getRunArtifacts(runId: string, artifactType: string): Promise<any> {
    const response = await axios.get(
      `${this.baseUrl}/api/v2/comparison/runs/${runId}/artifacts/${artifactType}`
    );
    return response.data;
  }

  async exportResults(runId: string, format: 'json' | 'csv' | 'pdf' = 'json'): Promise<any> {
    const response = await axios.post(
      `${this.baseUrl}/api/v2/comparison/runs/${runId}/export`,
      null,
      { params: { format } }
    );
    return response.data;
  }

  async getCacheStats(): Promise<any> {
    const response = await axios.get(`${this.baseUrl}/api/v2/comparison/cache-stats`);
    return response.data;
  }

  // Artifact URLs
  getArtifactUrl(artifactPath: string): string {
    if (artifactPath.startsWith('http')) {
      return artifactPath;
    }
    return `${this.baseUrl}/${artifactPath}`;
  }
}

export const comparisonApi = new ComparisonApiClient();

export default comparisonApi;
