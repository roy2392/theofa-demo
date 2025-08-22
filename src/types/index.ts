export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isTyping?: boolean;
  context?: ConversationContext;
}

export interface ChatSession {
  id: string;
  scenario: TravelScenario;
  messages: Message[];
  context: ConversationContext;
  createdAt: Date;
  updatedAt: Date;
}

export type TravelScenario = 
  | 'vacation-planning'
  | 'upcoming-trip-recommendations'
  | 'vacation-concierge';

export interface ScenarioConfig {
  id: TravelScenario;
  title: string;
  description: string;
  icon: string;
  initialMessage: string;
  systemPrompt: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  language: 'he' | 'en';
  currency: 'ILS' | 'USD' | 'EUR';
  theme: 'light' | 'dark';
}

// Business conversation context
export interface ConversationContext {
  scenario: string;
  stage: 'information-gathering' | 'recommendations' | 'upselling' | 'closing';
  messageCount: number;
  customerInfo: {
    destination?: string;
    dates?: string;
    travelers?: number;
    budget?: string;
    purpose?: string;
    companySize?: string;
    urgency?: 'low' | 'medium' | 'high';
    contactDetails?: {
      phone?: string;
      email?: string;
      name?: string;
    };
  };
  proposedServices: string[];
  leadQualification: 'cold' | 'warm' | 'hot' | 'emergency';
  businessObjectives: {
    infoGathered: boolean;
    recommendationsMade: boolean;
    upsellPresented: boolean;
    contactCollected: boolean;
    followupScheduled: boolean;
  };
}