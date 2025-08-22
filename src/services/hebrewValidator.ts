export class HebrewValidator {
  
  static validateAndFormatResponse(response: string): string {
    let formatted = response;
    
    // Ensure Hebrew punctuation
    formatted = this.fixHebrewPunctuation(formatted);
    
    // Ensure proper greeting patterns
    formatted = this.ensureHebrewGreeting(formatted);
    
    // Fix common Hebrew spelling/grammar issues
    formatted = this.fixCommonErrors(formatted);
    
    // Ensure business language is professional yet warm
    formatted = this.enhanceBusinessLanguage(formatted);
    
    return formatted.trim();
  }
  
  private static fixHebrewPunctuation(text: string): string {
    // Fix question marks to come after Hebrew text, not before
    text = text.replace(/\?(\s*[\u0590-\u05FF]+)/g, '$1?');
    
    // Fix exclamation marks
    text = text.replace(/!(\s*[\u0590-\u05FF]+)/g, '$1!');
    
    // Ensure proper spacing around punctuation
    text = text.replace(/([.!?])([^\s])/g, '$1 $2');
    
    return text;
  }
  
  private static ensureHebrewGreeting(text: string): string {
    // Check if response starts with a greeting, if not add one
    const hasGreeting = /^(שלום|היי|אהלן|בוקר טוב|ערב טוב|מה שלומך)/.test(text.trim());
    
    if (!hasGreeting && text.length > 50) {
      // For longer responses without greeting, add contextual opening
      if (text.includes('ביטוח') || text.includes('שדרוג')) {
        text = 'נהדר! ' + text;
      } else if (text.includes('מחיר') || text.includes('הצעה')) {
        text = 'מעולה, ' + text;
      } else {
        text = 'בטח! ' + text;
      }
    }
    
    return text;
  }
  
  private static fixCommonErrors(text: string): string {
    // Fix common Hebrew AI mistakes
    const corrections: [RegExp, string][] = [
      // Fix gender agreement issues
      [/אני יכול לעזור לך/g, 'אני יכול לעזור לכם'],
      [/האם אתה מעוניין/g, 'האם אתם מעוניינים'],
      
      // Fix formal vs informal mixups
      [/את צריכה/g, 'אתם צריכים'],
      [/אתה רוצה/g, 'אתם רוצים'],
      
      // Fix business terminology
      [/המחיר הוא/g, 'המחיר המשוער הוא'],
      [/זה עולה/g, 'זה עולה בערך'],
      [/התקציב שלך/g, 'התקציב שלכם'],
    ];
    
    corrections.forEach(([pattern, replacement]) => {
      text = text.replace(pattern, replacement);
    });
    
    return text;
  }
  
  private static enhanceBusinessLanguage(text: string): string {
    // Add professional yet warm business language
    
    // Add value propositions where appropriate
    if (text.includes('ביטוח') && !text.includes('חשוב')) {
      text = text.replace(/ביטוח נסיעות/, 'ביטוח נסיעות (חשוב מאוד!)');
    }
    
    // Add credibility markers
    if (text.includes('מחיר') && !text.includes('קישרי תעופה')) {
      text = text.replace(/מחיר/, 'מחיר מיוחד של קישרי תעופה');
    }
    
    // Add urgency where appropriate
    if (text.includes('הצעה') && !text.includes('מוגבל')) {
      text = text.replace(/הצעה/, 'הצעה מוגבלת בזמן');
    }
    
    // Ensure call-to-action is clear
    if (text.includes('פרטים') && !text.includes('נוכל')) {
      text += ' מתי נוכל לקבוע שיחת ייעוץ קצרה?';
    }
    
    return text;
  }
  
  static isResponseInHebrew(text: string): boolean {
    // Check if the majority of characters are Hebrew
    const hebrewChars = text.match(/[\u0590-\u05FF]/g) || [];
    const totalChars = text.replace(/[\s\d\W]/g, '').length;
    
    return hebrewChars.length / totalChars > 0.7;
  }
  
  static addBusinessEmojis(text: string): string {
    // Add contextual emojis for better engagement
    text = text.replace(/(\d+)\s*שעות?/g, '$1 שעות ⏰');
    text = text.replace(/(\d+)\s*ימים?/g, '$1 ימים 📅');
    text = text.replace(/ביטוח/g, 'ביטוח 🛡️');
    text = text.replace(/טיסה|טיסות/g, 'טיסות ✈️');
    text = text.replace(/מלון|מלונות/g, 'מלונות 🏨');
    text = text.replace(/חופשה/g, 'חופשה 🏖️');
    text = text.replace(/עסקים|עסקי/g, 'עסקי 💼');
    text = text.replace(/חירום/g, 'חירום 🆘');
    
    return text;
  }
  
  static ensureCallToAction(text: string, stage: string): string {
    const hasCallToAction = /(\?|!|לקבוע|להזמין|לבדוק|ליצור קשר)/.test(text);
    
    if (!hasCallToAction) {
      switch (stage) {
        case 'information-gathering':
          text += ' איזה פרטים נוספים אוכל לקבל?';
          break;
        case 'recommendations':
          text += ' מה אתם אומרים?';
          break;
        case 'upselling':
          text += ' מעוניינים לשמוע על זה?';
          break;
        case 'closing':
          text += ' מתי נוכל לקבוע שיחה?';
          break;
      }
    }
    
    return text;
  }
}