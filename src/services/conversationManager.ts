import { ConversationContext } from '../types';
import { SCENARIOS } from '../config/scenarios';
import { LeadQualifier, LeadScore } from './leadQualifier';
import { FollowupSystem } from './followupSystem';
import { SessionManager } from './sessionManager';

export class ConversationManager {
  private context: ConversationContext;
  private leadScore: LeadScore | null = null;
  private messages: any[] = [];

  constructor(scenarioId: string) {
    this.context = this.initializeContext(scenarioId);
  }

  private initializeContext(scenarioId: string): ConversationContext {
    return {
      scenario: scenarioId,
      stage: 'information-gathering',
      messageCount: 0,
      customerInfo: {},
      proposedServices: [],
      leadQualification: 'cold',
      businessObjectives: {
        infoGathered: false,
        recommendationsMade: false,
        upsellPresented: false,
        contactCollected: false,
        followupScheduled: false
      }
    };
  }

  updateContext(message: string, isFromUser: boolean): void {
    // Store message for session analysis
    this.messages.push({
      content: message,
      sender: isFromUser ? 'user' : 'ai',
      timestamp: new Date()
    });

    if (isFromUser) {
      this.context.messageCount++;
      this.extractCustomerInfo(message);
      this.updateLeadQualification();
      this.updateConversationStage();
      
      // Update session with extracted vacation details (for scenario 1)
      if (this.context.scenario === 'vacation-planning') {
        const sessionDetails = SessionManager.extractVacationDetails(this.messages);
        SessionManager.updateSession(sessionDetails);
      }
      
      // Update lead scoring after user message
      this.leadScore = LeadQualifier.qualifyLead(this.context);
    }
  }

  private extractCustomerInfo(message: string): void {
    const lowerMessage = message.toLowerCase();
    
    // Extract destination
    const destinations = ['לונדון', 'פריז', 'ניו יורק', 'תל אביב', 'אילת', 'רומא', 'ברלין', 'אמסטרדם'];
    destinations.forEach(dest => {
      if (lowerMessage.includes(dest)) {
        this.context.customerInfo.destination = dest;
      }
    });

    // Extract traveler count
    const travelerMatch = message.match(/(\d+)\s*(אנשים|נוסעים|בני משפחה)/);
    if (travelerMatch) {
      this.context.customerInfo.travelers = parseInt(travelerMatch[1]);
    }

    // Extract budget indicators
    if (lowerMessage.includes('זול') || lowerMessage.includes('חסכוני')) {
      this.context.customerInfo.budget = 'low';
    } else if (lowerMessage.includes('יוקרה') || lowerMessage.includes('מפנק')) {
      this.context.customerInfo.budget = 'high';
    }

    // Extract urgency
    if (lowerMessage.includes('דחוף') || lowerMessage.includes('מיידי') || lowerMessage.includes('חירום')) {
      this.context.customerInfo.urgency = 'high';
      this.context.leadQualification = 'emergency';
    }

    // Extract contact details
    const phoneMatch = message.match(/(05\d-?\d{7}|0\d{1,2}-?\d{7})/);
    if (phoneMatch) {
      if (!this.context.customerInfo.contactDetails) {
        this.context.customerInfo.contactDetails = {};
      }
      this.context.customerInfo.contactDetails.phone = phoneMatch[0];
      this.context.businessObjectives.contactCollected = true;
    }

    const emailMatch = message.match(/\S+@\S+\.\S+/);
    if (emailMatch) {
      if (!this.context.customerInfo.contactDetails) {
        this.context.customerInfo.contactDetails = {};
      }
      this.context.customerInfo.contactDetails.email = emailMatch[0];
      this.context.businessObjectives.contactCollected = true;
    }
  }

  private updateLeadQualification(): void {
    const info = this.context.customerInfo;
    
    if (info.urgency === 'high') {
      this.context.leadQualification = 'emergency';
    } else if (info.destination && info.dates && info.travelers) {
      this.context.leadQualification = 'hot';
    } else if (info.destination || info.dates) {
      this.context.leadQualification = 'warm';
    }
  }

