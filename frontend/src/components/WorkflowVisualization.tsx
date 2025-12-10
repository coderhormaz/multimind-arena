import { WorkflowPlan } from '@/types';

interface Props {
  workflow: WorkflowPlan;
  activeAgent: string | null;
  completedSteps: number[];
}

export default function WorkflowVisualization({ workflow, activeAgent, completedSteps }: Props) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-purple-500/30">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-medium text-white flex items-center gap-2">
            <span>📋</span>
            {workflow.workflow_name}
          </h3>
          <p className="text-sm text-gray-400 mt-1">{workflow.strategy}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs ${
            workflow.complexity_level === 'simple' ? 'bg-green-500/20 text-green-400' :
            workflow.complexity_level === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {workflow.complexity_level}
          </span>
          {workflow.debate_enabled && (
            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
              ⚔️ Debate
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
                    ? 'border-purple-500 bg-purple-500/20 animate-pulse' 
                    : isComplete 
                      ? 'border-green-500/50 bg-green-500/10' 
                      : 'border-gray-700 bg-gray-800/50'
                  }
                `}
              >
                <span className="text-lg">{step.icon}</span>
                <div>
                  <p className={`text-sm font-medium ${isActive ? 'text-purple-300' : isComplete ? 'text-green-300' : 'text-gray-300'}`}>
                    {step.agent_name}
                  </p>
                  <p className="text-xs text-gray-500">{step.task}</p>
                </div>
                {isComplete && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-xs">
                    ✓
                  </span>
                )}
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                  </span>
                )}
              </div>
              
              {/* Arrow to next step */}
              {index < workflow.steps.length - 1 && (
                <svg className="w-6 h-6 text-gray-600 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{completedSteps.length} / {workflow.steps.length} steps</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${(completedSteps.length / workflow.steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
