import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Button } from "./ui/button";
import { Moon, Sun, Monitor, Check, ChevronDown } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = "",
  showLabel = false,
}) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { value: "light", label: "Light", icon: <Sun className="h-4 w-4" /> },
    { value: "dark", label: "Dark", icon: <Moon className="h-4 w-4" /> },
    { value: "system", label: "System", icon: <Monitor className="h-4 w-4" /> },
  ];

  const getCurrentIcon = () => {
    const current = options.find((opt) => opt.value === theme);
    return current?.icon || <Sun className="h-4 w-4" />;
  };

  const getCurrentLabel = () => {
    const current = options.find((opt) => opt.value === theme);
    return current?.label || "Light";
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 ${className}`}
      >
        {getCurrentIcon()}
        {showLabel && <span>{getCurrentLabel()}</span>}
        <ChevronDown
          className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
        {theme === "system" && (
          <span className="text-xs text-gray-400">
            ({resolvedTheme === "dark" ? "🌙" : "☀️"})
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setTheme(option.value as "light" | "dark" | "system");
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                  ${theme === option.value ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20" : "text-gray-700 dark:text-gray-300"}
                `}
              >
                {option.icon}
                <span className="flex-1 text-left">{option.label}</span>
                {theme === option.value && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
