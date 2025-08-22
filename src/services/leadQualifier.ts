import { ConversationContext } from '../types';

export type LeadScore = {
  score: number; // 0-100
  qualification: 'cold' | 'warm' | 'hot' | 'emergency';
  reasons: string[];
  nextActions: string[];
};

export class LeadQualifier {
  
  static qualifyLead(context: ConversationContext): LeadScore {
    let score = 0;
    const reasons: string[] = [];
    const nextActions: string[] = [];
    
    // Emergency qualification - highest priority
    if (context.customerInfo.urgency === 'high' || 
        context.scenario === 'emergency-support') {
      return {
        score: 100,
        qualification: 'emergency',
        reasons: ['מצב חירום דורש טיפול מיידי'],
        nextActions: [
          'פתרון מיידי לבעיה',
          'איסוף פרטי קשר חירום',
          'מעקב תוך 30 דקות'
        ]
      };
    }
    
    // Basic information scoring
    score += this.scoreBasicInfo(context, reasons);
    
    // Engagement scoring
    score += this.scoreEngagement(context, reasons);
    
    // Budget and timeline scoring
    score += this.scoreBudgetAndTimeline(context, reasons);
    
    // Business context scoring
    score += this.scoreBusinessContext(context, reasons);
    
    // Authority and decision making
    score += this.scoreAuthority(context, reasons);
    
    // Determine qualification and next actions
    const qualification = this.getQualificationFromScore(score);
    this.addNextActions(qualification, context, nextActions);
    
    return {
      score: Math.min(score, 100),
      qualification,
      reasons,
      nextActions
    };
  }
  
  private static scoreBasicInfo(context: ConversationContext, reasons: string[]): number {
    const info = context.customerInfo;
    let points = 0;
    
    if (info.destination) {
      points += 15;
      reasons.push('יעד נסיעה מוגדר');
    }
    
    if (info.dates) {
      points += 15;
      reasons.push('תאריכי נסיעה ברורים');
    }
    
    if (info.travelers) {
      points += 10;
      reasons.push('מספר נוסעים ידוע');
    }
    
    if (info.budget) {
      points += 10;
      if (info.budget === 'high') {
        points += 10;
        reasons.push('תקציב גבוה - פוטנציאל רווח גבוה');
      } else {
        reasons.push('תקציב מוגדר');
      }
    }
    
    return points;
  }
  
  private static scoreEngagement(context: ConversationContext, reasons: string[]): number {
    let points = 0;
    
    // Message count indicates engagement
    if (context.messageCount >= 5) {
      points += 10;
      reasons.push('מעורבות גבוהה בשיחה');
    }
    
    if (context.messageCount >= 8) {
      points += 5;
      reasons.push('שיחה מעמיקה ומתמשכת');
    }
    
    // Business objectives achieved
    const achieved = Object.values(context.businessObjectives).filter(Boolean).length;
    points += achieved * 5;
    
    if (achieved >= 3) {
      reasons.push('מעקב טוב אחר יעדים עסקיים');
    }
    
    return points;
  }
  
  private static scoreBudgetAndTimeline(context: ConversationContext, reasons: string[]): number {
    const info = context.customerInfo;
    let points = 0;
    
    // High budget or luxury indicators
    if (info.budget === 'high') {
      points += 15;
      reasons.push('תקציב גבוה מעיד על כוח קנייה');
    }
    
    // Urgency indicates readiness to buy
    if (info.urgency === 'medium') {
      points += 5;
      reasons.push('דחיפות בינונית');
    } else if (info.urgency === 'high') {
      points += 15;
      reasons.push('דחיפות גבוהה - מוכן לקנות מהר');
    }
    
    // Specific dates show commitment
    if (info.dates && info.dates.match(/\d{1,2}\/\d{1,2}/)) {
      points += 10;
      reasons.push('תאריכים ספציפיים - מחויבות גבוהה');
    }
    
    return points;
  }
  
