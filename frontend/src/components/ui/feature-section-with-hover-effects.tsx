import { cn } from "@/lib/utils";
import {
  IconAdjustmentsBolt,
  IconCloud,
  IconCurrencyDollar,
  IconEaseInOut,
  IconHeart,
  IconHelp,
  IconRouteAltLeft,
  IconTerminal2,
} from "@tabler/icons-react";

export function FeaturesSectionWithHoverEffects() {
  const features = [
    {
      title: "Multi-Agent System",
      description:
        "Powered by 6 specialized AI agents working together to deliver comprehensive analysis.",
      icon: <IconTerminal2 />,
    },
    {
      title: "Real-time Debates",
      description:
        "Watch AI agents debate and refine ideas in real-time with dynamic workflows.",
      icon: <IconEaseInOut />,
    },
    {
      title: "Advanced Analysis",
      description:
        "Deep reasoning and critical analysis powered by master controller orchestration.",
      icon: <IconCurrencyDollar />,
    },
    {
      title: "100% Reliable",
      description: "Built with robust architecture for consistent performance.",
      icon: <IconCloud />,
    },
    {
      title: "Flexible Workflows",
      description: "Adaptive workflow engine that adjusts to your needs dynamically.",
      icon: <IconRouteAltLeft />,
    },
    {
      title: "Memory Engine",
      description:
        "Intelligent memory system that learns and adapts from every interaction.",
      icon: <IconHelp />,
    },
    {
      title: "Comprehensive Insights",
      description:
        "Get detailed, well-reasoned conclusions from multiple perspectives.",
      icon: <IconAdjustmentsBolt />,
    },
    {
      title: "And much more",
      description: "Continuous improvements and features based on cutting-edge AI research.",
      icon: <IconHeart />,
    },
  ];
  return (
    <div className="bg-white py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 max-w-7xl mx-auto">
        {features.map((feature, index) => (
          <Feature key={feature.title} {...feature} index={index} />
        ))}
      </div>
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature border-gray-200 bg-white",
        (index === 0 || index === 4) && "lg:border-l border-gray-200",
        index < 4 && "lg:border-b border-gray-200"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-gray-50 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-gray-700">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-gray-200 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-gray-900">
          {title}
        </span>
      </div>
      <p className="text-sm text-gray-600 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};
