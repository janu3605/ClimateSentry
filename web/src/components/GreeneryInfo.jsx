"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Leaf,
  MapPin,
  Calendar,
  TrendingUp,
  Info,
  Thermometer,
  Droplets,
  Wind,
  Shield,
  AlertTriangle,
  Heart,
  Home,
  Phone,
  Clock,
  Cloud,
  Zap,
} from "lucide-react";

export default function ClimateRiskInfo({
  selectedArea,
  analysisResult,
  isAnalyzing,
  analysisType,
}) {
  const [showHistorical, setShowHistorical] = useState(false);

  const formatArea = (area) => {
    if (area < 1000) {
      return `${Math.round(area)} m²`;
    } else if (area < 1000000) {
      return `${(area / 1000).toFixed(1)} km²`;
    } else {
      return `${(area / 1000000).toFixed(2)} km²`;
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getAnalysisTypeConfig = () => {
    const configs = {
      comprehensive: { icon: Shield, title: "Complete Climate Risk Analysis" },
      heatwave: { icon: Thermometer, title: "Extreme Heat Risk Assessment" },
      flood: { icon: Droplets, title: "Flood Risk Analysis" },
      pollution: { icon: Cloud, title: "Air Quality Assessment" },
    };
    return configs[analysisType] || configs.comprehensive;
  };

  const config = getAnalysisTypeConfig();
  const Icon = config.icon;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500 p-2 rounded-lg">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">
              Climate Risk Analysis
            </h2>
            <p className="text-sm text-gray-500">{config.title}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!selectedArea ? (
          <div className="p-6 text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Select an Area to Analyze
            </h3>
            <p className="text-gray-600">
              Use the drawing tools to select a region and get comprehensive
              climate risk assessment including:
            </p>
            <ul className="mt-4 text-sm text-gray-600 space-y-2">
              <li className="flex items-center space-x-2">
                <Thermometer className="h-4 w-4 text-red-500" />
                <span>Extreme heat and heatwave risk</span>
              </li>
              <li className="flex items-center space-x-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span>Flood risk from nearby water bodies</span>
              </li>
              <li className="flex items-center space-x-2">
                <Cloud className="h-4 w-4 text-gray-500" />
                <span>Air pollution levels and health impact</span>
              </li>
              <li className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Emergency services and safe zones</span>
              </li>
            </ul>
          </div>
        ) : isAnalyzing ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Analyzing Climate Risks...
            </h3>
            <p className="text-gray-600">
              Processing weather data, satellite imagery, and local
              environmental factors
            </p>
          </div>
        ) : analysisResult ? (
          <div className="space-y-6">
            {/* Overall Risk Summary */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Risk Summary
                </h3>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(analysisResult.riskLevel)}`}
                >
                  {analysisResult.riskLevel?.toUpperCase()} RISK
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Area analyzed:</span>
                  <span className="font-medium">
                    {formatArea(selectedArea.area)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Risk Score:</span>
                  <span className="font-medium">
                    {analysisResult.riskScore || "N/A"}/10
                  </span>
                </div>
              </div>
            </div>

            {/* Climate Threats */}
            {analysisResult.threats && (
              <div className="p-4 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Climate Threats
                </h4>
                <div className="space-y-3">
                  {analysisResult.threats.heatwave && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Thermometer className="h-4 w-4 text-red-500" />
                        <span className="font-medium text-red-800">
                          Extreme Heat Risk
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs ${getRiskColor(analysisResult.threats.heatwave.level)}`}
                        >
                          {analysisResult.threats.heatwave.level?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-red-700">
                        {analysisResult.threats.heatwave.description}
                      </p>
                      <div className="mt-2 text-xs text-red-600">
                        Expected temp: {analysisResult.threats.heatwave.maxTemp}
                        °C
                      </div>
                    </div>
                  )}

                  {analysisResult.threats.flood && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-blue-800">
                          Flood Risk
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs ${getRiskColor(analysisResult.threats.flood.level)}`}
                        >
                          {analysisResult.threats.flood.level?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-blue-700">
                        {analysisResult.threats.flood.description}
                      </p>
                      <div className="mt-2 text-xs text-blue-600">
                        Water bodies within:{" "}
                        {analysisResult.threats.flood.distance}
                      </div>
                    </div>
                  )}

                  {analysisResult.threats.pollution && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Cloud className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-800">
                          Air Quality Risk
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs ${getRiskColor(analysisResult.threats.pollution.level)}`}
                        >
                          {analysisResult.threats.pollution.level?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        {analysisResult.threats.pollution.description}
                      </p>
                      <div className="mt-2 text-xs text-gray-600">
                        AQI: {analysisResult.threats.pollution.aqi} -{" "}
                        {analysisResult.threats.pollution.category}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Emergency Services */}
            {analysisResult.emergencyServices && (
              <div className="p-4 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Emergency Resources
                </h4>
                <div className="space-y-3">
                  {analysisResult.emergencyServices.map((service, index) => (
                    <div
                      key={index}
                      className="bg-green-50 border border-green-200 rounded-lg p-3"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <Heart className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-green-800">
                          {service.name}
                        </span>
                        <span className="text-xs text-green-600">
                          {service.distance}
                        </span>
                      </div>
                      <p className="text-sm text-green-700">{service.type}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-green-600">
                        <span className="flex items-center space-x-1">
                          <Phone className="h-3 w-3" />
                          <span>{service.phone}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{service.hours}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Safe Areas */}
            {analysisResult.safeAreas && (
              <div className="p-4 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Nearby Safe Areas
                </h4>
                <div className="space-y-3">
                  {analysisResult.safeAreas.map((area, index) => (
                    <div
                      key={index}
                      className="bg-blue-50 border border-blue-200 rounded-lg p-3"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <Home className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-blue-800">
                          {area.name}
                        </span>
                        <span className="text-xs text-blue-600">
                          {area.distance}
                        </span>
                      </div>
                      <p className="text-sm text-blue-700">{area.type}</p>
                      <div className="text-xs text-blue-600 mt-1">
                        Capacity: {area.capacity} people
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weather Data */}
            {analysisResult.weather && (
              <div className="p-4 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Current Conditions
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Thermometer className="h-6 w-6 text-red-500 mx-auto mb-2" />
                    <div className="text-lg font-semibold">
                      {analysisResult.weather.temperature}°C
                    </div>
                    <div className="text-xs text-gray-600">Temperature</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Droplets className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                    <div className="text-lg font-semibold">
                      {analysisResult.weather.humidity}%
                    </div>
                    <div className="text-xs text-gray-600">Humidity</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Wind className="h-6 w-6 text-gray-500 mx-auto mb-2" />
                    <div className="text-lg font-semibold">
                      {analysisResult.weather.windSpeed} km/h
                    </div>
                    <div className="text-xs text-gray-600">Wind Speed</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Cloud className="h-6 w-6 text-gray-500 mx-auto mb-2" />
                    <div className="text-lg font-semibold">
                      {analysisResult.weather.aqi}
                    </div>
                    <div className="text-xs text-gray-600">Air Quality</div>
                  </div>
                </div>
              </div>
            )}

            {/* News & Alerts */}
            {analysisResult.alerts && (
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Local Alerts & News
                </h4>
                <div className="space-y-3">
                  {analysisResult.alerts.map((alert, index) => (
                    <div
                      key={index}
                      className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium text-yellow-800">
                          {alert.title}
                        </span>
                        <span className="text-xs text-yellow-600">
                          {alert.time}
                        </span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        {alert.description}
                      </p>
                      {alert.source && (
                        <div className="text-xs text-yellow-600 mt-1">
                          Source: {alert.source}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ready to Analyze
            </h3>
            <p className="text-gray-600">
              Click "Analyze Climate Risk" to assess the selected area for
              climate threats and safety resources.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
