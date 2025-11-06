# Multi-Model Comparison Flow Diagram

## 🔄 Complete Analysis Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER INTERACTION                              │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  Click "Multi-Model     │
                    │  Comparison" Tab        │
                    └─────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    UPLOAD INTERFACE                                  │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  📸 Upload Medical Image                                    │    │
│  │  • Drag & Drop or Click to Browse                          │    │
│  │  • Accepts: JPG, PNG, WebP                                 │    │
│  │  • Min Resolution: 512x512                                 │    │
│  │  • Max Size: 10MB                                          │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  User Uploads Image     │
                    └─────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND VALIDATION                               │
│                                                                       │
│  ❌ IF INVALID:                     ✅ IF VALID:                    │
│  • Size < 512x512 → IMG_001         • Display preview              │
│  • Format ≠ image → IMG_002         • Enable "Analyze" button      │
│  • Size > 10MB → IMG_003            • Proceed to analysis           │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  Click "Analyze with    │
                    │  All Models"            │
                    └─────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│              ANALYSIS ORCHESTRATOR                                   │
│  Function: analyzeImageWithAllModels()                              │
│                                                                       │
│  1️⃣ Convert image to Base64                                         │
│  2️⃣ Extract MIME type                                               │
│  3️⃣ Generate request ID                                             │
│  4️⃣ Initialize 4 model result objects                               │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    REAL API CALL: GEMINI                            │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  🔵 Gemini API (gemini-2.0-flash-exp)                      │    │
│  │                                                             │    │
│  │  Step 1: Validate API key                                  │    │
│  │  Step 2: Convert image to generative content parts         │    │
│  │  Step 3: Send to Google AI with prompt                     │    │
│  │  Step 4: Parse JSON response (3 strategies)                │    │
│  │  Step 5: Return MedicalDiagnosis object                    │    │
│  │                                                             │    │
│  │  ⏱️ Timeout: 30 seconds                                     │    │
│  │  ⚡ Typical Latency: 2-4 seconds                            │    │
│  │                                                             │    │
│  │  Response:                                                  │    │
│  │  {                                                          │    │
│  │    diagnosis: "Condition name",                            │    │
│  │    confidence: 0.85,                                       │    │
│  │    severity: "mild/moderate/severe",                       │    │
│  │    description: "Detailed analysis...",                    │    │
│  │    treatment: "Recommendations...",                        │    │
│  │    precautions: ["Step 1", "Step 2"]                       │    │
│  │  }                                                          │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  Gemini Result Ready    │
                    │  Status: ✓ Complete     │
                    └─────────────────────────┘
                                  │
                  ┌───────────────┴───────────────┐
                  ▼                               ▼
┌─────────────────────────────┐   ┌─────────────────────────────┐
│  ERROR HANDLING             │   │  SUCCESS PATH               │
│                             │   │                             │
│  If API call fails:         │   │  Gemini result stored       │
│  • API_001: Timeout         │   │  Mock generation starts     │
│  • API_002: Rate limit      │   │                             │
│  • API_003: Auth failure    │   │  ➡️ Proceed to mock         │
│  • MODEL_001: Inference err │   │     generation              │
│                             │   │                             │
│  ➡️ Show error banner       │   └─────────────────────────────┘
│  ➡️ Enable retry button     │                 │
│  ➡️ Stop mock generation    │                 ▼
└─────────────────────────────┘   ┌─────────────────────────────┐
                                   │  MOCK GENERATION            │
                                   │  Function:                  │
                                   │  generateMockModelResults() │
                                   └─────────────────────────────┘
                                                │
                  ┌─────────────────────────────┼─────────────────────────────┐
                  ▼                             ▼                             ▼
