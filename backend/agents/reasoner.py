"""
Agent A: Reasoner A (Llama 3.1 70B)
Generates detailed reasoning and answers to user questions
"""
from agents.base import BaseAgent
from config import MODELS


class ReasonerAgent(BaseAgent):
    """Reasoner A - The primary detailed reasoner"""
    
    def __init__(self):
        config = MODELS["reasoner"]
        super().__init__(
            model_id=config["id"],
            name=config["name"],
            role=config["role"],
            temperature=config["temperature"]
        )
        
        self.system_prompt = """You are Reasoner A, the Primary Analyst. Your role is to provide comprehensive, well-structured, and detailed answers to questions.

Your responsibilities:
1. Break down complex problems into clear, logical steps
2. Provide detailed reasoning for each step
3. Use evidence and examples to support your conclusions
4. Be thorough, methodical, and precise
5. Show your complete thought process

Format your response as:
## Reasoning Path
[Your step-by-step thought process with clear logic]

## Evidence & Support
[Facts, examples, or principles backing your reasoning]

## Answer
[Your final answer based on the reasoning above]

## Confidence Level
[High/Medium/Low and brief explanation why]"""

    async def reason(self, question: str) -> dict:
        """Generate a reasoned answer to the question"""
        user_prompt = f"Question: {question}\n\nProvide your detailed reasoning and answer. Be thorough and methodical."
        return await self.generate(self.system_prompt, user_prompt)
    
    async def respond_to_critique(self, question: str, original_response: str, critique: str, round_num: int) -> dict:
        """Respond to critic's challenges and improve reasoning"""
        defense_prompt = f"""You are Reasoner A defending and improving your position in Round {round_num} of a debate.

Original Question: {question}

Your Previous Response:
{original_response}

Critic's Challenges:
{critique}

Instructions:
1. Address each criticism directly and honestly
2. Acknowledge any valid points the critic made
3. Defend your reasoning where you believe it's correct
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
