"""
Initialize database with all tables
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import init_db
from backend.models.comparison_models import Base

if __name__ == "__main__":
    print("Initializing Arogya database...")
    try:
        init_db()
        print("✅ Database initialized successfully!")
        print("   - ModelVersion table created")
        print("   - ComparisonRun table created")
        print("   - EvaluationResult table created")
        print("   - ImagePrediction table created")
        print("   - Artifact table created")
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        sys.exit(1)