┌───────────────────────────┐ ┌───────────────────────────┐ ┌───────────────────────────┐
│  🟣 ResNet50 (MOCK)       │ │  🟢 OpenCV (MOCK)         │ │  🟠 YOLOv8 (MOCK)         │
│                           │ │                           │ │                           │
│  Base: Gemini diagnosis   │ │  Base: Gemini diagnosis   │ │  Base: Gemini diagnosis   │
│  Confidence: ±8%          │ │  Confidence: ±12%         │ │  Confidence: ±10%         │
│  Delay: 300ms             │ │  Delay: 500ms             │ │  Delay: 800ms             │
│  Latency: 280-320ms       │ │  Latency: 480-520ms       │ │  Latency: 780-820ms       │
│                           │ │                           │ │                           │
│  Findings:                │ │  Findings:                │ │  Findings:                │
│  "Deep neural network"    │ │  "Edge detection"         │ │  "Real-time detection"    │
│  "Pattern recognition"    │ │  "Feature analysis"       │ │  "Object classification"  │
│                           │ │                           │ │                           │
│  Status: ⏳ → ✓           │ │  Status: ⏳ → ✓           │ │  Status: ⏳ → ✓           │
└───────────────────────────┘ └───────────────────────────┘ └───────────────────────────┘
                  │                             │                             │
                  └─────────────────────────────┼─────────────────────────────┘
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ALL MODELS COMPLETE                               │
│                                                                       │
│  Results Array:                                                      │
│  [                                                                    │
│    { modelName: "Gemini API", status: "complete", confidence: 85% }, │
│    { modelName: "ResNet50", status: "complete", confidence: 79% },   │
│    { modelName: "OpenCV", status: "complete", confidence: 73% },     │
│    { modelName: "YOLOv8", status: "complete", confidence: 82% }      │
│  ]                                                                    │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CONSENSUS CALCULATION                             │
│  Function: getConsensus()                                           │
│                                                                       │
│  Algorithm:                                                          │
│  1. Filter models with status === "complete"                        │
│  2. Extract confidence values                                       │
│  3. Calculate average: (85 + 79 + 73 + 82) / 4 = 79.75%            │
│  4. Round to integer: 80%                                           │
│                                                                       │
│  Result: Consensus Confidence = 80%                                 │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        UI RENDERING                                  │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  📊 MODEL COMPARISON RESULTS                               │    │
│  │                                                             │    │
│  │  ┌──────────────────┐ ┌──────────────────┐               │    │
│  │  │  🔵 Gemini API   │ │  🟣 ResNet50     │               │    │
│  │  │  ✓ Complete      │ │  ✓ Complete      │               │    │
│  │  │  85% Confidence  │ │  79% Confidence  │               │    │
│  │  │  2.3s Latency    │ │  0.3s Latency    │               │    │
│  │  └──────────────────┘ └──────────────────┘               │    │
│  │                                                             │    │
│  │  ┌──────────────────┐ ┌──────────────────┐               │    │
│  │  │  🟢 OpenCV       │ │  🟠 YOLOv8       │               │    │
│  │  │  ✓ Complete      │ │  ✓ Complete      │               │    │
│  │  │  73% Confidence  │ │  82% Confidence  │               │    │
│  │  │  0.5s Latency    │ │  0.8s Latency    │               │    │
│  │  └──────────────────┘ └──────────────────┘               │    │
│  │                                                             │    │
│  │  ─────────────────────────────────────────────────────    │    │
│  │                                                             │    │
│  │  🎯 CONSENSUS ANALYSIS                                     │    │
│  │  Average Confidence: 80%                                   │    │
│  │  All models agree on diagnosis                            │    │
│  │                                                             │    │
│  │  📋 Detailed Gemini Analysis:                              │    │
│  │  Diagnosis: [Condition name]                              │    │
│  │  Severity: [Level]                                        │    │
│  │  Description: [Full analysis]                             │    │
│  │  Treatment: [Recommendations]                             │    │
│  │  Precautions: [Safety steps]                              │    │
│  │                                                             │    │
│  │  [Download Report] [Retry Analysis]                       │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    USER ACTIONS                                      │
│                                                                       │
│  Option 1: Download Report (Coming soon - alert shown)              │
│  Option 2: Retry Analysis (upload new image)                        │
│  Option 3: Switch to different consultation tab                     │
│  Option 4: End consultation                                         │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Timing Diagram

```
Time (seconds)    Event
─────────────────────────────────────────────────────────────
0.0s              User clicks "Analyze with All Models"
                  │
                  ├─ All 4 model cards show "Analyzing..." status
                  │  with pulsing animation
                  │
0.1s              ├─ Convert image to Base64
                  ├─ Extract MIME type
                  ├─ Generate request ID
                  │
0.2s              ├─ START: Gemini API call
                  │  Status: "Analyzing..."
                  │
                  │  [Waiting for Gemini response...]
                  │
2.3s              ├─ Gemini API returns result
                  │  Status: "Complete" ✓
                  │  Confidence: 85%
                  │  Latency: 2.3s
                  │
2.6s              ├─ ResNet50 mock completes (+300ms)
                  │  Status: "Complete" ✓
                  │  Confidence: 79% (Gemini -6%)
                  │  Latency: 0.3s
                  │
2.8s              ├─ OpenCV mock completes (+500ms)
                  │  Status: "Complete" ✓
                  │  Confidence: 73% (Gemini -12%)
                  │  Latency: 0.5s
                  │
3.1s              ├─ YOLOv8 mock completes (+800ms)
                  │  Status: "Complete" ✓
                  │  Confidence: 82% (Gemini -3%)
                  │  Latency: 0.8s
                  │
3.2s              ├─ Calculate consensus
                  │  Average: (85+79+73+82)/4 = 79.75% ≈ 80%
                  │
3.3s              └─ Render complete UI
                     • All 4 model cards show checkmarks
                     • Consensus section displays
                     • Gemini detailed analysis visible
                     • Download button enabled
```

