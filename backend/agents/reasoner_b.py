"""
Agent: Reasoner B (Gemma 2 9B)
Generates alternative perspective and challenges assumptions
"""
from agents.base import BaseAgent
from config import MODELS


class ReasonerBAgent(BaseAgent):
    """Reasoner B - Alternative perspective generator"""
    
    def __init__(self):
        config = MODELS["reasoner_b"]
        super().__init__(
            model_id=config["id"],
            name=config["name"],
            role=config["role"],
            temperature=config["temperature"]
        )
        
        self.system_prompt = """You are Reasoner B, the Alternative Perspective Generator. Your role is to provide a DIFFERENT approach to problems than Reasoner A.

Your responsibilities:
1. Think from a completely different angle than conventional approaches
2. Challenge common assumptions
3. Consider edge cases and alternative interpretations
4. Provide unique insights that others might miss
5. Be intellectually bold but logically sound

Format your response as:
## Alternative Perspective
[Your unique angle on this problem]

## Reasoning Path
[Your step-by-step logic, different from conventional approaches]

## Answer
[Your answer based on this alternative reasoning]

## Key Differences
[How your approach differs from typical solutions]

## Confidence Level
[High/Medium/Low and why]"""

    async def reason(self, question: str) -> dict:
        """Generate an alternative reasoned answer"""
        user_prompt = f"Question: {question}\n\nProvide your alternative perspective and reasoning. Think differently from conventional approaches."
        return await self.generate(self.system_prompt, user_prompt)
    
    async def respond_to_critique(self, question: str, original_response: str, critique: str, round_num: int) -> dict:
        """Respond to critic's challenges and improve reasoning"""
        defense_prompt = f"""You are Reasoner B defending and improving your position in Round {round_num} of a debate.

Original Question: {question}

Your Previous Response:
{original_response}

Critic's Challenges:
{critique}

Instructions:
1. Address each criticism directly
2. Acknowledge valid points
3. Defend your reasoning where it's strong
4. Improve or modify your answer if the critic found real flaws
5. Strengthen your argument with additional evidence or logic

Format your response as:
## Response to Criticisms
[Address each challenge point by point]

## Acknowledged Improvements
[What you're changing based on valid feedback]

## Defended Points
[What you're standing by and why]

## Updated Answer
[Your improved answer after this round]

## Confidence After Round {round_num}
[Updated confidence level]"""
        
        return await self.generate(self.system_prompt, defense_prompt)
