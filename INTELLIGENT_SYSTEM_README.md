# Intelligent Travel Planning System

## Overview

This system implements an advanced travel planning pipeline using:
- **DeepSeek API** for intelligent conversation and interest extraction
- **Sentence Transformers** for creating embeddings from place data
- **ChromaDB** for vector storage and similarity search
- **Smart Negation Handling** for improved user experience

## Architecture

```
User Input → DeepSeek API → Interest Extraction → Embedding Creation → ChromaDB Search → Recommendations
     ↓
Negation Detection → Follow-up Questions → Refined Search → Updated Recommendations
```

## Key Components

### 1. DeepSeek Chat Agent (`deepseek_agent.py`)
- **Purpose**: Intelligent conversation and interest extraction
- **Features**:
  - Extracts structured interests (vibe, budget, timing, activities)
  - Detects user negations and rejections
  - Generates contextual follow-up questions
  - Maintains conversation history

### 2. Embedding System (`embedding_system.py`)
- **Purpose**: Vector-based place similarity search
- **Features**:
  - Creates embeddings for all places using `all-MiniLM-L6-v2`
  - Stores vectors in ChromaDB with SQLite backend
  - Performs similarity search based on user interests
  - Filters by distance and budget compatibility

### 3. Intelligent Pipeline (`intelligent_pipeline.py`)
- **Purpose**: Orchestrates the complete conversation flow
- **Features**:
  - Manages conversation state across sessions
  - Handles different response types (questions, recommendations, negations)
  - Provides search refinement capabilities
  - Tracks user confidence and interaction patterns

## Workflow

### Initial User Interaction
1. **User Input**: "I want romantic places for dinner tonight"
2. **DeepSeek Processing**: Extracts interests → `{vibe: ["romantic"], budget: "medium", timing: "evening"}`
3. **Embedding Creation**: Converts interests to query embedding
4. **ChromaDB Search**: Finds similar places using vector similarity
5. **Response**: Returns top recommendations with similarity scores

### Negation Handling
1. **User Rejection**: "No, I don't like those places"
2. **Negation Detection**: System identifies rejection pattern
3. **Follow-up Question**: "What kind of experience are you looking for instead?"
4. **Refined Search**: Uses new input to find better matches

### Confidence-Based Flow
- **High Confidence (>0.8)**: Direct recommendations
- **Medium Confidence (0.6-0.8)**: Recommendations with clarifying questions
- **Low Confidence (<0.6)**: Follow-up questions before recommendations

## API Endpoints

### Core Chat
```http
POST /chat
{
  "session_id": "string",
  "message": "user message",
  "use_intelligent_chat": true
}
```

### Search Refinement
```http
POST /chat/refine/{session_id}
{
  "refinement_message": "I prefer outdoor activities"
}
```

### System Management
```http
GET /system/stats
POST /system/initialize
GET /embeddings/search?query=romantic&limit=5
```

## Data Flow

### User Profile JSON Structure
```json
{
  "preferences": {
    "vibe": ["romantic", "chill"],
    "budget": "medium",
    "timing": "evening",
    "activities": ["dining", "music"],
    "location_preferences": ["koramangala"],
    "negations": ["crowded", "noisy"]
  },
  "location": {
    "latitude": 12.9716,
    "longitude": 77.5946,
    "search_radius_km": 5.0
  },
  "constraints": {
    "max_places": 5,
    "visit_time_per_place": 1.0
  }
}
```

### Place Embedding Structure
Each place is embedded as:
```
"Place: Toscano | Category: Italian Restaurant | Vibe: romantic | Famous for: Tuscan cuisine | Budget: ₹500-1500 | Area: UB City Mall"
```

### Recommendation Response
```json
{
  "type": "recommendations",
  "message": "Found 5 romantic places for you...",
  "recommendations": [
    {
      "place_name": "Toscano",
      "category": "Italian Restaurant",
      "distance_km": 2.3,
      "similarity_score": 0.87,
      "budget_range": "₹500-1500",
      "famous_for": "Tuscan cuisine",
      "vibe": "romantic"
    }
  ],
  "interests": {...},
  "confidence": 0.85
}
```

## Setup Instructions

### 1. Environment Setup
```bash
# Clone repository
cd Sanchar-Web/backend

# Install dependencies
pip install -r requirements.txt

# Set environment variables
echo "DEEPSEEK_API_KEY=your_deepseek_api_key" >> .env
echo "GOOGLE_API_KEY=your_gemini_api_key" >> .env
```

