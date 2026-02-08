import os
import json
import requests
from typing import Dict, List, Optional
from dataclasses import dataclass
import re

@dataclass
class UserInterests:
    vibe: List[str]
    budget: str
    timing: str
    activities: List[str]
    location_preferences: List[str]
    negations: List[str]
    confidence_score: float

class DeepSeekChatAgent:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.deepseek.com/v1/chat/completions"
        self.conversation_history = []
        
    def extract_user_interests(self, user_message: str, conversation_context: List[Dict] = None) -> UserInterests:
        """Extract structured interests from user message using DeepSeek"""
        
        system_prompt = """You are an expert travel assistant that extracts user preferences from conversations.
        
        Analyze the user's message and extract:
        1. VIBE: romantic, adventure, chill, fun, cultural, nature, nightlife, spiritual
        2. BUDGET: low (under ₹500), medium (₹500-1500), high (₹1500+)
        3. TIMING: morning, afternoon, evening, night, full-day, weekend
        4. ACTIVITIES: specific activities they mention (dining, shopping, trekking, etc.)
        5. LOCATION_PREFERENCES: areas/places they specifically mention
        6. NEGATIONS: things they explicitly don't want or reject
        7. CONFIDENCE_SCORE: 0.0-1.0 based on how clear their preferences are
        
        Return ONLY a JSON object with these exact keys:
        {
            "vibe": ["list", "of", "vibes"],
            "budget": "low|medium|high",
            "timing": "preferred_time",
            "activities": ["list", "of", "activities"],
            "location_preferences": ["list", "of", "locations"],
            "negations": ["things", "they", "dont", "want"],
            "confidence_score": 0.8
        }
        
        If information is unclear, use empty arrays or "unknown" and lower confidence score."""
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Extract interests from: {user_message}"}
        ]
        
        if conversation_context:
            messages = conversation_context + messages
            
        try:
            response = requests.post(
                self.base_url,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "deepseek-chat",
                    "messages": messages,
                    "temperature": 0.3,
                    "max_tokens": 500
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                
                # Extract JSON from response
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    interests_data = json.loads(json_match.group())
                    return UserInterests(**interests_data)
                    
        except Exception as e:
            print(f"DeepSeek API error: {e}")
            
        # Fallback to basic extraction
        return self._fallback_extraction(user_message)
    
    def _fallback_extraction(self, message: str) -> UserInterests:
        """Fallback interest extraction using keyword matching"""
        message_lower = message.lower()
        
        # Basic vibe detection
        vibe_keywords = {
            "romantic": ["romantic", "date", "couple", "intimate", "cozy"],
            "adventure": ["adventure", "exciting", "thrill", "outdoor", "trek"],
            "chill": ["chill", "relax", "calm", "peaceful", "quiet"],
            "fun": ["fun", "lively", "party", "energetic", "vibrant"],
            "cultural": ["culture", "heritage", "history", "traditional", "art"],
            "nature": ["nature", "park", "garden", "lake", "green"]
        }
        
        detected_vibes = []
        for vibe, keywords in vibe_keywords.items():
            if any(keyword in message_lower for keyword in keywords):
                detected_vibes.append(vibe)
        
        # Basic budget detection
        budget = "medium"  # default
        if any(word in message_lower for word in ["cheap", "budget", "affordable"]):
            budget = "low"
        elif any(word in message_lower for word in ["premium", "expensive", "luxury"]):
            budget = "high"
            
        # Basic timing detection
        timing = "afternoon"  # default
        time_keywords = {
            "morning": ["morning", "breakfast", "early"],
            "afternoon": ["afternoon", "lunch", "day"],
            "evening": ["evening", "dinner", "sunset"],
            "night": ["night", "late", "nightlife"]
        }
        
        for time_period, keywords in time_keywords.items():
            if any(keyword in message_lower for keyword in keywords):
                timing = time_period
                break
        
        return UserInterests(
            vibe=detected_vibes or ["chill"],
            budget=budget,
            timing=timing,
            activities=[],
            location_preferences=[],
            negations=[],
            confidence_score=0.5
        )
    
    def generate_follow_up_question(self, interests: UserInterests, context: str = "") -> str:
        """Generate intelligent follow-up questions based on extracted interests"""
        
        system_prompt = """You are a Sanchar, travel assistant. Based on the user's interests and confidence level, 
        generate a natural follow-up question to better understand their preferences.
        
        If confidence is low (<0.6), ask clarifying questions about unclear preferences.
        If confidence is high (>0.8), ask about specific details or alternatives.
        If user showed negations, acknowledge them and ask for positive preferences.
        
        Keep questions conversational, friendly, and focused on one aspect at a time.
        Maximum 2 sentences."""
        
        interests_summary = f"""
        User Interests: {interests.__dict__}
        Context: {context}
        """
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Generate follow-up question for: {interests_summary}"}
        ]
        
        try:
            response = requests.post(
                self.base_url,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "deepseek-chat",
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 150
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                return result["choices"][0]["message"]["content"].strip()
                
        except Exception as e:
            print(f"DeepSeek API error: {e}")
            
        # Fallback questions
        if interests.confidence_score < 0.6:
            return "I'd love to help you find the perfect places! What kind of vibe are you looking for today - something romantic, adventurous, or maybe just chill and relaxing?"
        elif interests.negations:
            return f"Got it, you don't want {', '.join(interests.negations)}. What would you prefer instead?"
        else:
            return "That sounds great! Any specific area in Bengaluru you'd like to explore, or should I suggest places near your current location?"
    
    def detect_negation(self, message: str) -> bool:
        """Detect if user is showing negation/rejection"""
        negation_patterns = [
            r'\b(no|not|don\'t|doesn\'t|won\'t|can\'t|never)\b',
            r'\b(hate|dislike|avoid|skip)\b',
            r'\b(boring|bad|terrible|awful)\b',
            r'\b(something else|different|other)\b'
        ]
        
        message_lower = message.lower()
        return any(re.search(pattern, message_lower) for pattern in negation_patterns)
    
    def update_conversation_history(self, user_message: str, assistant_response: str):
        """Update conversation history for context"""
        self.conversation_history.extend([
            {"role": "user", "content": user_message},
            {"role": "assistant", "content": assistant_response}
        ])
        
        # Keep only last 10 messages for context
        if len(self.conversation_history) > 10:
            self.conversation_history = self.conversation_history[-10:]

# Global instance
deepseek_agent = None

def initialize_deepseek_agent(api_key: str):
    """Initialize the DeepSeek agent"""
    global deepseek_agent
    deepseek_agent = DeepSeekChatAgent(api_key)
    return deepseek_agent