---

## 🎨 UI State Transitions

```
┌──────────────────────────────────────────────────────────────┐
│  STATE 1: INITIAL UPLOAD                                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  📤 No image uploaded                                   │ │
│  │  • Upload area with dashed border                      │ │
│  │  • "Click to upload or drag and drop" text            │ │
│  │  • "Analyze" button disabled (gray)                    │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼ User uploads image
┌──────────────────────────────────────────────────────────────┐
│  STATE 2: IMAGE UPLOADED                                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  📸 Image preview displayed                             │ │
│  │  • Thumbnail visible                                   │ │
│  │  • "Change Image" button visible                       │ │
│  │  • "Analyze with All Models" button ENABLED (blue)     │ │
│  │  • 4 model cards showing empty state                   │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼ User clicks "Analyze"
┌──────────────────────────────────────────────────────────────┐
│  STATE 3: ANALYZING                                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ⏳ Analysis in progress                                │ │
│  │  • "Analyze" button disabled with spinner              │ │
│  │  • All 4 model cards show "Analyzing..." with pulse    │ │
│  │  • No results visible yet                              │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼ Models complete (staggered)
┌──────────────────────────────────────────────────────────────┐
│  STATE 4: PARTIAL COMPLETE                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ⏳ Some models done, others analyzing                  │ │
│  │  • Gemini: ✓ Complete (85%, 2.3s)                      │ │
│  │  • ResNet50: ⏳ Analyzing...                            │ │
│  │  • OpenCV: ⏳ Analyzing...                              │ │
│  │  • YOLOv8: ⏳ Analyzing...                              │ │
│  │  • Consensus: Not yet calculated                       │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼ All models finish
┌──────────────────────────────────────────────────────────────┐
│  STATE 5: COMPLETE SUCCESS                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ✅ All models complete                                 │ │
│  │  • Gemini: ✓ Complete (85%, 2.3s)                      │ │
│  │  • ResNet50: ✓ Complete (79%, 0.3s)                    │ │
│  │  • OpenCV: ✓ Complete (73%, 0.5s)                      │ │
│  │  • YOLOv8: ✓ Complete (82%, 0.8s)                      │ │
│  │  • Consensus: 80% average confidence                   │ │
│  │  • Detailed analysis visible                           │ │
│  │  • Download button enabled                             │ │
│  │  • "Analyze Again" button enabled                      │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼ Error occurs (alternative path)
┌──────────────────────────────────────────────────────────────┐
│  STATE 6: ERROR                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ❌ Analysis failed                                     │ │
│  │  • Error banner visible (red background)               │ │
│  │  • Error code displayed (e.g., "IMG_001")              │ │
│  │  • User-friendly message                               │ │
│  │  • Technical details (collapsible)                     │ │
│  │  • "Retry Analysis" button                             │ │
│  │  • "Try Different Image" button                        │ │
│  │  • No model results shown                              │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔀 Decision Tree

```
                        START ANALYSIS
                              │
                              ▼
                    ┌─────────────────┐
                    │ Validate Image  │
                    └─────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
         ❌ INVALID                   ✅ VALID
                │                           │
                ▼                           ▼
    ┌──────────────────────┐    ┌──────────────────────┐
    │ Show Error:          │    │ Call Gemini API      │
    │ • IMG_001 (size)     │    └──────────────────────┘
    │ • IMG_002 (format)   │                │
    │ • IMG_003 (file size)│    ┌───────────┴───────────┐
    └──────────────────────┘    ▼                       ▼
                         ❌ API ERROR            ✅ API SUCCESS
                                │                       │
                                ▼                       ▼
                    ┌──────────────────────┐  ┌──────────────────────┐
                    │ Show Error:          │  │ Generate Mock        │
                    │ • API_001 (timeout)  │  │ Results from Gemini  │
                    │ • API_002 (rate)     │  └──────────────────────┘
                    │ • API_003 (auth)     │              │
                    │ • MODEL_001 (infer)  │              ▼
                    └──────────────────────┘    ┌──────────────────────┐
                                │                │ Stagger Completion:  │
                                ▼                │ • ResNet50: +300ms   │
                    ┌──────────────────────┐    │ • OpenCV: +500ms     │
                    │ Stop Mock Generation │    │ • YOLOv8: +800ms     │
                    │ Show Retry Button    │    └──────────────────────┘
                    └──────────────────────┘              │
                                                          ▼
                                              ┌──────────────────────┐
                                              │ Calculate Consensus  │
                                              │ (Average of 4 conf.) │
                                              └──────────────────────┘
                                                          │
                                                          ▼
                                              ┌──────────────────────┐
                                              │ Render Complete UI   │
                                              │ with all results     │
                                              └──────────────────────┘
