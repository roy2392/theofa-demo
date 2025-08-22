export interface VacationSession {
  customerName: string;
  destination: string;
  dates: string;
  travelers: number;
  budget?: string;
  purpose?: string;
  interests?: string[];
  sessionId: string;
  createdAt: Date;
  lastUpdated: Date;
}

export class SessionManager {
  private static readonly SESSION_KEY = 'kishrey_vacation_session';
  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  static saveSession(sessionData: Partial<VacationSession>): void {
    const existingSession = this.getSession();
    
    const session: VacationSession = {
      customerName: sessionData.customerName || existingSession?.customerName || '',
      destination: sessionData.destination || existingSession?.destination || '',
      dates: sessionData.dates || existingSession?.dates || '',
      travelers: sessionData.travelers || existingSession?.travelers || 0,
      budget: sessionData.budget || existingSession?.budget,
      purpose: sessionData.purpose || existingSession?.purpose,
      interests: sessionData.interests || existingSession?.interests || [],
      sessionId: existingSession?.sessionId || this.generateSessionId(),
      createdAt: existingSession?.createdAt || new Date(),
      lastUpdated: new Date()
    };

    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      console.log('💾 Session saved:', session);
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  static getSession(): VacationSession | null {
    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY);
      if (!sessionData) return null;

      const session: VacationSession = JSON.parse(sessionData);
      
      // Check if session has expired
      const now = new Date().getTime();
      const sessionTime = new Date(session.lastUpdated).getTime();
      
      if (now - sessionTime > this.SESSION_DURATION) {
        this.clearSession();
        return null;
      }

      // Convert date strings back to Date objects
      session.createdAt = new Date(session.createdAt);
      session.lastUpdated = new Date(session.lastUpdated);

      return session;
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }

  static updateSession(updates: Partial<VacationSession>): void {
    const session = this.getSession();
    if (session) {
      this.saveSession({ ...session, ...updates });
    } else {
      this.saveSession(updates);
    }
  }

