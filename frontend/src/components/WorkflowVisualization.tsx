import { WorkflowPlan } from '@/types';

interface Props {
  workflow: WorkflowPlan;
  activeAgent: string | null;
  completedSteps: number[];
}

export default function WorkflowVisualization({ workflow, activeAgent, completedSteps }: Props) {
  return (
    <div className="bg-[#2f2f2f] rounded-xl p-4 border border-[#424242]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-medium text-white flex items-center gap-2">
            <span className="text-[#10a37f]">▷</span>
            {workflow.workflow_name}
          </h3>
          <p className="text-sm text-[#b4b4b4] mt-1">{workflow.strategy}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs ${
            workflow.complexity_level === 'simple' ? 'bg-[#10a37f]/20 text-[#10a37f]' :
            workflow.complexity_level === 'moderate' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' :
            'bg-[#ef4444]/20 text-[#ef4444]'
          }`}>
            {workflow.complexity_level}
          </span>
          {workflow.debate_enabled && (
            <span className="px-2 py-1 bg-[#8b5cf6]/20 text-[#8b5cf6] rounded text-xs">
              ⚔ Debate
            </span>
          )}
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="flex flex-wrap items-center gap-2">
        {workflow.steps.map((step, index) => {
          const isActive = activeAgent === step.agent_id;
          const isComplete = completedSteps.includes(step.step_number);
          
          return (
            <div key={index} className="flex items-center">
              {/* Step Node */}
              <div 
                className={`
                  relative flex items-center gap-2 px-3 py-2 rounded-lg border transition-all
                  ${isActive 
                    ? 'border-[#10a37f] bg-[#10a37f]/10' 
                    : isComplete 
                      ? 'border-[#10a37f]/50 bg-[#212121]' 
                      : 'border-[#424242] bg-[#212121]'
                  }
                `}
              >
                <span className="text-lg">{step.icon}</span>
                <div>
                  <p className={`text-sm font-medium ${isActive ? 'text-[#10a37f]' : isComplete ? 'text-white' : 'text-[#b4b4b4]'}`}>
                    {step.agent_name}
                  </p>
                  <p className="text-xs text-[#565656]">{step.task}</p>
                </div>
                {isComplete && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#10a37f] rounded-full flex items-center justify-center text-xs text-white">
                    ✓
                  </span>
                )}
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#10a37f] rounded-full flex items-center justify-center">
                    <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                  </span>
                )}
              </div>
              
              {/* Arrow to next step */}
              {index < workflow.steps.length - 1 && (
                <span className="text-[#565656] mx-2">→</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-[#565656] mb-1">
          <span>Progress</span>
          <span>{completedSteps.length} / {workflow.steps.length} steps</span>
        </div>
        <div className="h-1.5 bg-[#212121] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#10a37f] rounded-full transition-all duration-500"
            style={{ width: `${(completedSteps.length / workflow.steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
