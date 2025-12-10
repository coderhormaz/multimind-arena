"""
Critic Agent (Qwen 2.5 72B)
Analyzes both reasoners' responses, finds flaws, and challenges them to improve
"""
from agents.base import BaseAgent
from config import MODELS


class CriticAgent(BaseAgent):
    """The Critic - Analyzes, challenges, and pushes reasoners to improve"""
    
    def __init__(self):
        config = MODELS["critic"]
        super().__init__(
            model_id=config["id"],
            name=config["name"],
            role=config["role"],
            temperature=config["temperature"]
        )
        
        self.system_prompt = """You are the Critic, a sharp analytical mind in a debate system. Your role is to critically analyze BOTH reasoners' arguments and challenge them to improve.

Your responsibilities:
1. Compare both reasoners' approaches objectively
2. Identify logical flaws, gaps, or inconsistencies in BOTH
3. Challenge weak assumptions
4. Ask probing questions that force deeper thinking
5. Push both reasoners to strengthen their arguments
6. Be fair but rigorous - don't let weak reasoning slide

You are NOT here to pick a winner - you're here to make BOTH arguments better through tough criticism."""

    async def critique_debate(self, question: str, reasoner_a_response: str, reasoner_b_response: str, round_num: int) -> dict:
        """Critique both reasoners in a debate round"""
        critique_prompt = f"""DEBATE ROUND {round_num} - CRITIC ANALYSIS

Original Question: {question}

=== REASONER A's RESPONSE ===
{reasoner_a_response}

=== REASONER B's RESPONSE ===
{reasoner_b_response}

Provide your critical analysis of BOTH reasoners. Be thorough and challenging.

Format your response as:
## Round {round_num} Analysis Overview
[Brief summary of both approaches and their key differences]

## Critique of Reasoner A
### Strengths
[What Reasoner A did well]
### Weaknesses & Flaws
[Specific problems with their reasoning]
### Challenges for Next Round
[Direct questions/challenges Reasoner A must address]

## Critique of Reasoner B
### Strengths
[What Reasoner B did well]
### Weaknesses & Flaws
[Specific problems with their reasoning]
### Challenges for Next Round
[Direct questions/challenges Reasoner B must address]

## Key Points of Contention
[Where the two reasoners fundamentally disagree and why it matters]

## Questions Both Must Answer
[Probing questions that will help resolve the debate]

## Current Assessment
[Who has the stronger argument RIGHT NOW and why - but note this can change]"""
        
        return await self.generate(self.system_prompt, critique_prompt)
    
    async def final_critique(self, question: str, debate_history: str) -> dict:
        """Provide final critique after all rounds"""
        final_prompt = f"""FINAL CRITIQUE - DEBATE COMPLETE

Original Question: {question}

=== FULL DEBATE HISTORY ===
{debate_history}

Provide your FINAL critical assessment before the Referee makes their decision.

Format your response as:
## Debate Summary
[How the debate evolved across rounds]

## Final Assessment of Reasoner A
- Overall Strength: [1-10]
- Key Contributions: [What they added to the discussion]
- Remaining Weaknesses: [Issues never fully resolved]

## Final Assessment of Reasoner B
- Overall Strength: [1-10]
- Key Contributions: [What they added to the discussion]
- Remaining Weaknesses: [Issues never fully resolved]

## Most Compelling Arguments
[The strongest points from the entire debate]

## Unresolved Issues
[Questions or problems neither reasoner fully addressed]

## Recommendation for Referee
[Your assessment of which reasoning path is stronger and why]"""
        
        return await self.generate(self.system_prompt, final_prompt)