  private updateConversationStage(): void {
    const { messageCount, customerInfo, businessObjectives } = this.context;
    
    // Check if basic info is gathered
    if (customerInfo.destination && customerInfo.travelers && !businessObjectives.infoGathered) {
      this.context.businessObjectives.infoGathered = true;
    }

    // Progress through stages
    if (messageCount >= 3 && businessObjectives.infoGathered && this.context.stage === 'information-gathering') {
      this.context.stage = 'recommendations';
    } else if (messageCount >= 5 && businessObjectives.recommendationsMade && this.context.stage === 'recommendations') {
      this.context.stage = 'upselling';
    } else if (messageCount >= 7 && this.context.stage === 'upselling') {
      this.context.stage = 'closing';
    }
  }

  generateSystemPrompt(): string {
    const scenario = SCENARIOS.find(s => s.id === this.context.scenario);
    if (!scenario) return '';

    const basePrompt = scenario.systemPrompt;
    const stageInstructions = this.getStageInstructions();
    const contextInfo = this.getContextInfo();
    const sessionInfo = this.getSessionInfo();

    return `${basePrompt}

${sessionInfo}

הקשר הנוכחי של השיחה:
${contextInfo}

הוראות לשלב הנוכחי:
${stageInstructions}

חשוב: תמיד עונה בעברית טבעית ורהוטה. השתמש במידע שאספת על הלקוח להתאמה אישית של התגובה.`;
  }

  private getSessionInfo(): string {
    const session = SessionManager.getSession();
    
    if (!session || this.context.scenario === 'vacation-planning') {
      return '';
    }

    let sessionPrompt = '\n=== מידע על הלקוח מהמערכת ===\n';
    
    if (this.context.scenario === 'upcoming-trip-recommendations') {
      const recommendations = SessionManager.generateRecommendations(session);
      sessionPrompt += `שם הלקוח: ${session.customerName}
יעד הנסיעה: ${session.destination}
תאריכי הנסיעה: ${session.dates}
מספר נוסעים: ${session.travelers}
${session.budget ? `תקציב: ${session.budget}` : ''}

המלצות זמינות:
${recommendations.map(rec => `• ${rec}`).join('\n')}

הוראה חשובה: התנהג כאילו אתה יודע על הנסיעה מהמערכת שלך ואתה יוזם את השיחה בהתלהבות!`;
    } else if (this.context.scenario === 'vacation-concierge') {
      const activities = SessionManager.generateConciergeActivities(session);
      sessionPrompt += `שם הלקוח: ${session.customerName}
יעד נוכחי: ${session.destination} (ביום ${Math.ceil(Math.random() * 3) + 1} מתוך ${session.travelers >= 3 ? '5' : '4'} ימים)
מספר נוסעים: ${session.travelers}

פעילויות זמינות היום:
${activities.map(act => `• ${act}`).join('\n')}

הוראה חשובה: התנהג כאילו אתה עוקב אחר הלקוח בזמן אמת ויודע איפה הוא נמצא ומה הוא עשה אתמול!`;
    }

    return sessionPrompt;
  }

  private getStageInstructions(): string {
    switch (this.context.stage) {
      case 'information-gathering':
        return `אתה בשלב איסוף מידע בסיסי. התמקד בלקבל:
- יעד הנסיעה
- תאריכים מועדפים
- מספר נוסעים
- תקציב משוער
- מטרת הנסיעה

שאל שאלות ממוקדות ונעימות. אל תציע עדיין שירותים ספציפיים.`;

      case 'recommendations':
        return `אתה בשלב המלצות מקצועיות. הצג:
- חבילות נסיעה מותאמות לצרכי הלקוח
- מחירים משוערים (תמיד ציין שהמחיר הסופי יקבע לאחר בדיקה מעמיקה)
- יתרונות של כל אפשרות
- קרא למטרות העסקיות שלך: לסמן שביצעת המלצות

היה מקצועי אך חם, והדגש את הערך המוסף של קישרי תעופה.`;

      case 'upselling':
        return `אתה בשלב Upselling. הצע בעדינות:
- שדרוגי מחלקת טיסה
- מלונות יוקרה במחירי מוקדם
- השכרת רכב עם ביטוח
- ביטוח נסיעות (הדגש חשיבות!)
- כרטיסי אטרקציות מראש

הסבר את הערך של כל שירוח נוסף. אל תהיה דחוף - הצג אופציות והסבר יתרונות.`;

      case 'closing':
        return `אתה בשלב סגירת השיחה. התמקד ב:
- איסוף פרטי קשר (טלפון וטלפון)
- קביעת פגישה או שיחת ייעוץ
- הבטחה למעקב אישי
- יצירת תחושת דחיפות נעימה
- הדגשת שהמחיר והזמינות ייבדקו מחדש

זה הזמן להפוך את השיחה למכירה או לפחות לליד איכותי.`;

      default:
        return '';
    }
  }

