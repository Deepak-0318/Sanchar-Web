from typing import Dict, List, Optional, Tuple
from deepseek_agent import DeepSeekChatAgent, UserInterests, initialize_deepseek_agent
from embedding_system import EmbeddingVectorSystem, embedding_system
import json

class IntelligentConversationPipeline:
    def __init__(self, deepseek_api_key: str):
        self.deepseek_agent = initialize_deepseek_agent(deepseek_api_key)
        self.embedding_system = embedding_system
        self.conversation_state = {}
        
    def initialize_system(self):
        """Initialize the embedding system"""
        print("🚀 Initializing Intelligent Conversation Pipeline...")
        self.embedding_system.initialize_embeddings()
        print("✅ System ready!")
    
    def process_user_message(self, session_id: str, user_message: str, 
                           user_lat: float, user_lon: float) -> Dict:
        """Main pipeline to process user message and return recommendations"""
        
        # Get or create conversation state
        if session_id not in self.conversation_state:
            self.conversation_state[session_id] = {
                "conversation_history": [],
                "extracted_interests": None,
                "last_recommendations": [],
                "negation_count": 0,
                "location": {"lat": user_lat, "lon": user_lon}
            }
        
        state = self.conversation_state[session_id]
        
        # Check for negation
        is_negation = self.deepseek_agent.detect_negation(user_message)
        
        if is_negation:
            return self._handle_negation(session_id, user_message, state)
        
        # Extract interests from user message
        interests = self.deepseek_agent.extract_user_interests(
            user_message, 
            state["conversation_history"]
        )
        
        # Update state
        state["extracted_interests"] = interests
        
        # If confidence is low, ask follow-up question
        if interests.confidence_score < 0.6:
            follow_up = self.deepseek_agent.generate_follow_up_question(interests)
            
            # Update conversation history
            self.deepseek_agent.update_conversation_history(user_message, follow_up)
            state["conversation_history"] = self.deepseek_agent.conversation_history
            
            return {
                "type": "follow_up_question",
                "message": follow_up,
                "interests": interests.__dict__,
                "confidence": interests.confidence_score,
                "recommendations": []
            }
        
        # Get recommendations using embeddings
        recommendations = self.embedding_system.find_similar_places(
            interests=interests,
            user_lat=user_lat,
            user_lon=user_lon,
            max_distance_km=self._get_search_radius(interests),
            n_results=5
        )
        
        # Store recommendations
        state["last_recommendations"] = recommendations
        
        # Generate response message
        response_message = self._generate_recommendation_message(interests, recommendations)
        
        # Update conversation history
        self.deepseek_agent.update_conversation_history(user_message, response_message)
        state["conversation_history"] = self.deepseek_agent.conversation_history
        
        return {
            "type": "recommendations",
            "message": response_message,
            "interests": interests.__dict__,
            "confidence": interests.confidence_score,
            "recommendations": recommendations,
            "search_info": {
                "total_found": len(recommendations),
                "search_radius": self._get_search_radius(interests)
            }
        }
    
    def _handle_negation(self, session_id: str, user_message: str, state: Dict) -> Dict:
        """Handle user negation/rejection"""
        state["negation_count"] += 1
        
        # Extract what they don't want
        interests = self.deepseek_agent.extract_user_interests(user_message)
        
        # Generate follow-up question acknowledging negation
        if state["negation_count"] == 1:
            follow_up = "I understand those suggestions weren't quite right. What kind of experience are you actually looking for today?"
        elif state["negation_count"] == 2:
            follow_up = "Let me try a different approach. Could you tell me about a place you've enjoyed before, or describe your ideal hangout spot?"
        else:
            follow_up = "I want to get this right for you! Could you be more specific about what you're in the mood for - maybe the type of activity or atmosphere you prefer?"
        
        # Update conversation history
        self.deepseek_agent.update_conversation_history(user_message, follow_up)
        state["conversation_history"] = self.deepseek_agent.conversation_history
        
        return {
            "type": "negation_response",
            "message": follow_up,
            "interests": interests.__dict__ if interests else {},
            "confidence": 0.3,
            "recommendations": [],
            "negation_count": state["negation_count"]
        }
    
    def _get_search_radius(self, interests: UserInterests) -> float:
        """Determine search radius based on user interests"""
        base_radius = 5.0  # km
        
        # Expand radius for adventure/nature activities
        if any(vibe in ["adventure", "nature"] for vibe in interests.vibe):
            base_radius = 15.0
        
        # Reduce radius for specific location preferences
        if interests.location_preferences:
            base_radius = 3.0
        
        return base_radius
    
    def _generate_recommendation_message(self, interests: UserInterests, 
                                       recommendations: List[Dict]) -> str:
        """Generate natural response message for recommendations"""
        if not recommendations:
            return "I couldn't find places matching your preferences nearby. Would you like me to expand the search area or try different criteria?"
        
        vibe_text = ", ".join(interests.vibe) if interests.vibe else "great"
        count = len(recommendations)
        
        # Get top place names
        top_places = [rec["place_name"] for rec in recommendations[:3]]
        
        message_parts = [
            f"Perfect! I found {count} {vibe_text} places for you.",
            f"Here are some great options: {', '.join(top_places[:2])}"
        ]
        
        if len(top_places) > 2:
            message_parts.append(f"and {top_places[2]}")
        
        # Add budget context
        if interests.budget != "unknown":
            budget_text = {"low": "budget-friendly", "medium": "reasonably priced", "high": "premium"}
            message_parts.append(f"All are {budget_text.get(interests.budget, '')} options.")
        
        message_parts.append("Would you like details about any of these, or should I find different options?")
        
        return " ".join(message_parts)
    
    def refine_search(self, session_id: str, refinement_message: str) -> Dict:
        """Refine search based on user feedback"""
        if session_id not in self.conversation_state:
            return {"error": "Session not found"}
        
        state = self.conversation_state[session_id]
        
        # Extract refinement preferences
        refinement_interests = self.deepseek_agent.extract_user_interests(
            refinement_message,
            state["conversation_history"]
        )
        
        # Merge with existing interests
        if state["extracted_interests"]:
            merged_interests = self._merge_interests(
                state["extracted_interests"], 
                refinement_interests
            )
        else:
            merged_interests = refinement_interests
        
        # Get new recommendations
        recommendations = self.embedding_system.find_similar_places(
            interests=merged_interests,
            user_lat=state["location"]["lat"],
            user_lon=state["location"]["lon"],
            max_distance_km=self._get_search_radius(merged_interests),
            n_results=5
        )
        
        # Update state
        state["extracted_interests"] = merged_interests
        state["last_recommendations"] = recommendations
        
        response_message = self._generate_recommendation_message(merged_interests, recommendations)
        
        return {
            "type": "refined_recommendations",
            "message": response_message,
            "interests": merged_interests.__dict__,
            "recommendations": recommendations,
            "search_info": {
                "total_found": len(recommendations),
                "search_radius": self._get_search_radius(merged_interests)
            }
        }
    
    def _merge_interests(self, existing: UserInterests, new: UserInterests) -> UserInterests:
        """Merge existing interests with new refinements"""
        return UserInterests(
            vibe=list(set(existing.vibe + new.vibe)) if new.vibe else existing.vibe,
            budget=new.budget if new.budget != "unknown" else existing.budget,
            timing=new.timing if new.timing != "unknown" else existing.timing,
            activities=list(set(existing.activities + new.activities)),
            location_preferences=list(set(existing.location_preferences + new.location_preferences)),
            negations=list(set(existing.negations + new.negations)),
            confidence_score=max(existing.confidence_score, new.confidence_score)
        )
    
    def get_conversation_summary(self, session_id: str) -> Dict:
        """Get summary of conversation state"""
        if session_id not in self.conversation_state:
            return {"error": "Session not found"}
        
        state = self.conversation_state[session_id]
        
        return {
            "session_id": session_id,
            "interests": state["extracted_interests"].__dict__ if state["extracted_interests"] else None,
            "conversation_length": len(state["conversation_history"]),
            "last_recommendations_count": len(state["last_recommendations"]),
            "negation_count": state["negation_count"],
            "location": state["location"]
        }
    
    def reset_conversation(self, session_id: str):
        """Reset conversation state for a session"""
        if session_id in self.conversation_state:
            del self.conversation_state[session_id]
        
        # Reset DeepSeek agent conversation history
        self.deepseek_agent.conversation_history = []
    
    def get_system_stats(self) -> Dict:
        """Get system statistics"""
        embedding_stats = self.embedding_system.get_embedding_stats()
        
        return {
            "embedding_system": embedding_stats,
            "active_conversations": len(self.conversation_state),
            "deepseek_agent": "initialized" if self.deepseek_agent else "not_initialized"
        }

# Global pipeline instance
intelligent_pipeline = None

def initialize_intelligent_pipeline(deepseek_api_key: str) -> IntelligentConversationPipeline:
    """Initialize the intelligent conversation pipeline"""
    global intelligent_pipeline
    intelligent_pipeline = IntelligentConversationPipeline(deepseek_api_key)
    intelligent_pipeline.initialize_system()
    return intelligent_pipeline