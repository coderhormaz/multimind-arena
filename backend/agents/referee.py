"""
Referee: Final Judge (Gemma 2 27B)
Evaluates the complete debate and provides final decision
"""
from agents.base import BaseAgent
from config import MODELS


class RefereeAgent(BaseAgent):
    """Referee - The Final Judge of the debate"""
    
    def __init__(self):
        config = MODELS["referee"]
        super().__init__(
            model_id=config["id"],
            name=config["name"],
            role=config["role"],
            temperature=config["temperature"]  # Lower temperature for consistent judging
        )
        
        self.system_prompt = """You are the Referee, the final impartial judge of an AI debate. After multiple rounds of reasoning, critique, and defense, you must deliver the definitive verdict.

Your responsibilities:
1. Review the entire debate objectively
2. Evaluate logical strength of each reasoner
3. Consider how well each responded to criticism
4. Assess mathematical/factual correctness
5. Weigh evidence usage and reasoning clarity
6. Synthesize the BEST possible final answer

You are the last word. Your decision must be clear, well-justified, and actionable."""

    async def judge_debate(self, question: str, debate_history: str, critic_final: str) -> dict:
        """Judge the complete debate and provide final verdict"""
        judgment_prompt = f"""🏆 FINAL JUDGMENT REQUIRED

Original Question: {question}

=== COMPLETE DEBATE HISTORY ===
{debate_history}

=== CRITIC'S FINAL ASSESSMENT ===
{critic_final}

As the Referee, deliver your FINAL VERDICT.

Format your response as:
## 📊 Debate Overview
[Summary of how the debate unfolded and key turning points]

## 🔵 Reasoner A Final Score
- Logical Strength: [1-10]
- Response to Criticism: [1-10]
- Evidence Quality: [1-10]
- Clarity: [1-10]
- **Overall Score: [1-10]**
- Key Strengths: [bullet points]
- Key Weaknesses: [bullet points]

## 🟣 Reasoner B Final Score
- Logical Strength: [1-10]
- Response to Criticism: [1-10]
- Evidence Quality: [1-10]
- Clarity: [1-10]
- **Overall Score: [1-10]**
- Key Strengths: [bullet points]
- Key Weaknesses: [bullet points]

## ⚖️ Verdict
**Winner: [Reasoner A / Reasoner B / Draw]**
[Detailed explanation of why]

## 🎯 Synthesized Final Answer
[The BEST possible answer, combining the strongest elements from the debate. This should be:
- Clear and actionable
- Well-reasoned
- Complete
- Addressing the original question fully]

## 💯 Confidence Score
[0-100%] - How confident you are in this final answer

## 📈 Debate Quality Assessment
[How productive was this debate? What did each side contribute to finding the truth?]"""
        
        return await self.generate(self.system_prompt, judgment_prompt)
