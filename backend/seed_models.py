"""
Seed script to register sample medical AI models
Run this after database initialization to populate with example models
"""
import sys
import os
import requests
import json

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

API_BASE_URL = "http://localhost:8000"

# Sample models to register
SAMPLE_MODELS = [
    {
        "model_name": "SkinNet-ResNet50",
        "version": "1.0.0",
        "config": {
            "architecture": "ResNet50",
            "input_size": [224, 224, 3],
            "num_classes": 10,
            "pretrained": True,
            "description": "Skin disease classifier based on ResNet50"
        },
        "weights_path": "/models/skinnet_resnet50_v1.pth"
    },
    {
        "model_name": "SkinNet-EfficientNet",
        "version": "2.0.0",
        "config": {
            "architecture": "EfficientNet-B3",
            "input_size": [300, 300, 3],
            "num_classes": 10,
            "pretrained": True,
            "description": "Improved skin disease classifier with EfficientNet"
        },
        "weights_path": "/models/skinnet_efficientnet_v2.pth"
    },
    {
        "model_name": "EyeNet-DenseNet",
        "version": "1.0.0",
        "config": {
            "architecture": "DenseNet121",
            "input_size": [224, 224, 3],
            "num_classes": 5,
            "pretrained": True,
            "description": "Eye disease detection model"
        },
        "weights_path": "/models/eyenet_densenet_v1.pth"
    },
    {
        "model_name": "EyeNet-VGG",
        "version": "1.5.0",
        "config": {
            "architecture": "VGG16",
            "input_size": [224, 224, 3],
            "num_classes": 5,
            "pretrained": True,
            "description": "Eye disease detection with VGG16"
        },
        "weights_path": "/models/eyenet_vgg_v1.5.pth"
    },
    {
        "model_name": "DermNet-MobileNet",
        "version": "1.0.0",
        "config": {
            "architecture": "MobileNetV2",
            "input_size": [224, 224, 3],
            "num_classes": 23,
            "pretrained": True,
            "description": "Lightweight dermatology classifier"
        },
        "weights_path": "/models/dermnet_mobilenet_v1.pth"
    },
    {
        "model_name": "LungNet-Inception",
        "version": "1.0.0",
        "config": {
            "architecture": "InceptionV3",
            "input_size": [299, 299, 3],
            "num_classes": 3,
            "pretrained": True,
            "description": "Lung disease classifier"
        },
        "weights_path": "/models/lungnet_inception_v1.pth"
    }
]


def register_model(model_data):
    """Register a single model via API"""
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/v2/models/register",
            json=model_data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Registered: {result['model_name']} v{result['version']} (ID: {result['id']})")
            return True
        elif response.status_code == 400:
            error = response.json().get('detail', 'Unknown error')
            if 'already registered' in error:
                print(f"⚠️  Already exists: {model_data['model_name']} v{model_data['version']}")
            else:
                print(f"❌ Error: {error}")
            return False
        else:
            print(f"❌ Failed: {response.status_code} - {response.text}")
            return False
    
    except requests.exceptions.ConnectionError:
        print(f"❌ Cannot connect to API at {API_BASE_URL}")
        print("   Make sure the backend is running: python backend/main.py")
        return False
    except Exception as e:
        print(f"❌ Error registering model: {e}")
        return False


def check_backend():
    """Check if backend is running"""
    try:
        response = requests.get(f"{API_BASE_URL}/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend is running: {data.get('status', 'OK')}")
            return True
        else:
            print(f"⚠️  Backend returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"❌ Cannot connect to backend at {API_BASE_URL}")
        print("   Please start the backend first:")
        print("   1. Activate venv: .\\venv\\Scripts\\Activate.ps1")
        print("   2. Run backend: python backend/main.py")
        return False
    except Exception as e:
        print(f"❌ Error checking backend: {e}")
        return False


def main():
    print("=" * 60)
    print("Arogya Model Registration - Seeding Sample Models")
    print("=" * 60)
    print()
    
    # Check if backend is running
    print("Step 1: Checking backend connection...")
    if not check_backend():
        sys.exit(1)
    
    print()
    print(f"Step 2: Registering {len(SAMPLE_MODELS)} sample models...")
    print("-" * 60)
    
    success_count = 0
    failed_count = 0
    skipped_count = 0
    
    for model in SAMPLE_MODELS:
        result = register_model(model)
        if result:
            success_count += 1
        elif "already exists" in str(result):
            skipped_count += 1
        else:
            failed_count += 1
    
    print()
    print("-" * 60)
    print("Summary:")
    print(f"  ✅ Successfully registered: {success_count}")
    print(f"  ⚠️  Already existed: {skipped_count}")
    print(f"  ❌ Failed: {failed_count}")
    print()
    
    if success_count > 0 or skipped_count > 0:
        print("✅ Models are ready for comparison!")
        print()
        print("Next steps:")
        print("  1. Open http://localhost:5173")
        print("  2. Login with any email")
        print("  3. Navigate to 'Model Comparison' dashboard")
        print("  4. Select 2-5 models and start a comparison")
        print()
        print("To view registered models:")
        print(f"  curl {API_BASE_URL}/api/v2/models")
    else:
        print("❌ No models were registered")
        print("   Please check the errors above and try again")


if __name__ == "__main__":
    main()
