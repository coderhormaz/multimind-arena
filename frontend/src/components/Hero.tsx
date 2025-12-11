"use client";

import { useEffect } from "react";
import Link from "next/link";
import { renderCanvas } from "@/components/ui/canvas";
import { Shapes, ArrowRight, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Hero() {
  useEffect(() => {
    renderCanvas();
  }, []);

  return (
    <section id="home" className="relative flex h-screen items-center justify-center overflow-hidden bg-white">
      <canvas
        className="pointer-events-none absolute inset-0 z-0"
        id="canvas"
      ></canvas>
      
      <div className="relative z-10 flex flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 animate-fadeIn">
          <div className="relative inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-3 py-1.5 text-xs backdrop-blur-sm shadow-sm">
            <Shapes className="h-3.5 w-3.5 text-gray-600" /> 
            <span className="text-gray-600">Introducing MultiMind Arena.</span>
            <Link
              href="/chat"
              className="ml-1 flex items-center font-semibold text-gray-900 transition-colors hover:text-gray-600"
            >
              Explore
              <ArrowRight className="ml-0.5 h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="animate-fadeIn">
          <div className="relative mx-auto max-w-5xl px-4">
            <div className="relative border border-gray-200 px-6 py-8 md:px-12 md:py-12">
              <Plus
                strokeWidth={2}
                className="absolute -left-2.5 -top-2.5 h-5 w-5 text-gray-400"
              />
              <Plus
                strokeWidth={2}
                className="absolute -bottom-2.5 -left-2.5 h-5 w-5 text-gray-400"
              />
              <Plus
                strokeWidth={2}
                className="absolute -right-2.5 -top-2.5 h-5 w-5 text-gray-400"
              />
              <Plus
                strokeWidth={2}
                className="absolute -bottom-2.5 -right-2.5 h-5 w-5 text-gray-400"
              />
              
              <h1 className="mb-3 text-4xl font-bold leading-tight text-gray-900 md:text-5xl lg:text-6xl">
                Your complete platform for AI-powered analysis.
              </h1>
              
              <div className="flex items-center justify-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                </span>
                <p className="text-xs text-green-600">Available Now</p>
              </div>
            </div>
          </div>

          <h2 className="mt-6 text-lg text-gray-700 md:text-xl">
            Welcome to the future of AI debate and analysis!
          </h2>

          <p className="mx-auto mt-3 max-w-2xl px-6 text-sm text-gray-600 md:text-base">
            Harness the power of multiple AI agents working together to analyze,
            debate, and synthesize insights like never before.
          </p>
          
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/chat">
              <Button 
                variant="default" 
                size="lg"
                className="bg-gray-900 text-white hover:bg-gray-800"
              >
                Start Project
              </Button>
            </Link>
            <Link href="/chat">
              <Button 
                variant="outline" 
                size="lg"
                className="border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
