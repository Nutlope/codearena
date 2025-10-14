import React, { useState } from "react";
import Image from "next/image";
import { models } from "@/app/models";

interface ModelDropdownProps {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ModelDropdown({
  name,
  value = "",
  onChange,
  disabled = false,
  placeholder = "Select a model",
  className = "",
}: ModelDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedModel = models.find((model) => model.apiName === value);

  const handleSelect = (modelApiName: string) => {
    onChange?.(modelApiName);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <input type="hidden" name={name} value={value} />
      
      {/* Dropdown button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex w-full items-center justify-between border border-gray-300 bg-white px-4 py-3 text-left text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-3">
          {selectedModel ? (
            <>
              <Image
                src={selectedModel.logo}
                alt={selectedModel.label}
                className="h-5 w-5 object-contain"
                width={20}
                height={20}
              />
              <span className="text-gray-900">{selectedModel.label}</span>
            </>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        
        <svg
          className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Dropdown menu */}
      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full border border-gray-300 bg-white shadow-lg">
          <div className="max-h-60 overflow-auto">
            <button
              type="button"
              onClick={() => handleSelect("")}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-gray-50"
            >
              <span className="text-gray-500">{placeholder}</span>
            </button>
            
            {models.map((model) => (
              <button
                key={model.apiName}
                type="button"
                onClick={() => handleSelect(model.apiName)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-gray-50"
              >
                <Image
                  src={model.logo}
                  alt={model.label}
                  className="h-5 w-5 object-contain"
                  width={20}
                  height={20}
                />
                <div className="flex flex-col">
                  <span className="text-gray-900">{model.label}</span>
                  <span className="text-xs text-gray-500">{model.organization}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export default ModelDropdown;
