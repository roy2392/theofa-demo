import { ConversationContext } from '../types';

export class FollowupSystem {
  
  static generateContextualFollowup(context: ConversationContext, lastResponse: string): string | null {
    // Check if a follow-up is needed based on conversation context
    if (!this.shouldGenerateFollowup(context, lastResponse)) {
      return null;
    }
    
    return this.getFollowupByStage(context);
  }
  
  private static shouldGenerateFollowup(context: ConversationContext, lastResponse: string): boolean {
    // Don't generate follow-up if already in closing stage
    if (context.stage === 'closing') return false;
    
    // Don't generate if last response already contains a question
    if (lastResponse.includes('?')) return false;
    
    // Generate follow-up if customer info is incomplete
    if (context.stage === 'information-gathering' && !this.hasBasicInfo(context)) {
      return true;
    }
    
    // Generate follow-up for upselling opportunities
    if (context.stage === 'recommendations' && context.leadQualification === 'hot') {
      return true;
    }
    
    // Generate follow-up for emergency situations
    if (context.leadQualification === 'emergency') {
      return true;
    }
    
    return false;
  }
  
  private static hasBasicInfo(context: ConversationContext): boolean {
    const info = context.customerInfo;
    return !!(info.destination && info.travelers && (info.dates || info.urgency));
  }
  
  private static getFollowupByStage(context: ConversationContext): string {
    switch (context.stage) {
      case 'information-gathering':
        return this.getInformationGatheringFollowup(context);
      
      case 'recommendations':
        return this.getRecommendationsFollowup(context);
      
      case 'upselling':
        return this.getUpsellFollowup(context);
      
      default:
        return this.getGeneralFollowup(context);
    }
  }
  
  private static getInformationGatheringFollowup(context: ConversationContext): string {
    const info = context.customerInfo;
    
    if (!info.destination) {
      return 'איפה בדיוק אתם מתכננים לטוס? 🌍';
    }
    
    if (!info.dates) {
      return 'מתי אתם מתכננים לצאת לנסיעה? 📅';
    }
    
    if (!info.travelers) {
      return 'כמה אנשים יהיו בנסיעה? 👥';
    }
    
    if (!info.budget) {
      return 'איזה תקציב בערך יש לכם בראש? 💰';
    }
    
    if (context.scenario === 'business-travel' && !info.companySize) {
      return 'איזה סוג של חברה אתם? זה יעזור לי להציע פתרונות עסקיים מותאמים 💼';
    }
    
    return 'יש לי עוד כמה שאלות קצרות כדי למצוא לכם את האפשרות הטובה ביותר 😊';
  }
  
  private static getRecommendationsFollowup(context: ConversationContext): string {
    if (context.leadQualification === 'hot') {
      return 'מה אתם אומרים על ההצעות האלה? רוצים שאבדוק זמינות? ✨';
    }
    
    if (context.scenario === 'vacation-planning') {
      return 'איזה מההצעות הכי מעניינת אתכם? אוכל להציג עוד פרטים 🏖️';
    }
    
    if (context.scenario === 'business-travel') {
      return 'האם הפתרונות מתאימים לצרכי החברה שלכם? 💼';
    }
    
    return 'איך נשמעות לכם ההמלצות? יש משהו ספציפי שתרצו לשמוע עליו? 🤔';
  }
  
  private static getUpsellFollowup(context: ConversationContext): string {
    const upsellSuggestions = this.getUpsellSuggestions(context);
    
    if (upsellSuggestions.length > 0) {
      return `אגב, שכחתי להציע לכם ${upsellSuggestions[0]} - זה משדרג את הנסיעה מאוד! 💎`;
    }
    
    return 'יש לי עוד כמה שירותים מיוחדים שיכולים לשדרג לכם את הנסיעה 🎯';
  }
  
  private static getUpsellSuggestions(context: ConversationContext): string[] {
    const suggestions: string[] = [];
    const services = context.proposedServices;
    
    // Check what hasn't been offered yet
    if (!services.includes('insurance')) {
      suggestions.push('ביטוח נסיעות מקיף 🛡️');
    }
    
    if (!services.includes('business-class') && context.leadQualification === 'hot') {
      suggestions.push('שדרוג למחלקת עסקים במחיר מיוחד ✈️');
    }
    
    if (!services.includes('car-rental') && context.scenario !== 'emergency-support') {
      suggestions.push('השכרת רכב עם ביטוח מלא 🚗');
    }
    
    if (!services.includes('attractions') && context.scenario === 'vacation-planning') {
      suggestions.push('כרטיסי כניסה מראש לאטרקציות מובילות 🎫');
    }
    
    if (!services.includes('vip') && context.scenario === 'business-travel') {
      suggestions.push('שירותי VIP בנמל תעופה 🌟');
    }
    
    return suggestions;
  }
  
  private static getGeneralFollowup(context: ConversationContext): string {
    if (context.leadQualification === 'emergency') {
      return 'אני כאן עד שנפתור את הבעיה! מה עוד אני יכול לעזור? 🆘';
    }
    
    if (context.messageCount > 5 && !context.businessObjectives.contactCollected) {
      return 'כדי שאוכל לשלוח לכם הצעה מפורטת, תוכלו לשתף אותי במספר טלפון? 📱';
    }
    
    return 'יש לכם עוד שאלות? אני כאן לעזור! 😊';
  }
  
  static getSchedulingPrompt(context: ConversationContext): string {
    const timeOfDay = new Date().getHours();
    let greeting = 'היום';
    
    if (timeOfDay < 12) {
      greeting = 'בבוקר';
    } else if (timeOfDay < 17) {
      greeting = 'אחר הצהריים';
    } else {
      greeting = 'בערב';
    }
    
    if (context.scenario === 'emergency-support') {
      return `אני זמין עכשיו לשיחה חירום! מתי נוח לכם? אפילו ${greeting} 🆘`;
    }
    
    if (context.scenario === 'business-travel') {
      return `מתי נוח לכם לשיחת ייעוץ עסקית? אפשר גם ${greeting} או מחר בבוקר 💼`;
    }
    
    return `מתי נוח לכם לשיחה קצרה? אפשר גם ${greeting} או מתי שנוח לכם 📞`;
  }
  
  static getUrgencyBooster(context: ConversationContext): string | null {
    if (context.leadQualification === 'hot' && context.messageCount > 6) {
      return 'אגב, המחירים האלה זמינים רק השבוע - כדאי לא לחכות יותר מדי! ⏰';
    }
    
    if (context.scenario === 'emergency-support') {
      return 'בוא נפתור את זה מהר - יש לי פתרונות מיידיים! ⚡';
    }
    
    if (context.customerInfo.urgency === 'high') {
      return 'אני רואה שזה דחוף - בוא נזרז עם ההזמנה! 🏃‍♂️';
    }
    
    return null;
  }
}