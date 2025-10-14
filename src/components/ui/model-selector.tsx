import React from "react";
import Image from "next/image";
import { models } from "@/app/models";

interface ModelSelectorProps {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ModelSelector({
  name,
  value = "",
  onChange,
  disabled = false,
  placeholder = "Select a model",
  className = "",
}: ModelSelectorProps) {
  const selectedModel = models.find((model) => model.apiName === value);

  return (
    <div className={`relative ${className}`}>
      <select
        name={name}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className="w-full appearance-none border border-gray-300 bg-white px-4 py-3 pr-12 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">{placeholder}</option>
        {models.map((model) => (
          <option key={model.apiName} value={model.apiName}>
            {model.label}
          </option>
        ))}
      </select>
      
      {/* Custom dropdown icon */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
        <svg
          className="h-4 w-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {/* Selected model icon display */}
      {selectedModel && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Image
            src={selectedModel.logo}
            alt={selectedModel.label}
            className="h-5 w-5 object-contain"
            width={20}
            height={20}
          />
        </div>
      )}
      
      {/* Adjust padding when model is selected */}
      <style jsx>{`
        select {
          padding-left: ${selectedModel ? '2.5rem' : '1rem'};
        }
      `}</style>
    </div>
  );
}

export default ModelSelector;
