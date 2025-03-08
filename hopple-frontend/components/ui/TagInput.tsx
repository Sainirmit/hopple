"use client";

import React, { useState, KeyboardEvent } from "react";
import { XCircleIcon } from "@heroicons/react/24/outline";

interface TagInputProps {
  id?: string;
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagInput({
  id,
  tags,
  setTags,
  placeholder = "Add a tag...",
  className = "",
}: TagInputProps) {
  const [input, setInput] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim() !== "") {
      e.preventDefault();
      if (!tags.includes(input.trim())) {
        setTags([...tags, input.trim()]);
      }
      setInput("");
    }
  };

  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="w-full">
      <div className="form-input flex flex-wrap gap-2 p-1">
        {tags.map((tag, index) => (
          <div
            key={index}
            className="inline-flex items-center py-1 px-2 rounded bg-violet-100 text-violet-800 dark:bg-violet-800 dark:text-violet-100"
          >
            <span className="text-sm">{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-1 text-violet-600 dark:text-violet-300 hover:text-violet-800 dark:hover:text-violet-100"
            >
              <XCircleIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
        <input
          id={id}
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-grow min-w-[120px] bg-transparent border-0 p-1 focus:ring-0 dark:text-white text-slate-900"
        />
      </div>
    </div>
  );
}
