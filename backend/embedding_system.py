import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings
import json
import os
from typing import List, Dict, Tuple
from helpers import load_places_data, haversine
from deepseek_agent import UserInterests

class EmbeddingVectorSystem:
    def __init__(self, db_path: str = "./chroma_db"):
        # Initialize embedding model
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Initialize ChromaDB
        self.chroma_client = chromadb.PersistentClient(
            path=db_path,
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=True
            )
        )
        
        # Create or get collection
        self.collection = self.chroma_client.get_or_create_collection(
            name="places_embeddings",
            metadata={"description": "Travel places with embeddings"}
        )
        
        self.places_df = None
        self.is_initialized = False
    
    def initialize_embeddings(self, force_rebuild: bool = False):
        """Initialize embeddings for all places in the dataset"""
        if self.is_initialized and not force_rebuild:
            print("Embeddings already initialized")
            return
            
        print("Loading places data...")
        self.places_df = pd.DataFrame(load_places_data())
        
        # Check if embeddings already exist
        existing_count = self.collection.count()
        if existing_count > 0 and not force_rebuild:
            print(f"Found {existing_count} existing embeddings")
            self.is_initialized = True
            return
        
        if force_rebuild and existing_count > 0:
            print("Rebuilding embeddings...")
            self.collection.delete()
            self.collection = self.chroma_client.get_or_create_collection(
                name="places_embeddings",
                metadata={"description": "Travel places with embeddings"}
            )
        
        print("Creating embeddings for places...")
        self._create_place_embeddings()
        self.is_initialized = True
        print(f"✅ Initialized {len(self.places_df)} place embeddings")
    
    def _create_place_embeddings(self):
        """Create embeddings for all places and store in ChromaDB"""
        embeddings = []
        documents = []
        metadatas = []
        ids = []
        
        for idx, place in self.places_df.iterrows():
            # Create rich text representation for embedding
            place_text = self._create_place_text(place)
            documents.append(place_text)
            
            # Create embedding
            embedding = self.embedding_model.encode(place_text).tolist()
            embeddings.append(embedding)
            
            # Prepare metadata
            metadata = {
                "place_id": str(place["place_id"]),
                "place_name": str(place["place_name"]),
                "category": str(place["category"]),
                "vibe": str(place["vibe"]),
                "budget_min": float(place["budget_min"]),
                "budget_max": float(place["budget_max"]),
                "latitude": float(place["latitude"]),
                "longitude": float(place["longitude"]),
                "area": str(place["area"]),
                "famous_for": str(place["famous_for"]),
                "tags": str(place["tags"]),
                "weather_suitability": str(place["weather_suitability"])
            }
            metadatas.append(metadata)
            ids.append(f"place_{idx}")
        
        # Add to ChromaDB in batches
        batch_size = 100
        for i in range(0, len(embeddings), batch_size):
            batch_end = min(i + batch_size, len(embeddings))
            
            self.collection.add(
                embeddings=embeddings[i:batch_end],
                documents=documents[i:batch_end],
                metadatas=metadatas[i:batch_end],
                ids=ids[i:batch_end]
            )
            
            print(f"Added batch {i//batch_size + 1}/{(len(embeddings)-1)//batch_size + 1}")
    
    def _create_place_text(self, place: pd.Series) -> str:
        """Create rich text representation of a place for embedding"""
        text_parts = [
            f"Place: {place['place_name']}",
            f"Category: {place['category']}",
            f"Vibe: {place['vibe']}",
            f"Famous for: {place['famous_for']}",
            f"Area: {place['area']}",
            f"Tags: {place['tags']}",
            f"Budget range: ₹{place['budget_min']}-₹{place['budget_max']}",
            f"Weather suitable: {place['weather_suitability']}"
        ]
        
        return " | ".join(text_parts)
    
    def create_user_query_embedding(self, interests: UserInterests, location_context: str = "") -> str:
        """Create query text from user interests for embedding similarity search"""
        query_parts = []
        
        # Add vibe preferences
        if interests.vibe:
            query_parts.append(f"Vibe: {', '.join(interests.vibe)}")
        
        # Add budget preference
        budget_text = {
            "low": "budget-friendly affordable cheap under ₹500",
            "medium": "moderate pricing ₹500-1500 reasonable",
            "high": "premium expensive luxury ₹1500+ upscale"
        }
        query_parts.append(f"Budget: {budget_text.get(interests.budget, 'moderate')}")
        
        # Add timing preference
        timing_text = {
            "morning": "morning breakfast early day start",
            "afternoon": "afternoon lunch daytime midday",
            "evening": "evening dinner sunset twilight",
            "night": "night late nightlife after dark"
        }
        query_parts.append(f"Timing: {timing_text.get(interests.timing, 'anytime')}")
        
        # Add activities
        if interests.activities:
            query_parts.append(f"Activities: {', '.join(interests.activities)}")
        
        # Add location preferences
        if interests.location_preferences:
            query_parts.append(f"Location: {', '.join(interests.location_preferences)}")
        
        # Add location context
        if location_context:
            query_parts.append(f"Near: {location_context}")
        
        return " | ".join(query_parts)
    
    def find_similar_places(self, interests: UserInterests, user_lat: float, user_lon: float, 
                           max_distance_km: float = 20, n_results: int = 10) -> List[Dict]:
        """Find places similar to user interests using embedding similarity"""
        
        if not self.is_initialized:
            self.initialize_embeddings()
        
        # Create query embedding
        query_text = self.create_user_query_embedding(interests)
        print(f"🔍 Query: {query_text}")
        
        # Search similar places
        results = self.collection.query(
            query_texts=[query_text],
            n_results=min(n_results * 3, 50)  # Get more results for filtering
        )
        
        # Process and filter results
        similar_places = []
        
        if results['metadatas'] and results['metadatas'][0]:
            for i, metadata in enumerate(results['metadatas'][0]):
                # Calculate distance
                place_lat = float(metadata['latitude'])
                place_lon = float(metadata['longitude'])
                distance = haversine(user_lat, user_lon, place_lat, place_lon)
                
                # Filter by distance
                if distance <= max_distance_km:
                    # Apply budget filter
                    budget_match = self._check_budget_compatibility(interests.budget, metadata)
                    
                    place_info = {
                        "place_id": metadata['place_id'],
                        "place_name": metadata['place_name'],
                        "category": metadata['category'],
                        "vibe": metadata['vibe'],
                        "distance_km": round(distance, 2),
                        "similarity_score": 1 - results['distances'][0][i],  # Convert distance to similarity
                        "budget_range": f"₹{int(metadata['budget_min'])}-₹{int(metadata['budget_max'])}",
                        "famous_for": metadata['famous_for'],
                        "area": metadata['area'],
                        "budget_match": budget_match,
                        "latitude": place_lat,
                        "longitude": place_lon,
                        "visit_time_hr": self._estimate_visit_time(metadata['category'])
                    }
                    
                    similar_places.append(place_info)
        
        # Sort by combined score (similarity + distance + budget match)
        similar_places.sort(key=lambda x: (
            x['similarity_score'] * 0.4 + 
            (1 - x['distance_km'] / max_distance_km) * 0.3 + 
            (0.3 if x['budget_match'] else 0.1)
        ), reverse=True)
        
        return similar_places[:n_results]
    
    def _check_budget_compatibility(self, user_budget: str, place_metadata: Dict) -> bool:
        """Check if place budget matches user budget preference"""
        budget_ranges = {
            "low": (0, 500),
            "medium": (200, 1500),
            "high": (800, 5000)
        }
        
        if user_budget not in budget_ranges:
            return True
        
        user_min, user_max = budget_ranges[user_budget]
        place_min = float(place_metadata['budget_min'])
        place_max = float(place_metadata['budget_max'])
        
        # Check for overlap
        return not (place_max < user_min or place_min > user_max)
    
    def _estimate_visit_time(self, category: str) -> float:
        """Estimate visit time based on place category"""
        time_mapping = {
            "Food": 1.0,
            "Café": 0.5,
            "Nature": 2.0,
            "Religious": 0.5,
            "Entertainment": 2.5,
            "Shopping": 1.5,
            "Heritage": 1.0,
            "Adventure": 3.0
        }
        
        for key, time in time_mapping.items():
            if key.lower() in category.lower():
                return time
        
        return 1.0  # default
    
    def get_embedding_stats(self) -> Dict:
        """Get statistics about the embedding database"""
        if not self.is_initialized:
            return {"status": "not_initialized"}
        
        count = self.collection.count()
        
        # Get sample of embeddings to check dimensions
        try:
            sample = self.collection.peek(limit=1)
            if sample and 'embeddings' in sample and sample['embeddings'] and len(sample['embeddings']) > 0:
                embedding_dim = len(sample['embeddings'][0])
            else:
                embedding_dim = 384  # Default for all-MiniLM-L6-v2
        except:
            embedding_dim = 384
        
        return {
            "status": "initialized",
            "total_places": count,
            "embedding_dimension": embedding_dim,
            "model_name": "all-MiniLM-L6-v2",
            "database_path": "./chroma_db"
        }
    
    def search_by_text(self, query_text: str, n_results: int = 5) -> List[Dict]:
        """Direct text search for debugging/testing"""
        if not self.is_initialized:
            self.initialize_embeddings()
        
        results = self.collection.query(
            query_texts=[query_text],
            n_results=n_results
        )
        
        places = []
        if results['metadatas'] and results['metadatas'][0]:
            for i, metadata in enumerate(results['metadatas'][0]):
                places.append({
                    "place_name": metadata['place_name'],
                    "category": metadata['category'],
                    "similarity_score": 1 - results['distances'][0][i],
                    "famous_for": metadata['famous_for']
                })
        
        return places

# Global instance
embedding_system = EmbeddingVectorSystem()