# Enhanced RAG Pipeline for Sanchar Travel Planner

## Overview

The Enhanced RAG (Retrieval-Augmented Generation) Pipeline transforms user inputs into structured JSON format and provides intelligent place recommendations based on location, preferences, and dynamic distance-based filtering.

## System Architecture

### 1. User Input Flow
```
Mood Selection → Budget Selection → Time Selection → Location Access → Preferred Location → JSON Profile
```

### 2. JSON User Profile Structure
```json
{
  "preferences": {
    "mood": "romantic|fun|chill|adventure",
    "budget": "low|medium|high", 
    "time_available": "1-2|2-4|half-day|full-day",
    "preferred_location": "string or current_location"
  },
  "location": {
    "latitude": 12.9716,
    "longitude": 77.5946,
    "search_radius_km": 2.0
  },
  "constraints": {
    "max_places": 5,
    "visit_time_per_place": 1.0
  }
}
```

### 3. RAG Processing Pipeline

#### Step 1: Distance-Based Filtering
- **Initial Radius**: 2km from user location
- **Auto-Expansion**: 2km → 5km → 10km → 20km if insufficient results
- **Haversine Distance**: Accurate geographical distance calculation

#### Step 2: Preference Scoring
- **Mood Matching** (40% weight): Matches user mood with place vibes
- **Budget Compatibility** (30% weight): Filters by budget range
- **Distance Scoring** (30% weight): Closer places get higher scores

#### Step 3: Intelligent Recommendations
- **Top N Selection**: Returns best-scored places within constraints
- **Rich Metadata**: Includes budget range, famous attractions, area info
- **Contextual Narration**: AI-generated descriptions based on preferences

## Key Features

### 🎯 Smart Distance Management
- Starts with 2km radius for nearby recommendations
- Automatically expands search area if insufficient results
- User can manually expand search radius via chat
- Maximum search radius: 50km

### 🧠 Preference Intelligence
- **Mood Mapping**: 
  - Chill → relaxed, peaceful places
  - Fun → lively, entertaining venues
  - Romantic → intimate, couple-friendly spots
  - Adventure → exciting, outdoor activities

- **Budget Intelligence**:
  - Low: ₹0-300 range
  - Medium: ₹200-800 range  
  - High: ₹500-2000+ range

### 💬 Interactive Chat Modifications
- **Expand Search**: "show me more places", "expand search area"
- **Change Mood**: "something more romantic", "I want adventure"
- **Adjust Budget**: "cheaper options", "premium places"
- **Real-time Updates**: Instant re-recommendations based on chat input

### 📊 Rich Place Information
Each recommendation includes:
- Place name and category
- Exact distance from user location
- Budget range and famous attractions
- Preference matching score
- Visit time recommendations

## API Endpoints

### Core Chat Endpoint
```http
POST /chat
{
  "session_id": "string",
  "message": "romantic, medium, 2-4",
  "preferred_location": "optional",
  "use_enhanced_rag": true
}
```

### Radius Management
```http
GET /chat/radius/{session_id}
POST /chat/radius/{session_id}
{
  "radius_km": 5.0
}
```

## Frontend Integration

### Enhanced UI Components
- **Search Radius Display**: Shows current search area and total places found
- **Expand Search Button**: One-click radius expansion
- **Rich Place Cards**: Displays budget, attractions, and detailed info
- **Real-time Chat**: Instant modifications and updates

### User Experience Flow
1. **Initial Setup**: User selects mood, budget, time, and location
2. **JSON Generation**: System creates structured user profile
3. **RAG Processing**: Finds and scores nearby places
4. **Interactive Refinement**: User can chat to modify preferences
5. **Dynamic Updates**: Real-time re-recommendations

## Data Processing

### CSV Data Integration
- **Rich Dataset**: 200+ places with detailed metadata
- **Geospatial Indexing**: Latitude/longitude for accurate distance calculation
- **Multi-dimensional Filtering**: Category, vibe, budget, weather suitability
- **Quality Scoring**: Data quality indicators for reliable recommendations

### Performance Optimizations
- **Efficient Distance Calculation**: Vectorized haversine computation
- **Smart Caching**: Session-based user profile storage
- **Incremental Search**: Radius expansion without full recomputation
- **Minimal API Calls**: Batch processing for better performance

## Testing

Run the test suite:
```bash
cd backend
python test_enhanced_pipeline.py
```

Test scenarios:
- Basic recommendation generation
- Chat-based modifications
- Different starting locations
- Radius expansion logic
- Preference scoring accuracy

## Configuration

### Environment Variables
```env
GOOGLE_API_KEY=your_gemini_api_key
```

### Customizable Parameters
- `MAX_PLACES`: Maximum recommendations per request (default: 5)
- `INITIAL_RADIUS`: Starting search radius (default: 2km)
- `MAX_RADIUS`: Maximum search radius (default: 50km)
- `SCORING_WEIGHTS`: Mood/Budget/Distance importance ratios

## Deployment

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend Setup
```bash
cd frontend1
npm install
npm run dev
```

## Future Enhancements

### Planned Features
- **ML-based Scoring**: Machine learning models for better preference matching
- **Real-time Traffic**: Integration with traffic APIs for accurate travel times
- **Weather Integration**: Dynamic recommendations based on current weather
- **Social Features**: User reviews and ratings integration
- **Multi-day Planning**: Extended itinerary generation
- **Group Planning**: Collaborative trip planning features

### Technical Improvements
- **Vector Search**: Semantic similarity for place recommendations
- **Caching Layer**: Redis integration for faster responses
- **Analytics**: User behavior tracking and recommendation optimization
- **A/B Testing**: Framework for testing different recommendation strategies

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/enhanced-rag`
3. Commit changes: `git commit -am 'Add enhanced RAG pipeline'`
4. Push to branch: `git push origin feature/enhanced-rag`
5. Submit pull request

## License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for intelligent travel planning**