  private getContextInfo(): string {
    const { customerInfo, leadQualification, messageCount, businessObjectives } = this.context;
    
    let info = `מספר הודעות בשיחה: ${messageCount}
סיווג הליד: ${leadQualification}`;

    if (customerInfo.destination) {
      info += `\nיעד: ${customerInfo.destination}`;
    }
    
    if (customerInfo.travelers) {
      info += `\nמספר נוסעים: ${customerInfo.travelers}`;
    }
    
    if (customerInfo.budget) {
      info += `\nתקציב משוער: ${customerInfo.budget}`;
    }
    
    if (customerInfo.urgency) {
      info += `\nדחיפות: ${customerInfo.urgency}`;
    }

    if (customerInfo.contactDetails) {
      if (customerInfo.contactDetails.phone) {
        info += `\nטלפון: ${customerInfo.contactDetails.phone}`;
      }
      if (customerInfo.contactDetails.email) {
        info += `\nאימייל: ${customerInfo.contactDetails.email}`;
      }
    }

    info += `\n\nמטרות עסקיות שהושגו:`;
    Object.entries(businessObjectives).forEach(([key, value]) => {
      const hebrewKey = this.getHebrewObjectiveKey(key);
      info += `\n- ${hebrewKey}: ${value ? '✅' : '❌'}`;
    });

    return info;
  }

  private getHebrewObjectiveKey(key: string): string {
    const translations: { [key: string]: string } = {
      'infoGathered': 'מידע נאסף',
      'recommendationsMade': 'המלצות ניתנו',
      'upsellPresented': 'שירותים נוספים הוצגו',
      'contactCollected': 'פרטי קשר נאספו',
      'followupScheduled': 'מעקב נקבע'
    };
    return translations[key] || key;
  }

  getContext(): ConversationContext {
    return { ...this.context };
  }

  shouldTriggerUpsell(): boolean {
    return this.context.stage === 'upselling' && 
           this.context.businessObjectives.recommendationsMade &&
           !this.context.businessObjectives.upsellPresented;
  }

  shouldRequestContact(): boolean {
    return this.context.stage === 'closing' && 
           !this.context.businessObjectives.contactCollected;
  }

  markObjectiveCompleted(objective: keyof typeof this.context.businessObjectives): void {
    this.context.businessObjectives[objective] = true;
  }

  getLeadScore(): LeadScore | null {
    return this.leadScore;
  }

  generateFollowupSuggestion(lastResponse: string): string | null {
    return FollowupSystem.generateContextualFollowup(this.context, lastResponse);
  }

  getSchedulingPrompt(): string {
    return FollowupSystem.getSchedulingPrompt(this.context);
  }

  getUrgencyBooster(): string | null {
    return FollowupSystem.getUrgencyBooster(this.context);
  }

  shouldEscalateToSales(): boolean {
    return this.leadScore ? LeadQualifier.shouldEscalateToSales(this.leadScore) : false;
  }

  getRecommendedTone(): 'professional' | 'friendly' | 'urgent' | 'casual' {
    return this.leadScore ? LeadQualifier.getRecommendedResponseTone(this.leadScore) : 'friendly';
  }

  // Debug method to view current context
  getContextSummary(): string {
    const summary = [
      `🎯 Scenario: ${this.context.scenario}`,
      `📊 Stage: ${this.context.stage}`,
      `💬 Messages: ${this.context.messageCount}`,
      `🏷️ Lead: ${this.context.leadQualification}`,
    ];

    if (this.leadScore) {
      summary.push(`📈 Score: ${this.leadScore.score}/100`);
      summary.push(`📋 Next: ${this.leadScore.nextActions.slice(0, 2).join(', ')}`);
    }

    return summary.join('\n');
  }
}