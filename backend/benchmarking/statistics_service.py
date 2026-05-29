"""
Statistics Service for Benchmarking
Statistical tests and confidence intervals
"""

import numpy as np
from scipy import stats
from typing import Tuple, Dict
import logging

logger = logging.getLogger(__name__)


class StatisticsService:
    """Perform statistical tests on benchmark results"""
    
    @staticmethod
    def paired_t_test(
        model_a_scores: np.ndarray,
        model_b_scores: np.ndarray,
        alpha: float = 0.05
    ) -> Dict:
        """
        Perform paired t-test between two models
        
        Args:
            model_a_scores: Array of scores for model A
            model_b_scores: Array of scores for model B
            alpha: Significance level
        
        Returns:
            Dict with test results
        """
        
        # Ensure same length
        min_len = min(len(model_a_scores), len(model_b_scores))
        model_a_scores = model_a_scores[:min_len]
        model_b_scores = model_b_scores[:min_len]
        
        if min_len < 2:
            return {
                't_statistic': 0.0,
                'p_value': 1.0,
                'significant': False,
                'cohens_d': 0.0,
                'mean_difference': 0.0,
                'confidence_interval': (0.0, 0.0),
                'sample_size': min_len
            }
        
        # Perform paired t-test
        t_stat, p_value = stats.ttest_rel(model_a_scores, model_b_scores)
        
        # Compute effect size (Cohen's d)
        diff = model_a_scores - model_b_scores
        cohens_d = np.mean(diff) / (np.std(diff) + 1e-8)
        
        # Compute confidence interval
        mean_diff = np.mean(diff)
        std_diff = np.std(diff)
        se_diff = std_diff / np.sqrt(len(diff))
        ci_lower = mean_diff - 1.96 * se_diff
        ci_upper = mean_diff + 1.96 * se_diff
        
        return {
            't_statistic': float(t_stat),
            'p_value': float(p_value),
            'significant': p_value < alpha,
            'cohens_d': float(cohens_d),
            'mean_difference': float(mean_diff),
            'confidence_interval': (float(ci_lower), float(ci_upper)),
            'sample_size': len(diff)
        }
    
    @staticmethod
    def confidence_interval(
        scores: np.ndarray,
        confidence: float = 0.95
    ) -> Tuple[float, float]:
        """
        Compute confidence interval for scores
        
        Args:
            scores: Array of scores
            confidence: Confidence level (e.g., 0.95 for 95%)
        
        Returns:
            Tuple of (lower, upper) bounds
        """
        
        mean = np.mean(scores)
        std = np.std(scores)
        se = std / np.sqrt(len(scores))
        
        z_score = stats.norm.ppf((1 + confidence) / 2)
        margin_of_error = z_score * se
        
        return (mean - margin_of_error, mean + margin_of_error)
    
    @staticmethod
    def multiple_comparisons_correction(
        p_values: np.ndarray,
        method: str = 'bonferroni'
    ) -> np.ndarray:
        """
        Apply multiple comparisons correction
        
        Args:
            p_values: Array of p-values
            method: 'bonferroni' or 'benjamini_hochberg'
        
        Returns:
            Corrected p-values
        """
        
        if method == 'bonferroni':
            return np.minimum(p_values * len(p_values), 1.0)
        elif method == 'benjamini_hochberg':
            # Sort p-values
            sorted_indices = np.argsort(p_values)
            sorted_p = p_values[sorted_indices]
            
            # Compute BH-adjusted p-values
            n = len(p_values)
            bh_adjusted = sorted_p * n / (np.arange(1, n + 1))
            
            # Ensure monotonicity
            for i in range(n - 2, -1, -1):
                bh_adjusted[i] = min(bh_adjusted[i], bh_adjusted[i + 1])
            
            # Unsort
            result = np.empty_like(bh_adjusted)
            result[sorted_indices] = bh_adjusted
            
            return np.minimum(result, 1.0)
        else:
            raise ValueError(f"Unknown method: {method}")
    
    @staticmethod
    def effect_size_interpretation(cohens_d: float) -> str:
        """
        Interpret Cohen's d effect size
        
        Args:
            cohens_d: Cohen's d value
        
        Returns:
            Interpretation string
        """
        abs_d = abs(cohens_d)
        
        if abs_d < 0.2:
            return "negligible"
        elif abs_d < 0.5:
            return "small"
        elif abs_d < 0.8:
            return "medium"
        else:
            return "large"
