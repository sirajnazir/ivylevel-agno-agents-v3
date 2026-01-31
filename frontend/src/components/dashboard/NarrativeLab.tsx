/**
 * NarrativeLab Dashboard Component
 * Narrative DNA refinement, archetype display, and essay angles.
 * @version 10.0
 */

'use client';

import { useState } from 'react';
import { Sparkles, Edit3, RefreshCw, Lightbulb, ChevronRight, Quote } from 'lucide-react';
import { BRAND_COLORS } from '@/lib/constants/brand';

interface NarrativeLabProps {
  narrativeDna?: string;
  archetype?: string;
  themes?: string[];
}

const DEFAULT_NARRATIVE = "A resilient innovator who transforms challenges into opportunities for growth, bringing unique perspective to every endeavor.";
const DEFAULT_ARCHETYPE = "The Resilient Pioneer";
const DEFAULT_THEMES = ['Resilience', 'Innovation', 'Community Impact', 'Intellectual Curiosity'];

const ESSAY_ANGLES = [
  { id: '1', title: 'The Constraint Advantage', description: 'How limitations sparked your creativity and resourcefulness.', prompt: 'common_app_1' },
  { id: '2', title: 'Bridge Builder', description: 'Connecting different worlds, cultures, or ideas through your unique position.', prompt: 'common_app_5' },
  { id: '3', title: 'Unexpected Teacher', description: 'A challenge that taught you something no classroom could.', prompt: 'common_app_2' },
];

export function NarrativeLab({
  narrativeDna = DEFAULT_NARRATIVE,
  archetype = DEFAULT_ARCHETYPE,
  themes = DEFAULT_THEMES
}: NarrativeLabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDna, setEditedDna] = useState(narrativeDna);
  const [isRefining, setIsRefining] = useState(false);

  const handleRefine = async () => {
    setIsRefining(true);
    // Simulate AI refinement
    await new Promise(r => setTimeout(r, 1500));
    setIsRefining(false);
  };

  const handleSave = () => {
    setIsEditing(false);
    // TODO: Save to store/API
  };

  return (
    <div className="space-y-4">
      {/* Archetype Badge */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 border border-pink-200">
          <Sparkles size={16} className="text-pink-600" />
          <span className="font-medium text-pink-700">{archetype}</span>
        </div>
      </div>

      {/* Narrative DNA */}
      <div className="relative">
        <div className="absolute -top-2 -left-1 text-pink-300">
          <Quote size={24} />
        </div>
        {isEditing ? (
          <textarea
            value={editedDna}
            onChange={(e) => setEditedDna(e.target.value)}
            className="w-full p-4 pl-6 text-gray-700 italic bg-gray-50 rounded-xl border border-gray-200 focus:border-pink-300 focus:ring-1 focus:ring-pink-200 outline-none resize-none"
            rows={3}
          />
        ) : (
          <p className="p-4 pl-6 text-gray-700 italic bg-gray-50 rounded-xl">
            {narrativeDna}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Edit3 size={14} />
          {isEditing ? 'Save' : 'Edit'}
        </button>
        <button
          onClick={handleRefine}
          disabled={isRefining}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
          style={{ backgroundColor: '#FCE7F3', color: '#BE185D' }}
        >
          <RefreshCw size={14} className={isRefining ? 'animate-spin' : ''} />
          {isRefining ? 'Refining...' : 'Refine with AI'}
        </button>
      </div>

      {/* Themes */}
      <div>
        <p className="text-xs text-gray-500 mb-2">Key Themes</p>
        <div className="flex flex-wrap gap-1.5">
          {themes.map((theme) => (
            <span
              key={theme}
              className="px-2 py-0.5 text-xs rounded-full"
              style={{ backgroundColor: '#EDE9FE', color: BRAND_COLORS.identity }}
            >
              {theme}
            </span>
          ))}
        </div>
      </div>

      {/* Essay Angles */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb size={14} className="text-amber-500" />
          <p className="text-xs text-gray-500">Essay Angle Ideas</p>
        </div>
        <div className="space-y-1.5">
          {ESSAY_ANGLES.map((angle) => (
            <button
              key={angle.id}
              className="w-full text-left p-2 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-amber-800">{angle.title}</span>
                <ChevronRight size={14} className="text-amber-400 group-hover:text-amber-600" />
              </div>
              <p className="text-xs text-amber-600 mt-0.5">{angle.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NarrativeLab;
