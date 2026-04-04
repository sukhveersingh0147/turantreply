import { VERTICALS, VerticalType } from "@/lib/verticals";
import { 
  Flame, 
  MessageSquare, 
  Zap,
  Target,
  ShoppingCart,
  CheckCircle2
} from 'lucide-react';
import React from 'react';

export function useVerticalSetup(businessType: string = 'OTHER') {
  const type = (businessType?.toUpperCase() as VerticalType) || 'OTHER';
  const template = VERTICALS[type] || VERTICALS.OTHER;
  
  const verticalLabel = template.name;
  const verticalEmoji = getVerticalEmoji(type);

  const overviewKPIs = [
    {
      key: "revenue",
      label: template.kpiLabels.revenue,
      icon: <ShoppingCart className="w-4 h-4" />,
      description: "Total revenue generated through AI interactions",
    },
    {
        key: "leads",
        label: template.kpiLabels.leads,
        icon: <Flame className="w-4 h-4 text-orange-500" />,
        description: "High intent leads captured by AI",
    },
    {
        key: "pending",
        label: template.kpiLabels.pending,
        icon: <MessageSquare className="w-4 h-4 text-blue-500" />,
        description: "Messages that need your attention",
    },
    {
        key: "followups",
        label: template.kpiLabels.followups,
        icon: <Zap className="w-4 h-4 text-yellow-500" />,
        description: "Automated follow-up messages sent",
    },
    {
        key: "conversations_today",
        label: template.kpiLabels.conversions,
        icon: <CheckCircle2 className="w-4 h-4 text-[#25D366]" />,
        description: "Successful customer conversions today",
    }
  ];

  return {
    verticalLabel,
    verticalEmoji,
    overviewKPIs,
    template
  };
}

function getVerticalEmoji(type: VerticalType): string {
    switch (type) {
        case 'SALON': return '💇';
        case 'GYM': return '🏋️';
        case 'COACHING': return '🎓';
        case 'REAL_ESTATE': return '🏠';
        case 'RESTAURANT': return '🍽️';
        default: return '⚡';
    }
}