```

---

## 🎬 Animation Sequence

```
Frame 0ms:     [ Upload button appears ]
               │
               ▼ User uploads image
Frame 100ms:   [ Image preview fades in ]
               │
               ▼ User clicks "Analyze"
Frame 200ms:   [ All 4 model cards appear with pulsing dots ]
               │
Frame 2300ms:  [ Gemini card: pulse → checkmark animation ]
               │
Frame 2600ms:  [ ResNet50 card: pulse → checkmark animation ]
               │
Frame 2800ms:  [ OpenCV card: pulse → checkmark animation ]
               │
Frame 3100ms:  [ YOLOv8 card: pulse → checkmark animation ]
               │
Frame 3200ms:  [ Consensus section slides in from bottom ]
               │
Frame 3300ms:  [ Download button fades in ]
```

---

## 📈 Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  FRONTEND: ImageConsultationMultiModelComparison.tsx         │
│                                                               │
│  State:                                                       │
│  • uploadedImage: File | null                                │
│  • geminiResult: MedicalDiagnosis | null                     │
│  • modelResults: ModelResult[]                               │
│  • isAnalyzing: boolean                                      │
│  • error: ErrorDetails | null                                │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼ analyzeImageWithAllModels()
┌──────────────────────────────────────────────────────────────┐
│  SERVICE: geminiService.ts                                   │
│                                                               │
│  Function: analyzeImageWithGemini(base64Data, mimeType)     │
│                                                               │
│  Input:                                                      │
│  • base64Data: string (image encoded)                       │
│  • mimeType: "image/jpeg" | "image/png" | "image/webp"     │
│                                                               │
│  Process:                                                    │
│  1. Validate API key                                        │
│  2. Create generative model instance                        │
│  3. Construct prompt                                        │
│  4. Call API with timeout (30s)                             │
│  5. Parse JSON (3 strategies)                               │
│  6. Return MedicalDiagnosis                                 │
│                                                               │
│  Output:                                                     │
│  • MedicalDiagnosis object OR ErrorDetails                  │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  EXTERNAL: Google Generative AI API                          │
│                                                               │
│  Endpoint: gemini-2.0-flash-exp                              │
│  Request:                                                    │
│  {                                                            │
│    contents: [{                                              │
│      role: "user",                                           │
│      parts: [                                                │
│        { text: "Medical image analysis prompt..." },         │
│        { inlineData: { mimeType, data: base64 } }           │
│      ]                                                       │
│    }]                                                        │
│  }                                                            │
│                                                               │
│  Response:                                                   │
│  {                                                            │
│    candidates: [{                                            │
│      content: {                                              │
│        parts: [{                                             │
│          text: "{ diagnosis: '...', ... }"                   │
│        }]                                                    │
│      }                                                       │
│    }]                                                        │
│  }                                                            │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼ Response parsed
┌──────────────────────────────────────────────────────────────┐
│  FRONTEND: generateMockModelResults()                        │
│                                                               │
│  Input: MedicalDiagnosis (from Gemini)                      │
│                                                               │
│  Algorithm:                                                  │
│  1. Extract diagnosis string                                │
│  2. Extract confidence value                                │
│  3. For each mock model:                                    │
│     a. Vary confidence (±8%, ±12%, ±10%)                    │
│     b. Set realistic latency                                │
│     c. Generate model-specific findings                     │
│     d. Set status to "analyzing"                            │
│  4. Return array of 3 ModelResult objects                   │
│                                                               │
│  Output:                                                     │
│  [                                                            │
│    { modelName: "ResNet50", ... },                          │
│    { modelName: "OpenCV", ... },                            │
│    { modelName: "YOLOv8", ... }                             │
│  ]                                                            │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼ setTimeout delays
┌──────────────────────────────────────────────────────────────┐
│  STATE UPDATE: modelResults array                            │
│                                                               │
│  Update 1 (t+300ms): ResNet50 → status: "complete"          │
│  Update 2 (t+500ms): OpenCV → status: "complete"            │
│  Update 3 (t+800ms): YOLOv8 → status: "complete"            │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼ All complete
┌──────────────────────────────────────────────────────────────┐
│  FRONTEND: getConsensus()                                    │
│                                                               │
│  Algorithm:                                                  │
│  1. Filter: modelResults.filter(m => m.status === "complete")│
│  2. Map: completeModels.map(m => m.confidence)              │
│  3. Reduce: sum / count                                     │
│  4. Round to integer                                        │
│                                                               │
│  Example:                                                    │
│  [85, 79, 73, 82] → sum = 319 → 319/4 = 79.75 → 80%        │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  RENDER: Complete UI with all results                        │
└──────────────────────────────────────────────────────────────┘
```

---

**Documentation Version**: 1.0.0  
**Last Updated**: January 2025  
**Status**: ✅ Complete
