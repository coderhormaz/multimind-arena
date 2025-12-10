"""
Base Agent class for OpenRouter API interactions
PAID MODE - With $10+ credits you get 1000 requests/day!
Still respects 20 requests/minute limit
"""
import httpx
import asyncio
import random
import time
from typing import Optional
from config import OPENROUTER_API_KEY, OPENROUTER_BASE_URL

# ============================================================
# RATE LIMITING FOR PAID TIER
# 20 req/min = 1 request every 3 seconds minimum
# 1000 req/day with credits
# ============================================================

_last_call_time = 0
_min_delay = 3.0  # 3 seconds between calls (safe for 20/min)
_request_count = 0
_daily_limit = 950  # 1000/day with credits, leave small buffer
_minute_requests = []  # Track requests per minute


class BaseAgent:
    """Base class for all AI agents with rate limiting"""
    
    def __init__(self, model_id: str, name: str, role: str, temperature: float = 0.7):
        self.model_id = model_id
        self.name = name
        self.role = role
        self.temperature = temperature
        self.api_key = OPENROUTER_API_KEY
        self.base_url = OPENROUTER_BASE_URL
        self.max_retries = 5  # More retries with paid tier
        self.base_delay = 5.0  # Base delay for retries
    
    async def _wait_for_rate_limit(self):
        """
        Rate limiting for paid tier:
        - Minimum 3s between calls (respects 20/min)
        - Track per-minute to stay under 20/min
        """
        global _last_call_time, _request_count, _minute_requests
        current_time = time.time()
        
        # Clean up old minute requests (older than 60s)
        _minute_requests = [t for t in _minute_requests if current_time - t < 60]
        
        # If too many requests in last minute, wait longer
        if len(_minute_requests) >= 15:  # Stay well under 20/min
            wait_time = 60 - (current_time - _minute_requests[0]) + 5
            print(f"[{self.name}] ⚠️ Near minute limit ({len(_minute_requests)}/15). Waiting {wait_time:.0f}s...")
            await asyncio.sleep(wait_time)
            current_time = time.time()
        
        # Minimum delay between calls
        elapsed = current_time - _last_call_time
        if elapsed < _min_delay:
            wait_time = _min_delay - elapsed + random.uniform(0.5, 2.0)
            print(f"[{self.name}] ⏳ Rate limit delay: {wait_time:.1f}s...")
            await asyncio.sleep(wait_time)
        
        # Update tracking
        _last_call_time = time.time()
        _minute_requests.append(_last_call_time)
        _request_count += 1
        
        # Warn if approaching daily limit
        if _request_count >= _daily_limit - 5:
            print(f"[{self.name}] ⚠️ WARNING: Approaching daily limit ({_request_count}/{_daily_limit})")
        
        print(f"[{self.name}] 📊 Request #{_request_count} (minute: {len(_minute_requests)}/15)")
    
    async def generate(self, prompt: str, system_prompt: str = None) -> str:
        """
        Generate a response with rate limiting.
        Handles models that don't support system prompts by merging into user message.
        """
        if system_prompt is None:
            system_prompt = f"You are {self.name}, a {self.role}. Be concise and accurate."
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Multi-Agent AI System"
        }
        
        # Some models don't support system prompts - merge into user message
        # This is safer and works with all models
        combined_prompt = f"{system_prompt[:300]}\n\n{prompt[:2000]}"
        
        messages = [
            {"role": "user", "content": combined_prompt}
        ]
        
        payload = {
            "model": self.model_id,
            "messages": messages,
            "temperature": self.temperature,
            "max_tokens": 1000,
        }
        
        last_error = None
        for attempt in range(self.max_retries):
            try:
                # Wait for rate limit
                await self._wait_for_rate_limit()
                
                print(f"[{self.name}] 🚀 API call (attempt {attempt + 1}/{self.max_retries})...")
                
                async with httpx.AsyncClient(timeout=120.0) as client:
                    response = await client.post(
                        f"{self.base_url}/chat/completions",
                        headers=headers,
                        json=payload
                    )
                    
                    # Handle rate limiting - wait much longer
                    if response.status_code == 429:
                        retry_after = int(response.headers.get("Retry-After", 30))
                        wait_time = max(retry_after, 30) + random.uniform(5, 15)
                        print(f"[{self.name}] 🛑 Rate limited! Waiting {wait_time:.0f}s...")
                        await asyncio.sleep(wait_time)
                        continue
                    
                    # Handle bad request
                    if response.status_code == 400:
                        error_text = response.text[:300]
                        print(f"[{self.name}] ❌ Bad request (400): {error_text}")
                        # Try with minimal payload
                        if attempt < self.max_retries - 1:
                            payload["temperature"] = 0.3
                            payload["max_tokens"] = 500
                            await asyncio.sleep(5)
                            continue
                        return f"[Error: Model issue] Please try again or use a different query."
                    
                    response.raise_for_status()
                    result = response.json()
                    
                    if "choices" not in result or len(result["choices"]) == 0:
                        print(f"[{self.name}] ⚠️ No choices: {result}")
                        return "[Error: Empty response from model]"
                    
                    content = result["choices"][0]["message"]["content"]
                    print(f"[{self.name}] ✅ Success! ({len(content)} chars)")
                    return content
                    
            except httpx.HTTPStatusError as e:
                last_error = e
                status = e.response.status_code
                if status == 429:
                    wait_time = 30 + (15 * attempt) + random.uniform(5, 10)
                    print(f"[{self.name}] 🛑 Rate limited ({status}). Waiting {wait_time:.0f}s...")
                    await asyncio.sleep(wait_time)
                elif status in [400, 422]:
                    print(f"[{self.name}] ❌ Bad request: {e.response.text[:200]}")
                    return f"[Error: Request issue] {e.response.text[:100]}"
                else:
                    print(f"[{self.name}] ⚠️ HTTP {status}: {str(e)[:80]}")
                    await asyncio.sleep(self.base_delay * (attempt + 1))
                    
            except asyncio.TimeoutError:
                print(f"[{self.name}] ⏰ Timeout. Retrying...")
                last_error = "Timeout"
                await asyncio.sleep(10)
                    
            except Exception as e:
                last_error = e
                wait_time = self.base_delay * (attempt + 1)
                print(f"[{self.name}] ⚠️ Error: {str(e)[:80]}. Wait {wait_time:.0f}s...")
                await asyncio.sleep(wait_time)
        
        # Return error message instead of raising to avoid breaking workflow
        return f"[{self.name} Error] Failed after {self.max_retries} attempts. Last error: {str(last_error)[:100]}"
    
    async def generate_with_metadata(self, system_prompt: str, user_prompt: str) -> dict:
        """Generate a response with full metadata"""
        import time
        start_time = time.time()
        
        content = await self.generate(user_prompt, system_prompt)
        
        end_time = time.time()
        processing_time = round(end_time - start_time, 2)
        
        return {
            "agent": self.name,
            "role": self.role,
            "model": self.model_id,
            "content": content,
            "processing_time": processing_time
        }
