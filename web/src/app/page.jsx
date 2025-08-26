"use client";

import { useState } from "react";
import Map from "@/components/Map";
import GreeneryInfo from "@/components/GreeneryInfo";
import { analysisService } from "@/services/analysisService";
import {
  Cloud,
  Droplets,
  Thermometer,
  Shield,
  AlertTriangle,
  Info,
} from "lucide-react";

export default function HomePage() {
  const [selectedArea, setSelectedArea] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisType, setAnalysisType] = useState("comprehensive"); // comprehensive, heatwave, flood, pollution

  const handleAreaSelected = (area) => {
    setSelectedArea(area);
    setAnalysisResult(null); // Clear previous results
  };

  const handleAnalyze = async () => {
    if (!selectedArea) return;

    setIsAnalyzing(true);
    try {
      const result = await analysisService.analyzeClimateRisk(
        selectedArea,
        analysisType,
      );

      if (result.success) {
        setAnalysisResult(result);
      } else {
        console.error("Analysis failed:", result.error);
        // You could add error state handling here
      }
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analysisTypes = [
    {
      id: "comprehensive",
      name: "Full Climate Risk",
      icon: Shield,
      color: "bg-blue-500",
      description: "Complete risk assessment for all climate threats",
    },
    {
      id: "heatwave",
      name: "Extreme Heat",
      icon: Thermometer,
      color: "bg-red-500",
      description: "Heatwave prediction and urban heat island analysis",
    },
    {
      id: "flood",
      name: "Flood Risk",
      icon: Droplets,
      color: "bg-blue-600",
      description: "Flood prediction based on water bodies and rainfall",
    },
    {
      id: "pollution",
      name: "Air Quality",
      icon: Cloud,
      color: "bg-gray-500",
      description: "Air pollution levels and health impact assessment",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  ClimateGuard AI
                </h1>
                <p className="text-sm text-gray-500">
                  AI-powered climate risk assessment
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Info className="h-4 w-4" />
              <span>Draw an area to analyze climate risks</span>
            </div>
          </div>
        </div>
      </header>

      {/* Analysis Type Selector */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-4">
          <div className="flex items-center space-x-1 overflow-x-auto">
            {analysisTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setAnalysisType(type.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    analysisType === type.id
                      ? `${type.color} text-white`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{type.name}</span>
                </button>
              );
            })}
          </div>
          {/* Analysis Description */}
          <div className="mt-2 text-sm text-gray-600">
            {
              analysisTypes.find((type) => type.id === analysisType)
                ?.description
            }
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-8rem)]">
        {/* Map Section */}
        <div className="flex-1 relative">
          <Map
            onAreaSelected={handleAreaSelected}
            analysisResult={analysisResult}
          />

          {/* Floating Action Button */}
          {selectedArea && (
            <div className="absolute bottom-6 left-6 z-10">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className={`${
                  analysisTypes.find((type) => type.id === analysisType)
                    ?.color || "bg-blue-500"
                } hover:opacity-90 disabled:opacity-50 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 transition-all`}
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4" />
                    <span>Analyze Climate Risk</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Risk Level Indicator */}
          {analysisResult && (
            <div className="absolute top-20 right-4 z-10">
              <div
                className={`bg-white rounded-lg shadow-lg p-4 border-l-4 ${
                  analysisResult.riskLevel === "high"
                    ? "border-red-500"
                    : analysisResult.riskLevel === "medium"
                      ? "border-yellow-500"
                      : "border-green-500"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <AlertTriangle
                    className={`h-5 w-5 ${
                      analysisResult.riskLevel === "high"
                        ? "text-red-500"
                        : analysisResult.riskLevel === "medium"
                          ? "text-yellow-500"
                          : "text-green-500"
                    }`}
                  />
                  <div>
                    <div className="font-semibold text-gray-900 capitalize">
                      {analysisResult.riskLevel} Risk
                    </div>
                    <div className="text-sm text-gray-600">
                      Overall Climate Risk
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <GreeneryInfo
            selectedArea={selectedArea}
            analysisResult={analysisResult}
            isAnalyzing={isAnalyzing}
            analysisType={analysisType}
          />
        </div>
      </div>
    </div>
  );
}
