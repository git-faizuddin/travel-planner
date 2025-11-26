# Fallback Mechanism for Quota-Exceeded Scenarios

## Overview

When ChatGPT API quota is exceeded or rate-limited, the system automatically falls back to rule-based filtering methods. This ensures the API continues to work even with limited quota.

## How It Works

### 1. Parameter Extraction Fallback

When ChatGPT quota is exceeded during parameter extraction:

**ChatGPT Method:**
- Uses AI to extract location, dates, budget, preferences
- Handles complex natural language

**Fallback Method (`_fallback_extract_parameters`):**
- Uses keyword matching and regex patterns
- Extracts:
  - **Location**: Matches common city/country names
  - **Budget**: Finds patterns like "under 200€", "below 150", etc.
  - **Preferences**: Detects keywords like "romantic", "family", "luxury", "beach"
  - **Adults/Children**: Basic number extraction

**Example:**
```
Input: "romantic getaway near lakes in Italy under 200€"
Fallback extracts:
- location: "Italy"
- budget_max: 200.0
- preferences: ["romantic"]
```

### 2. Hotel Filtering Fallback

When ChatGPT quota is exceeded during hotel filtering:

**ChatGPT Method:**
- AI-powered semantic matching
- Understands context and intent

**Fallback Method (`_fallback_filter_hotels`):**
- Rule-based scoring system
- Filters by:
  - **Budget**: Removes hotels over budget limit
  - **Location**: Matches city/country keywords
  - **Preferences**: Scores based on keyword matches
  - **Rating**: Bonus points for higher-rated hotels
- Returns hotels sorted by relevance score

**Scoring System:**
- Budget match: +10 points
- Location match: +5 points
- Preference match: +3 points
- Rating bonus: rating × 2 points

## Error Handling

The system catches these OpenAI errors:
- `RateLimitError` - Rate limit exceeded
- `APIError` with "insufficient_quota" - No quota remaining
- `APIError` with "429" status - Rate limit/quota error

When detected, the system:
1. Logs a warning message
2. Automatically switches to fallback method
3. Continues processing the request
4. Returns results (may be less accurate but still functional)

## Benefits

✅ **API Always Works**: Even with zero ChatGPT quota, the API responds  
✅ **Graceful Degradation**: Falls back automatically, no user-visible errors  
✅ **Budget Friendly**: Uses ChatGPT only when quota is available  
✅ **Reasonable Results**: Fallback provides useful, if less sophisticated, results  

## Limitations

⚠️ **Less Accurate**: Rule-based methods are less sophisticated than AI  
⚠️ **Limited Understanding**: Can't handle complex queries as well  
⚠️ **No Context**: Doesn't understand nuanced preferences  

## Example Scenarios

### Scenario 1: Quota Available
```
User: "romantic getaway near lakes in Italy under 200€"
→ ChatGPT extracts parameters
→ ChatGPT filters hotels
→ Returns AI-matched results
```

### Scenario 2: Quota Exceeded
```
User: "romantic getaway near lakes in Italy under 200€"
→ ChatGPT quota error detected
→ Fallback extracts: location=Italy, budget_max=200, preferences=["romantic"]
→ Fallback filters hotels by rules
→ Returns rule-based results (still functional!)
```

## Testing

To test the fallback mechanism:

1. **Temporarily disable API key** (or use invalid key):
   ```bash
   # In .env, set:
   OPENAI_API_KEY=invalid_key_for_testing
   ```

2. **Make a request**:
   ```bash
   curl -X POST "http://localhost:8000/api/v1/recommendations/recommend" \
     -H "Content-Type: application/json" \
     -d '{"user_demand": "romantic getaway in Italy under 200€"}'
   ```

3. **Check logs** - You should see:
   ```
   WARNING: ChatGPT quota/rate limit exceeded, using fallback...
   INFO: Fallback filtering matched X hotels
   ```

## Configuration

No configuration needed! The fallback activates automatically when quota errors are detected.

## Future Improvements

Potential enhancements:
- Cache common parameter extractions
- Improve rule-based matching with ML models
- Add hybrid approach (use ChatGPT for complex queries, rules for simple ones)
- Implement quota monitoring and automatic switching

