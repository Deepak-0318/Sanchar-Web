# Sanchar AI - Enhanced Plan Editing System

## 🆕 New Features

Your chatbot now supports **intelligent plan editing** with the following capabilities:

### ✨ Key Features

1. **Plan Generation from Survey**: Create initial plans based on time, budget, and vibe preferences
2. **Intelligent Plan Editing**: Modify existing plans using natural language
3. **RAG-Powered Location Knowledge**: Uses your existing Bangalore location database
4. **Dual Intent Detection**: Handles both plan editing and informational queries
5. **Session-based State Management**: Maintains plans per user session

## 🔄 New API Endpoints

### 1. Generate Initial Plan 
```http
POST /plan/generate
```
```json
{
  "session_id": "session-uuid",
  "time_hours": 4.0,
  "budget": "moderate",
  "vibe": "chill",
  "preferred_location": "MG Road, Bengaluru"
}
```

### 2. Enhanced Chat (Edit Plans + Info Queries)
```http
POST /chat
```
```json
{
  "session_id": "session-uuid", 
  "message": "Move lunch to 3pm"
}
```

## 🎯 Usage Examples

### Plan Editing Commands

| Command | Result |
|---------|--------|
| `"Move lunch to 3pm"` | Adjusts timing of food-related places |
| `"Replace Lalbagh with Cubbon Park"` | Swaps locations using RAG database |
| `"Make the plan more relaxed"` | Increases visit durations |
| `"Make it faster"` | Reduces visit times |
| `"Add a cafe"` | Includes cafe from location database |

### Informational Queries

| Query | Response |
|-------|----------|
| `"Tell me about Lalbagh"` | Information from RAG database |
| `"What cafes are near MG Road?"` | Filtered location suggestions |
| `"Opening hours for Bangalore Palace"` | Specific place details |

## 🔧 Implementation Details

### Intent Detection
The system automatically detects whether a user message is:
- **Edit Intent**: Modifying existing plan → Returns updated JSON plan
- **Info Intent**: Asking for information → Returns conversational response

### Plan State Management
- Plans are stored per session using `session_id`
- Each edit modifies the existing plan rather than creating new ones
- **Current plan context is passed to LLM prompts** via the system instruction

### RAG Integration
- **Reuses your existing vector database** of 100+ Bangalore locations
- **Never invents new places** - only uses database entries
- Location replacement uses semantic matching within your dataset

## 🎮 Testing

Run the test script to verify functionality:

```bash
cd backend
python test_plan_editing.py
```

## 📁 Code Changes Summary

### Modified Files
- **`main.py`**: Added plan generation endpoint + enhanced chat with intent detection
- **`agents.py`**: Added `detect_intent_type()`, `edit_existing_plan()`, `answer_info_query()`
- **`store.py`**: Enhanced session management functions

### Key Functions

#### `detect_intent_type(message: str) -> str`
- Analyzes message to determine "edit" vs "info" intent
- Looks for editing keywords: "move", "change", "replace", "make it", etc.

#### `edit_existing_plan(current_plan, edit_instruction, start_lat, start_lon) -> dict`
- **🔑 This is where the current plan is passed into the LLM prompt**
- Uses Gemini with system instruction containing current plan JSON
- Ensures only database places are used via RAG validation
- Returns updated plan in same JSON structure

#### `answer_info_query(message, preferred_location) -> str`
- Handles informational queries using RAG database
- Filters relevant places based on query keywords
- Uses LLM to generate natural responses

## 🔄 Plan Update Flow

```mermaid
graph TD
    A[User: "Move lunch to 3pm"] --> B[detect_intent_type]
    B --> C[Intent = "edit"]
    C --> D[Get current_plan from session]
    D --> E[edit_existing_plan]
    E --> F[LLM with current plan in prompt]
    F --> G[Validate places against RAG DB]
    G --> H[Update session with new plan]
    H --> I[Return JSON plan]
```

## 🚀 Frontend Integration

Your frontend should:

1. **Generate initial plan** using `/plan/generate` after user survey
2. **Send messages** to `/chat` with `session_id` and `message`
3. **Check response type**:
   - Plan edits return JSON plan directly
   - Info queries return `{type: "info", response: "..."}`

## 🛡️ Safety Features

- **Database validation**: Prevents hallucinated locations
- **Fallback editing**: Simple text-based edits if LLM fails
- **Error handling**: Graceful degradation for API failures
- **Session isolation**: Plans are per-session, no cross-contamination