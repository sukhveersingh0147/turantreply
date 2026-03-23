"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Zap, 
  Hand, 
  Eye, 
  Save,
  Clock,
  Repeat,
  ShieldCheck
} from 'lucide-react';
import { updateAISettings } from '@/app/actions/ai-engine';
import { toast } from 'sonner';

interface AIControlCenterProps {
  initialSettings: {
    aiActionMode: string;
    followUpInterval: number;
    maxFollowUps: number;
    aiPersonalization: boolean;
  };
}

export default function AIControlCenter({ initialSettings }: AIControlCenterProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const res = await updateAISettings(settings);
    if (res.success) {
      toast.success("AI Engine settings updated!");
    } else {
      toast.error("Failed to update settings");
    }
    setSaving(false);
  };

  const modes = [
    { 
      id: 'AUTO', 
      label: 'Auto', 
      icon: <Zap className="w-4 h-4" />, 
      desc: 'AI sends messages independently.',
      color: 'blue'
    },
    { 
      id: 'SUGGEST', 
      label: 'Suggest', 
      icon: <Eye className="w-4 h-4" />, 
      desc: 'AI suggests, you approve.',
      color: 'purple'
    },
    { 
      id: 'MANUAL', 
      label: 'Manual', 
      icon: <Hand className="w-4 h-4" />, 
      desc: 'AI only logs insights.',
      color: 'gray'
    }
  ];

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-gray-100 p-6 rounded-3xl shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Settings className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">AI Control Center</h2>
            <p className="text-xs text-gray-500">Configure your follow-up engine</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all disabled:opacity-50"
        >
          {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </div>

      <div className="space-y-6">
        {/* Automation Mode */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-3 block">Automation Mode</label>
          <div className="grid grid-cols-3 gap-3">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSettings({ ...settings, aiActionMode: mode.id })}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all text-center ${
                  settings.aiActionMode === mode.id 
                    ? `border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/10` 
                    : `border-gray-100 hover:border-gray-200 bg-gray-50/30`
                }`}
              >
                <div className={`p-2 rounded-lg ${settings.aiActionMode === mode.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                  {mode.icon}
                </div>
                <div className="text-xs font-bold text-gray-800">{mode.label}</div>
                <div className="text-[10px] text-gray-500 leading-tight">{mode.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Intervals & Max Follow ups */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              Interval (Hours)
            </label>
            <input 
              type="number" 
              value={settings.followUpInterval}
              onChange={(e) => setSettings({ ...settings, followUpInterval: parseInt(e.target.value) })}
              className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Repeat className="w-4 h-4 text-gray-400" />
              Max Follow-ups
            </label>
            <input 
              type="number" 
              value={settings.maxFollowUps}
              onChange={(e) => setSettings({ ...settings, maxFollowUps: parseInt(e.target.value) })}
              className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-800">AI Personalization</div>
              <p className="text-[10px] text-gray-500 italic">Mention customer name and past context</p>
            </div>
          </div>
          <button 
            onClick={() => setSettings({ ...settings, aiPersonalization: !settings.aiPersonalization })}
            className={`w-10 h-6 rounded-full transition-colors relative ${settings.aiPersonalization ? 'bg-emerald-500' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.aiPersonalization ? 'right-1' : 'left-1'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