  static clearSession(): void {
    try {
      localStorage.removeItem(this.SESSION_KEY);
      console.log('🗑️ Session cleared');
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  static hasValidSession(): boolean {
    const session = this.getSession();
    return session !== null && session.destination.length > 0 && session.customerName.length > 0;
  }

  private static generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Extract vacation details from conversation messages
  static extractVacationDetails(messages: any[]): Partial<VacationSession> {
    const details: Partial<VacationSession> = {
      interests: []
    };

    messages.forEach(message => {
      if (message.sender === 'user') {
        const content = message.content.toLowerCase();
        
        // Extract name
        const nameMatch = content.match(/השם שלי ([\u0590-\u05FF\w\s]+)|אני ([\u0590-\u05FF\w\s]+)|קוראים לי ([\u0590-\u05FF\w\s]+)/);
        if (nameMatch) {
          details.customerName = (nameMatch[1] || nameMatch[2] || nameMatch[3]).trim();
        }

        // Extract destination
        const destinations = [
          'פראג', 'פריז', 'לונדון', 'רומא', 'ברלין', 'אמסטרדם', 'וינה', 'בודפשט',
          'מדריד', 'ברצלונה', 'מילאנו', 'ונציה', 'פירנצה', 'יוון', 'סנטוריני', 
          'מיקונוס', 'קריט', 'איטליה', 'ספרד', 'צרפת', 'גרמניה', 'הולנד',
          'אוסטריה', 'הונגריה', 'צ\'כיה', 'תאילנד', 'בנגקוק', 'פוקט'
        ];
        destinations.forEach(dest => {
          if (content.includes(dest)) {
            details.destination = dest;
          }
        });

        // Extract dates
        const dateMatch = content.match(/(\d{1,2}\/\d{1,2}\/?\d{0,4})|(\d{1,2}\.\d{1,2}\.?\d{0,4})|(בשבוע הבא|חודש הבא|בחודש|בקיץ|בחורף)/);
        if (dateMatch) {
          details.dates = dateMatch[0];
        }

        // Extract travelers
        const travelerMatch = content.match(/(\d+)\s*(אנשים|נוסעים|בני משפחה|במשפחה)/);
        if (travelerMatch) {
          details.travelers = parseInt(travelerMatch[1]);
        }

        // Extract budget
        if (content.includes('תקציב') || content.includes('מחיר') || content.includes('שקל')) {
          if (content.includes('זול') || content.includes('חסכוני')) {
            details.budget = 'low';
          } else if (content.includes('יוקרה') || content.includes('מפנק') || content.includes('ללא מגבלה')) {
            details.budget = 'high';
          } else {
            details.budget = 'medium';
          }
        }

        // Extract interests
        const interestKeywords = [
          'מוזיאונים', 'אמנות', 'תרבות', 'היסטוריה', 'אדריכלות',
          'אוכל', 'מסעדות', 'חיי לילה', 'בידור', 'קניות',
          'טבע', 'נוף', 'הליכה', 'ספורט', 'פעילויות',
          'משפחתי', 'ילדים', 'רומנטי', 'זוגי'
        ];
        
        interestKeywords.forEach(interest => {
          if (content.includes(interest) && !details.interests?.includes(interest)) {
            details.interests?.push(interest);
          }
        });
      }
    });

    return details;
  }

  // Generate dynamic recommendations based on session
  static generateRecommendations(session: VacationSession): string[] {
    const recommendations: string[] = [];
    const destination = session.destination.toLowerCase();

    // Destination-specific recommendations
    if (destination.includes('פראג')) {
      recommendations.push(
        `כרטיסי skip-the-line לטירת פראג במחיר מוזל (חיסכון 30%)`,
        `סיור VIP מודרך בעיר העתיקה עם מדריך דובר עברית`,
        `טיול יום בצ'סקי קרומלוב - העיר המוגנת של אונסק"ו`,
        `ארוחת גורמה במסעדות המובילות בפראג`
      );
    } else if (destination.includes('אמסטרדם')) {
      recommendations.push(
        `השכרת אופניים חשמליים מעוצבים + טיול מודרך`,
        `שייט בתעלות עם ארוחת גורמה`,
        `סיור פרטי במוזיאון ואן גוך ללא תור`,
        `טיול יום בגינות קיוקנהוף (עונתי)`
      );
    } else if (destination.includes('פריז')) {
      recommendations.push(
        `כרטיסי מהיר למגדל אייפל ללא תור`,
        `סיור פרטי בלובר עם מדריך מומחה`,
        `ארוחה במסעדה עם כוכב מישלן`,
        `טיול יום בארמונות ורסאי`
      );
    } else if (destination.includes('רומא')) {
      recommendations.push(
        `סיור מהיר בקולוסיאום ובפורום הרומי`,
        `ביקור פרטי במוזיאי הוותיקן`,
        `סיור קולינרי ברובע טרסטבר`,
        `טיול יום בחוף הים - אוסטיה אנטיקה`
      );
    } else {
      // Generic recommendations
      recommendations.push(
        `סיורים מודרכים עם מדריך דובר עברית`,
        `כרטיסים מראש לאטרקציות מובילות`,
        `המלצות מסעדות מהמובילות במקום`,
        `הסעות VIP ופעילויות מיוחדות`
      );
    }

    // Add family-specific recommendations if applicable
    if (session.travelers >= 3) {
      recommendations.push(`פעילויות מותאמות למשפחות עם ילדים`);
    }

    // Add budget-specific recommendations
    if (session.budget === 'high') {
      recommendations.push(`חוויות יוקרה ושירותים VIP בלעדיים`);
    }

    return recommendations;
  }

  // Generate concierge activities based on session and "current location"
  static generateConciergeActivities(session: VacationSession): string[] {
    const activities: string[] = [];
    const destination = session.destination.toLowerCase();

    if (destination.includes('אמסטרדם')) {
      activities.push(
        `🚲 טיול אופניים חשמליים בפארק פונדל`,
        `⛵ שייט בתעלות עם ארוחת גורמה (מחיר מיוחד היום!)`,
        `🎨 סיור פרטי במוזיאון ואן גוך (ללא תור!)`,
        `🧀 סדנת גבינות הולנדיות אותנטית`,
        `🍺 טיול בירות מקומיות עם מדריך ישראלי`
      );
    } else if (destination.includes('פראג')) {
      activities.push(
        `🏰 סיור מיוחד בטירת פראג עם מדריך פרטי`,
        `🍺 טעימת בירות צ'כיות במבשלות מקומיות`,
        `🎭 מופע אופרה או קונצרט קלאסי`,
        `🚗 טיול יום לצ'סקי קרומלוב העיר המוגנת`,
        `🍽️ ארוחת ערב במסעדות הטובות ביותר בעיר`
      );
    } else if (destination.includes('פריז')) {
      activities.push(
        `🗼 עלייה למגדל אייפל בזמן השקיעה`,
        `🎨 סיור פרטי בלובר עם מדריך מומחה`,
        `🥖 טיול קולינרי ברובע מונמארטר`,
        `⛵ שייט רומנטי בסיין`,
        `🛍️ קניות באזורי האופנה המובילים`
      );
    } else {
      // Generic activities
      activities.push(
        `🎯 פעילויות מומלצות המותאמות לכם אישית`,
        `🚶 טיולים מודרכים באזורים המעניינים`,
        `🍽️ המלצות מסעדות לפי הטעם שלכם`,
        `🎪 אירועים וחוויות מיוחדות באזור`,
        `📸 מקומות צילום מומלצים ונסתרים`
      );
    }

    return activities;
  }
}