  private static scoreBusinessContext(context: ConversationContext, reasons: string[]): number {
    let points = 0;
    
    if (context.scenario === 'business-travel') {
      // Business travel typically has higher value
      points += 5;
      reasons.push('נסיעות עסקיות - ערך לקוח גבוה');
      
      if (context.customerInfo.companySize === 'large') {
        points += 15;
        reasons.push('חברה גדולה - פוטנציאל לחשבון עסקי');
      } else if (context.customerInfo.companySize === 'medium') {
        points += 10;
        reasons.push('חברה בינונית - פוטנציאל עסקי טוב');
      }
    }
    
    if (context.scenario === 'vacation-planning') {
      // Family vacations can be high value
      if (context.customerInfo.travelers && context.customerInfo.travelers >= 4) {
        points += 10;
        reasons.push('נסיעה משפחתית גדולה - ערך גבוה');
      }
    }
    
    return points;
  }
  
  private static scoreAuthority(context: ConversationContext, reasons: string[]): number {
    let points = 0;
    
    // Contact details provided indicates serious intent
    if (context.customerInfo.contactDetails?.phone) {
      points += 10;
      reasons.push('מספר טלפון ניתן - רצינות גבוהה');
    }
    
    if (context.customerInfo.contactDetails?.email) {
      points += 8;
      reasons.push('כתובת אימייל ניתנה');
    }
    
    if (context.customerInfo.contactDetails?.name) {
      points += 5;
      reasons.push('שם מלא ניתן - אמינות');
    }
    
    // Asking about specific services shows buying intent
    if (context.proposedServices.length > 0) {
      points += 5;
      reasons.push('עניין בשירותים נוספים');
    }
    
    return points;
  }
  
  private static getQualificationFromScore(score: number): 'cold' | 'warm' | 'hot' | 'emergency' {
    if (score >= 70) return 'hot';
    if (score >= 40) return 'warm';
    return 'cold';
  }
  
  private static addNextActions(
    qualification: 'cold' | 'warm' | 'hot' | 'emergency',
    context: ConversationContext,
    nextActions: string[]
  ): void {
    switch (qualification) {
      case 'hot':
        nextActions.push('הצגת הצעה מפורטת מיד');
        nextActions.push('איסוף פרטי קשר לחתימה');
        nextActions.push('יצירת דחיפות עדינה');
        nextActions.push('הצעת שירותים פרימיום');
        break;
        
      case 'warm':
        nextActions.push('המשך איסוף מידע');
        nextActions.push('בניית אמון ויחסים');
        nextActions.push('הצגת המלצות ראשונות');
        nextActions.push('בדיקת תקציב מעמיק יותר');
        break;
        
      case 'cold':
        nextActions.push('חיזוק עניין בנושא');
        nextActions.push('איסוף מידע בסיסי נוסף');
        nextActions.push('הצגת ערך ויתרונות');
        nextActions.push('בניית מודעות לבעיות');
        break;
        
      case 'emergency':
        nextActions.push('פתרון מיידי');
        nextActions.push('מעקב הדוק');
        nextActions.push('שירות 24/7');
        break;
    }
    
    // Add scenario-specific actions
    if (context.scenario === 'business-travel' && qualification !== 'cold') {
      nextActions.push('הפניה למחלקת עסקים');
      nextActions.push('הצעת חשבון עסקי');
    }
    
    if (!context.businessObjectives.contactCollected && qualification !== 'cold') {
      nextActions.push('איסוף פרטי קשר בעדיפות');
    }
  }
  
  static getQualificationMessage(leadScore: LeadScore): string {
    const { qualification, score } = leadScore;
    
    switch (qualification) {
      case 'hot':
        return `🔥 ליד חם (${score} נקודות) - מוכן למכירה!`;
      case 'warm':
        return `🌡️ ליד חם (${score} נקודות) - צריך טיפוח`;
      case 'cold':
        return `❄️ ליד קר (${score} נקודות) - צריך חימום`;
      case 'emergency':
        return `🆘 חירום (${score} נקודות) - טיפול מיידי!`;
      default:
        return `📊 ליד (${score} נקודות)`;
    }
  }
  
  static shouldEscalateToSales(leadScore: LeadScore): boolean {
    return leadScore.qualification === 'hot' || 
           leadScore.qualification === 'emergency' ||
           (leadScore.qualification === 'warm' && leadScore.score >= 50);
  }
  
  static getRecommendedResponseTone(leadScore: LeadScore): 'professional' | 'friendly' | 'urgent' | 'casual' {
    switch (leadScore.qualification) {
      case 'hot':
        return 'professional';
      case 'warm':
        return 'friendly';
      case 'emergency':
        return 'urgent';
      default:
        return 'casual';
    }
  }
}