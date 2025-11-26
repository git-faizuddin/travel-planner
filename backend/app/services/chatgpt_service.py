"""
ChatGPT service for extracting search parameters and filtering hotel results
"""
import json
import logging
from typing import Dict, List, Any, Optional
from openai import OpenAI
from openai import RateLimitError, APIError
from app.config import settings
from app.schemas.recommendation import (
    ChatGPTParameterExtractionResponse
)

logger = logging.getLogger(__name__)


class ChatGPTService:
    """Service for interacting with ChatGPT API"""
    
    def __init__(self):
        self.api_key = settings.openai_api_key
        self.model = settings.openai_model
        if self.api_key:
            self.client = OpenAI(api_key=self.api_key)
        else:
            self.client = None
            logger.warning("OpenAI API key is not configured. ChatGPT features will not work.")
    
    def extract_search_parameters(self, user_demand: str) -> ChatGPTParameterExtractionResponse:
        """
        Extract search parameters from user's natural language demand
        
        Args:
            user_demand: User's natural language request
            
        Returns:
            ChatGPTParameterExtractionResponse with extracted parameters
        """
        # Optimized prompt - shorter and more concise
        prompt = f"""Extract hotel search parameters from: "{user_demand}"

Return JSON only:
{{
  "location": "city/country name or null",
  "check_in": "YYYY-MM-DD or null",
  "check_out": "YYYY-MM-DD or null",
  "budget_min": number or null,
  "budget_max": number or null,
  "adults": number (default 1),
  "children": number (default 0),
  "rooms": number (default 1),
  "preferences": ["keyword1", "keyword2"] or null
}}

Notes: Calculate relative dates. Budget defaults to EUR. Return null if unknown."""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Extract hotel search parameters. Return JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"},
                max_tokens=200  # Limit response length
            )
            
            content = response.choices[0].message.content
            logger.info(f"ChatGPT parameter extraction response: {content}")
            
            # Parse JSON response
            try:
                params_dict = json.loads(content)
                return ChatGPTParameterExtractionResponse(**params_dict)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse ChatGPT JSON response: {e}")
                logger.error(f"Response content: {content}")
                # Fallback: try to extract JSON from markdown code blocks
                if "```json" in content:
                    json_start = content.find("```json") + 7
                    json_end = content.find("```", json_start)
                    content = content[json_start:json_end].strip()
                    params_dict = json.loads(content)
                    return ChatGPTParameterExtractionResponse(**params_dict)
                raise
            
        except (RateLimitError, APIError) as e:
            error_str = str(e)
            # Check if it's a quota/rate limit error
            if "insufficient_quota" in error_str.lower() or "429" in error_str or "rate_limit" in error_str.lower() or isinstance(e, RateLimitError):
                logger.warning(f"ChatGPT quota/rate limit exceeded, using fallback parameter extraction: {e}")
                # Fallback to simple rule-based extraction
                return self._fallback_extract_parameters(user_demand)
            logger.error(f"ChatGPT API error: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error calling ChatGPT API: {e}")
            raise
    
    def filter_hotels_by_demand(
        self, 
        user_demand: str, 
        hotels: List[Dict[str, Any]]
    ) -> List[str]:
        """
        Filter hotels based on user demand using ChatGPT - OPTIMIZED VERSION
        Returns only hotel IDs to minimize token usage
        
        Args:
            user_demand: Original user demand
            hotels: List of hotel data from Booking.com API
            
        Returns:
            List of hotel IDs (strings) that match, ordered by relevance
        """
        if not hotels:
            return []
        
        # Prepare MINIMAL hotel data - only essential fields with IDs
        hotels_summary = []
        for hotel in hotels:
            hotel_id = str(hotel.get("hotel_id", ""))
            if not hotel_id:
                continue  # Skip hotels without ID
            
            # Include amenities for better filtering
            amenities = hotel.get("amenities", [])
            amenities_str = ", ".join(amenities[:5]) if amenities else ""  # Limit to first 5
            
            # Minimal data - only what's needed for matching
            hotel_summary = {
                "id": hotel_id,
                "name": hotel.get("name", "Unknown")[:50],  # Truncate name
                "city": hotel.get("city", ""),
                "price": hotel.get("price"),
                "rating": hotel.get("rating") or hotel.get("review_score"),
                "amenities": amenities_str[:100]  # Truncate amenities
            }
            hotels_summary.append(hotel_summary)
        
        logger.info(f"Filtering {len(hotels_summary)} hotels for user demand: '{user_demand}'")
        logger.debug(f"Hotels summary: {json.dumps(hotels_summary, ensure_ascii=False)[:500]}...")
        
        # Optimized prompt - much shorter
        prompt = f"""User request: "{user_demand}"

Hotels:
{json.dumps(hotels_summary, ensure_ascii=False)}

Return JSON with hotel IDs that match (ordered by relevance):
{{"matched_ids": ["id1", "id2", ...]}}"""

        if not self.client:
            logger.warning("OpenAI API key is not configured. Using fallback filtering.")
            return self._fallback_filter_hotels(user_demand, hotels)
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Filter hotels. Return JSON with matched_ids array only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"},
                max_tokens=500  # Limit response - only IDs needed
            )
            
            content = response.choices[0].message.content
            logger.info(f"ChatGPT hotel filtering response (truncated): {content[:200]}...")
            logger.info(f"Full ChatGPT response: {content}")
            
            # Parse JSON response
            try:
                if "```json" in content:
                    json_start = content.find("```json") + 7
                    json_end = content.find("```", json_start)
                    content = content[json_start:json_end].strip()
                
                filter_result = json.loads(content)
                matched_ids = filter_result.get("matched_ids", [])
                
                logger.info(f"ChatGPT successfully matched {len(matched_ids)} hotel IDs: {matched_ids}")
                return matched_ids
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse ChatGPT filtering response: {e}")
                logger.error(f"Response content: {content}")
                logger.warning("Using fallback filtering due to JSON parse error")
                # Fallback to rule-based filtering
                return self._fallback_filter_hotels(user_demand, hotels)
            
        except (RateLimitError, APIError) as e:
            error_str = str(e)
            # Check if it's a quota/rate limit error
            if "insufficient_quota" in error_str.lower() or "429" in error_str or "rate_limit" in error_str.lower() or isinstance(e, RateLimitError):
                logger.warning(f"ChatGPT quota/rate limit exceeded, using fallback hotel filtering: {e}")
                # Fallback to rule-based filtering
                return self._fallback_filter_hotels(user_demand, hotels)
            logger.error(f"ChatGPT API error for filtering: {e}")
            logger.warning("Using fallback filtering due to API error")
            # Fallback to rule-based filtering
            return self._fallback_filter_hotels(user_demand, hotels)
        except Exception as e:
            logger.error(f"Unexpected error calling ChatGPT API for filtering: {e}", exc_info=True)
            logger.warning("Using fallback filtering due to unexpected error")
            # Fallback to rule-based filtering
            return self._fallback_filter_hotels(user_demand, hotels)
    
    def _fallback_extract_parameters(self, user_demand: str) -> ChatGPTParameterExtractionResponse:
        """
        Fallback method: Simple rule-based parameter extraction when ChatGPT quota is exceeded
        Uses basic keyword matching and regex patterns
        """
        import re
        from datetime import datetime, timedelta
        
        user_lower = user_demand.lower()
        
        # Extract location (look for common location keywords)
        location = None
        locations = ["italy", "france", "spain", "paris", "rome", "london", "berlin", "amsterdam", 
                    "vienna", "prague", "barcelona", "madrid", "milan", "venice", "florence",
                    "lake como", "tuscany", "santorini", "mykonos", "bali", "thailand"]
        for loc in locations:
            if loc in user_lower:
                location = loc.title()
                break
        
        # Extract budget
        budget_max = None
        budget_min = None
        # Look for patterns like "under 200€", "below 200", "less than 200"
        budget_patterns = [
            r"under\s+(\d+)",
            r"below\s+(\d+)",
            r"less\s+than\s+(\d+)",
            r"up\s+to\s+(\d+)",
            r"max\s+(\d+)",
            r"maximum\s+(\d+)",
            r"(\d+)\s*€",
            r"(\d+)\s*eur",
            r"(\d+)\s*euro"
        ]
        for pattern in budget_patterns:
            match = re.search(pattern, user_lower)
            if match:
                budget_max = float(match.group(1))
                break
        
        # Extract preferences
        preferences = []
        pref_keywords = {
            "romantic": ["romantic", "romance", "couple", "honeymoon"],
            "family": ["family", "family-friendly", "kids", "children"],
            "luxury": ["luxury", "luxurious", "5-star", "five star"],
            "beach": ["beach", "seaside", "coastal", "ocean"],
            "mountain": ["mountain", "alpine", "ski"],
            "city": ["city", "urban", "downtown"]
        }
        for pref, keywords in pref_keywords.items():
            if any(kw in user_lower for kw in keywords):
                preferences.append(pref)
        
        # Extract number of adults/children (basic)
        adults = 1
        children = 0
        adults_match = re.search(r"(\d+)\s+adult", user_lower)
        if adults_match:
            adults = int(adults_match.group(1))
        
        return ChatGPTParameterExtractionResponse(
            location=location,
            check_in=None,
            check_out=None,
            budget_min=budget_min,
            budget_max=budget_max,
            adults=adults,
            children=children,
            rooms=1,
            preferences=preferences if preferences else None
        )
    
    def _fallback_filter_hotels(
        self, 
        user_demand: str, 
        hotels: List[Dict[str, Any]]
    ) -> List[str]:
        """
        Fallback method: Simple rule-based hotel filtering when ChatGPT quota is exceeded
        Filters hotels based on basic keyword matching and price constraints
        """
        import re
        
        logger.info(f"Using fallback filter for user demand: '{user_demand}'")
        user_lower = user_demand.lower()
        matched_hotel_ids = []
        
        # Extract budget constraint
        budget_max = None
        budget_patterns = [
            r"under\s+(\d+)",
            r"below\s+(\d+)",
            r"less\s+than\s+(\d+)",
            r"up\s+to\s+(\d+)",
            r"(\d+)\s*€",
            r"(\d+)\s*eur",
            r"budget",
            r"cheap",
            r"affordable"
        ]
        for pattern in budget_patterns:
            match = re.search(pattern, user_lower)
            if match:
                if match.groups():
                    budget_max = float(match.group(1))
                else:
                    # For "budget", "cheap", "affordable" - set a low budget
                    budget_max = 100.0
                break
        
        # Extract preference keywords
        preference_keywords = {
            "luxury": ["luxury", "premium", "5-star", "five star"],
            "budget": ["budget", "cheap", "affordable", "economy"],
            "romantic": ["romantic", "honeymoon", "couple"],
            "family": ["family", "kids", "children", "family-friendly"],
            "business": ["business", "corporate", "conference"],
            "beach": ["beach", "seaside", "ocean", "coast"],
            "pool": ["pool", "swimming"],
            "spa": ["spa", "wellness", "massage"]
        }
        
        detected_preferences = []
        for pref, keywords in preference_keywords.items():
            if any(kw in user_lower for kw in keywords):
                detected_preferences.append(pref)
        
        logger.info(f"Detected preferences: {detected_preferences}, budget_max: {budget_max}")
        
        # Score and filter hotels
        scored_hotels = []
        for hotel in hotels:
            hotel_id = str(hotel.get("hotel_id", ""))
            if not hotel_id:
                continue
            
            score = 0
            price = hotel.get("price")
            city = hotel.get("city", "").lower()
            country = hotel.get("country", "").lower()
            name = hotel.get("name", "").lower()
            amenities = [a.lower() if isinstance(a, str) else str(a).lower() for a in hotel.get("amenities", [])]
            amenities_str = " ".join(amenities)
            description = hotel.get("description", "").lower()
            
            # Budget match
            if budget_max and price:
                if price <= budget_max:
                    score += 10
                else:
                    # Still include but with lower score
                    score -= 5
            
            # Preference matching based on amenities and description
            if "luxury" in detected_preferences:
                rating = hotel.get("rating") or hotel.get("review_score", 0)
                if rating and rating >= 4.5:
                    score += 5
                if "luxury" in name or "resort" in name or "grand" in name:
                    score += 3
            
            if "budget" in detected_preferences:
                if price and price <= 100:
                    score += 5
                if "budget" in name or "inn" in name or "hostel" in name:
                    score += 3
            
            if "romantic" in detected_preferences:
                if any(kw in amenities_str or kw in description for kw in ["spa", "romantic", "boutique"]):
                    score += 5
            
            if "family" in detected_preferences:
                if any(kw in amenities_str or kw in description for kw in ["pool", "kids", "family", "playground"]):
                    score += 5
            
            if "beach" in detected_preferences:
                if any(kw in amenities_str or kw in description or kw in name for kw in ["beach", "ocean", "seaside", "coast"]):
                    score += 5
            
            if "pool" in detected_preferences:
                if "pool" in amenities_str:
                    score += 5
            
            if "spa" in detected_preferences:
                if "spa" in amenities_str:
                    score += 5
            
            # Rating bonus (always apply)
            rating = hotel.get("rating") or hotel.get("review_score", 0)
            if rating:
                score += rating * 1.5  # Higher rating = higher score
            
            # Base score for all hotels (so we don't exclude everything)
            score += 1
            
            scored_hotels.append((score, hotel_id))
            logger.debug(f"Hotel {hotel_id} ({name[:30]}): score={score:.1f}, price={price}, rating={rating}")
        
        # Sort by score (descending) and return IDs
        scored_hotels.sort(key=lambda x: x[0], reverse=True)
        matched_hotel_ids = [hotel_id for _, hotel_id in scored_hotels]
        
        logger.info(f"Fallback filtering matched {len(matched_hotel_ids)} hotels: {matched_hotel_ids[:5]}")
        return matched_hotel_ids