### 2. Database Initialization
```bash
# Run initialization (creates ChromaDB and embeddings)
python test_intelligent_pipeline.py
```

### 3. Start Services
```bash
# Backend
python main.py

# Frontend (separate terminal)
cd ../frontend1
npm install
npm run dev
```

## Configuration

### Embedding Model
- **Model**: `all-MiniLM-L6-v2`
- **Dimension**: 384
- **Language**: English
- **Performance**: Fast inference, good quality

### ChromaDB Settings
- **Backend**: SQLite
- **Storage**: `./chroma_db/`
- **Collection**: `places_embeddings`
- **Persistence**: Enabled

### Search Parameters
- **Initial Radius**: 2km
- **Max Radius**: 50km
- **Auto-expansion**: 2km → 5km → 10km → 20km
- **Max Results**: 10 per search

## Testing

### Run Complete Test Suite
```bash
python test_intelligent_pipeline.py
```

### Test Components Individually
```python
# Test embeddings only
from embedding_system import embedding_system
embedding_system.initialize_embeddings()
results = embedding_system.search_by_text("romantic restaurant")

# Test DeepSeek agent
from deepseek_agent import initialize_deepseek_agent
agent = initialize_deepseek_agent("your_api_key")
interests = agent.extract_user_interests("I want romantic dinner")
```

## Frontend Integration

### Enhanced UI Features
- **Interest Display**: Shows extracted user preferences
- **Confidence Indicator**: Visual confidence score
- **Similarity Scores**: Match percentage for each recommendation
- **Chat Status**: Different states (follow-up, negation, recommendations)
- **Smart Suggestions**: Context-aware response options

### Chat Types
- `follow_up`: System needs more information
- `negation`: User rejected suggestions
- `recommendations`: Places found and displayed
- `processing`: System is working on request

## Performance Optimization

### Embedding Caching
- Embeddings created once and stored persistently
- Fast similarity search using vector indexing
- Batch processing for initial setup

### Session Management
- Conversation state cached per session
- Automatic cleanup of old sessions
- Context-aware responses using history

### API Efficiency
- Single API call for complete interaction
- Batch embedding operations
- Optimized distance calculations

## Error Handling

### DeepSeek API Failures
- Fallback to keyword-based extraction
- Graceful degradation of features
- User-friendly error messages

### Embedding System Issues
- Automatic retry mechanisms
- Fallback to distance-based search
- System health monitoring

### Database Connectivity
- SQLite reliability
- Automatic database creation
- Data integrity checks

## Monitoring & Analytics

### System Stats Endpoint
```json
{
  "embedding_system": {
    "status": "initialized",
    "total_places": 150,
    "embedding_dimension": 384
  },
  "active_conversations": 5,
  "deepseek_agent": "initialized"
}
```

### Conversation Analytics
- User interaction patterns
- Confidence score trends
- Negation frequency
- Search refinement patterns

## Future Enhancements

### Planned Features
1. **Multi-language Support**: Extend to regional languages
2. **Real-time Learning**: Adapt to user feedback
3. **Group Planning**: Multi-user conversation handling
4. **Seasonal Recommendations**: Weather and event-based suggestions
5. **Social Integration**: User reviews and ratings

### Technical Improvements
1. **Advanced Embeddings**: Fine-tuned models for travel domain
2. **Graph Neural Networks**: Relationship-based recommendations
3. **Real-time Updates**: Live place data integration
4. **Mobile Optimization**: Responsive design improvements

## Troubleshooting

### Common Issues

**1. ChromaDB Initialization Fails**
```bash
# Delete and recreate database
rm -rf ./chroma_db
python test_intelligent_pipeline.py
```

**2. DeepSeek API Errors**
```bash
# Check API key
echo $DEEPSEEK_API_KEY
# Verify API quota and permissions
```

**3. Embedding Model Download**
```bash
# Manual model download
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"
```

**4. Memory Issues**
```bash
# Reduce batch size in embedding_system.py
batch_size = 50  # Instead of 100
```

## Contributing

### Development Setup
1. Fork repository
2. Create feature branch
3. Add comprehensive tests
4. Update documentation
5. Submit pull request

### Code Standards
- Type hints for all functions
- Comprehensive error handling
- Unit tests for new features
- Documentation for API changes

---

**Built with ❤️ for intelligent travel experiences**