import OpenAI from 'openai';
import { TravelScenario } from '../types';
import { ConversationManager } from './conversationManager';
import { HebrewValidator } from './hebrewValidator';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class OpenAIService {
  private client: OpenAI;
  private conversationManager: ConversationManager | null = null;

  constructor() {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_OPENAI_API_KEY environment variable is required');
    }
    
    this.client = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true, // Note: In production, use a backend proxy
    });
  }

  initializeConversation(scenarioId: string) {
    this.conversationManager = new ConversationManager(scenarioId);
  }

  async sendMessage(messages: ChatMessage[], scenario: TravelScenario, userMessage?: string): Promise<string> {
    // Update conversation context first
    if (this.conversationManager && userMessage) {
      this.conversationManager.updateContext(userMessage, true);
    }

    // Try real LLM with retries
    const response = await this.tryLLMWithRetries(messages, scenario);
    
    // Update context for AI response
    if (this.conversationManager) {
      this.conversationManager.updateContext(response, false);
      this.checkAndMarkObjectives(response);
    }

    return response;
  }

  private async tryLLMWithRetries(messages: ChatMessage[], scenario: TravelScenario, retries = 2): Promise<string> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`🤖 Attempting LLM call (attempt ${attempt + 1}/${retries + 1})`);
        
        // Get dynamic system prompt based on conversation context
        const systemPrompt = this.conversationManager 
          ? this.conversationManager.generateSystemPrompt()
          : this.getEnhancedSystemPrompt(scenario);

        // Prepare messages with enhanced system prompt
        const enhancedMessages: ChatMessage[] = [
          { role: 'system', content: systemPrompt },
          ...messages.filter(msg => msg.role !== 'system')
        ];

        console.log('📝 System prompt:', systemPrompt.substring(0, 200) + '...');
        console.log('💬 Messages count:', enhancedMessages.length);

        const completion = await this.client.chat.completions.create({
          model: 'gpt-4', // Fallback to GPT-4 as GPT-5 might not be available
          messages: enhancedMessages,
          max_tokens: 600,
          temperature: 0.8, // Slightly higher for more creative responses
          stream: false,
        });

        let response = completion.choices[0]?.message?.content;
        
        if (!response) {
          throw new Error('Empty response from OpenAI');
        }

        console.log('✅ LLM Response received:', response.substring(0, 100) + '...');
        
        // Process and enhance the response
        return this.processLLMResponse(response);
        
      } catch (error) {
        console.error(`❌ LLM attempt ${attempt + 1} failed:`, error);
        
        if (attempt === retries) {
          console.log('🔄 All LLM attempts failed, using intelligent fallback');
          return this.getIntelligentFallback(messages, scenario);
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
    
    return this.getIntelligentFallback(messages, scenario);
  }

  private processLLMResponse(response: string): string {
    // Validate and format Hebrew response
    if (HebrewValidator.isResponseInHebrew(response)) {
      response = HebrewValidator.validateAndFormatResponse(response);
      
      // Add business emojis for engagement
      response = HebrewValidator.addBusinessEmojis(response);
      
      // Ensure call to action based on conversation stage
      if (this.conversationManager) {
        const context = this.conversationManager.getContext();
        response = HebrewValidator.ensureCallToAction(response, context.stage);
      }
    }
    
    return response;
  }

  private getIntelligentFallback(messages: ChatMessage[], scenario: TravelScenario): string {
    console.log('🧠 Generating intelligent fallback response');
    
    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage?.content?.toLowerCase() || '';
    
    // Use conversation context for better fallback
    if (this.conversationManager) {
      const context = this.conversationManager.getContext();
      return this.getContextualFallback(userMessage, context, scenario);
    }
    
    // Basic keyword-based fallback
    return this.getEmergencyFallback(scenario);
  }

  private getContextualFallback(_userMessage: string, context: any, scenario: TravelScenario): string {
    const stage = context.stage;
    const info = context.customerInfo;
    
    // Contextual responses based on conversation stage
    if (stage === 'information-gathering') {
      if (!info.destination) {
        return 'תודה על הפניה! 🌍 לאיזה יעד אתם מתכננים לטוס? אני כאן לעזור לכם לתכנן את הנסיעה המושלמת!';
      }
      if (!info.dates) {
        return `נהדר! ${info.destination} זה יעד מדהים! 📅 מתי אתם מתכננים לצאת לנסיעה?`;
      }
      if (!info.travelers) {
        return 'מעולה! 👥 כמה אנשים יהיו בנסיעה? זה יעזור לי למצוא לכם את האפשרויות הטובות ביותר.';
      }
    }
    
    if (stage === 'recommendations') {
      return `בהתבסס על מה שסיפרתם לי, יש לי כמה הצעות מעולות! 💎 האם תרצו לשמוע על האפשרויות?`;
    }
    
    if (stage === 'upselling') {
      return 'אני רוצה לוודא שתהנו מהנסיעה המושלמת! 🌟 יש כמה שירותים נוספים שיכולים לשדרג לכם את החוויה.';
    }
    
    if (stage === 'closing') {
      return 'מעולה! 📞 בואו נסכם את הפרטים. איך הכי נוח לכם שאצור איתכם קשר להמשך הטיפול?';
    }
    
    return this.getScenarioFallback(scenario);
  }
  
  private getScenarioFallback(scenario: TravelScenario): string {
    switch (scenario) {
      case 'vacation-planning':
        return 'אני כאן לעזור לכם לתכנן חופשה בלתי נשכחת! 🏖️ ספרו לי על החלום שלכם ואני אהפוך אותו למציאות.';
      case 'upcoming-trip-recommendations':
        return 'היי דוד! 🌟 ראיתי את הנסיעה הקרובה שלך לפראג - יש לי כמה הצעות מיוחדות שחשבתי שיעניינו אותך!';
      case 'vacation-concierge':
        return 'בוקר טוב רונה! ☀️ איך החופשה באמסטרדם? יש לי כמה פעילויות מדהימות להציע לכם להיום!';
      default:
        return 'שלום! 👋 אני עוזר הנסיעות החכם של קישרי תעופה. איך אוכל לעזור לכם היום?';
    }
  }

  private checkAndMarkObjectives(response: string): void {
    if (!this.conversationManager) return;

    const lowerResponse = response.toLowerCase();
    
    // Check if recommendations were made
    if (lowerResponse.includes('ממליץ') || lowerResponse.includes('הצעה') || lowerResponse.includes('מחיר')) {
      this.conversationManager.markObjectiveCompleted('recommendationsMade');
    }

    // Check if upselling was presented
    if (lowerResponse.includes('ביטוח') || lowerResponse.includes('שדרוג') || lowerResponse.includes('יוקרה')) {
      this.conversationManager.markObjectiveCompleted('upsellPresented');
    }

    // Check if follow-up was mentioned
    if (lowerResponse.includes('פגישה') || lowerResponse.includes('שיחה') || lowerResponse.includes('מעקב')) {
      this.conversationManager.markObjectiveCompleted('followupScheduled');
    }
  }

  private getEnhancedSystemPrompt(scenario: TravelScenario): string {
    const basePrompt = `אתה נציג מקצועי של קישרי תעופה - סוכנות הנסיעות המובילה בישראל עם 25+ שנות ניסיון.

כללים חשובים:
- תמיד עונה בעברית טבעית ורהוטה
- היה חם, ידידותי ומקצועי
- השתמש באימוג'ים בצורה טבעית
- הדגש את הערך והחיסכון של קישרי תעופה
- תמיד סיים עם שאלה או הצעה לפעולה

`;
    
    switch (scenario) {
      case 'vacation-planning':
        return basePrompt + `התמחותך: תכנון חופשות משפחתיות ורומנטיות

מטרות עסקיות:
- לזהות צרכי לקוח ולהציע חבילות מותאמות
- להציע שירותים נוספים (ביטוח, השכרת רכב, אטרקציות)
- לאסוף פרטי קשר ולהפנות למומחי המכירות

נושאי Upselling:
- שדרוג מחלקת טיסה
- מלונות יוקרה במחירי early bird
- השכרת רכב עם ביטוח מלא
- ביטוח נסיעות מקיף (הדגש חשיבות!)
- כרטיסי אטרקציות מראש`;
        
      case 'upcoming-trip-recommendations':
        return basePrompt + `התמחותך: המלצות יזומות ומותאמות אישית ללקוחות עם נסיעות קרובות

מטרות עסקיות:
- לזהות הזדמנויות upsell מנתוני לקוח קיימים
- להציע שירותים מותאמים לנסיעה הספציפית
- לחזק קשר עם הלקוח ולהגביר נאמנות
- להמיר הצעות לרכישות נוספות

שירותים מומלצים:
- כרטיסי אטרקציות במחיר מוזל
- השכרת רכב יוקרתית
- סיורים VIP מודרכים
- ארוחות במסעדות מובחרות
- ביטוח נסיעות מורחב`;
        
      case 'vacation-concierge':
        return basePrompt + `התמחותך: קונסיירז' דיגיטלי חכם ללקוחות במהלך החופשה

מטרות עסקיות:
- לעקוב אחר לקוחות ולהציע המלצות בזמן אמת
- למכור פעילויות ושירותים במהלך החופשה
- לחזק חווית הלקוח ולבנות נאמנות
- לאסוף מידע על העדפות לעתיד

שירותי קונסיירז':
- השכרת אופניים ורכבים
- שיטים וטיולים מודרכים
- כרטיסי מוזיאונים ואטרקציות
- סדנאות וחוויות אותנטיות
- המלצות מסעדות וחיי לילה`;
        
      default:
        return basePrompt + 'עזור ללקוח עם כל צרכי הנסיעה בצורה מקצועית וחמה.';
    }
  }

  getConversationContext() {
    return this.conversationManager?.getContext() || null;
  }

  // Emergency fallback - only used as absolute last resort
  private getEmergencyFallback(_scenario: TravelScenario): string {
    console.log('🚨 Using emergency fallback response - LLM completely failed');
    return 'מתנצל על התקלה הטכנית! 🛠️ אנא נסה שוב או צור קשר עם הצוות שלנו ב-03-123-4567 לשירות מיידי. אנחנו כאן לעזור לך 24/7! 💪';
  }
}

export const openAiService = new OpenAIService();