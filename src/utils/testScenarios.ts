import { ConversationManager } from '../services/conversationManager';
import { TravelScenario } from '../types';

export interface TestResult {
  scenario: TravelScenario;
  passed: boolean;
  messages: string[];
  finalScore: number;
  finalStage: string;
  objectives: any;
}

export class ScenarioTester {
  
  static testVacationPlanningFlow(): TestResult {
    const manager = new ConversationManager('vacation-planning');
    const messages: string[] = [];
    
    // Simulate user conversation flow
    const userMessages = [
      'היי, אני רוצה לתכנן חופשה ליוון',
      'אנחנו 4 בני משפחה, רוצים לטוס בסוף יולי',
      'התקציב שלנו בערך 8000 שקל למשפחה',
      'כן, זה נשמע טוב! איך נמשיך?',
      'האם יש ביטוח נסיעות?',
      'הטלפון שלי 050-1234567'
    ];
    
    userMessages.forEach((msg, index) => {
      manager.updateContext(msg, true);
      const context = manager.getContext();
      const leadScore = manager.getLeadScore();
      
      messages.push(`Message ${index + 1}: ${msg}`);
      messages.push(`  Stage: ${context.stage}`);
      messages.push(`  Lead: ${context.leadQualification}`);
      if (leadScore) {
        messages.push(`  Score: ${leadScore.score}`);
      }
      messages.push('---');
    });
    
    const finalContext = manager.getContext();
    const finalScore = manager.getLeadScore()?.score || 0;
    
    const passed = 
      finalContext.businessObjectives.infoGathered &&
      finalContext.businessObjectives.contactCollected &&
      finalScore > 40 &&
      finalContext.customerInfo.destination === 'יוון';
    
    return {
      scenario: 'vacation-planning',
      passed,
      messages,
      finalScore,
      finalStage: finalContext.stage,
      objectives: finalContext.businessObjectives
    };
  }
  
  static testUpcomingTripFlow(): TestResult {
    const manager = new ConversationManager('upcoming-trip-recommendations');
    const messages: string[] = [];
    
    const userMessages = [
      'היי! אני דוד, רואה שיש לי נסיעה לפראג בשבוע הבא',
      'כן, בדיוק! אנחנו 4 בני משפחה',
      'מעניין אותי הסיור VIP בעיר העתיקה',
      'כמה זה עולה עם המדריך דובר העברית?',
      'בסדר, אני רוצה להזמין',
      'דוד.כהן@gmail.com זה האימייל שלי'
    ];
    
    userMessages.forEach((msg, index) => {
      manager.updateContext(msg, true);
      const context = manager.getContext();
      const leadScore = manager.getLeadScore();
      
      messages.push(`Message ${index + 1}: ${msg}`);
      messages.push(`  Stage: ${context.stage}`);
      messages.push(`  Lead: ${context.leadQualification}`);
      if (leadScore) {
        messages.push(`  Score: ${leadScore.score}`);
      }
      messages.push('---');
    });
    
    const finalContext = manager.getContext();
    const finalScore = manager.getLeadScore()?.score || 0;
    
    const passed = 
      finalContext.businessObjectives.infoGathered &&
      finalContext.businessObjectives.contactCollected &&
      finalScore > 50 &&
      finalContext.customerInfo.destination === 'פראג';
    
    return {
      scenario: 'upcoming-trip-recommendations',
      passed,
      messages,
      finalScore,
      finalStage: finalContext.stage,
      objectives: finalContext.businessObjectives
    };
  }
  
  static testVacationConciergeFlow(): TestResult {
    const manager = new ConversationManager('vacation-concierge');
    const messages: string[] = [];
    
    const userMessages = [
      'היי! איך החופשה באמסטרדם? אתמול היינו ברובע האדום',
      'היה מדהים! מה יש להציע להיום?',
      'מעניין אותי הטיול באופניים החשמליים',
      'אוקיי, אני רוצה להזמין גם את השיט בתעלות',
      'רונה.לוי@gmail.com זה האימייל שלי'
    ];
    
    userMessages.forEach((msg, index) => {
      manager.updateContext(msg, true);
      const context = manager.getContext();
      const leadScore = manager.getLeadScore();
      
      messages.push(`Message ${index + 1}: ${msg}`);
      messages.push(`  Stage: ${context.stage}`);
      messages.push(`  Lead: ${context.leadQualification}`);
      if (leadScore) {
        messages.push(`  Score: ${leadScore.score}`);
      }
      messages.push('---');
    });
    
    const finalContext = manager.getContext();
    const finalScore = manager.getLeadScore()?.score || 0;
    
    const passed = 
      finalContext.businessObjectives.contactCollected &&
      finalScore >= 70 &&
      !!finalContext.customerInfo.destination;
    
    return {
      scenario: 'vacation-concierge',
      passed,
      messages,
      finalScore,
      finalStage: finalContext.stage,
      objectives: finalContext.businessObjectives
    };
  }
  
  static runAllTests(): TestResult[] {
    return [
      this.testVacationPlanningFlow(),
      this.testUpcomingTripFlow(),
      this.testVacationConciergeFlow()
    ];
  }
  
  static generateTestReport(results: TestResult[]): string {
    const report = ['🧪 Scenario Flow Test Results', '=' .repeat(40)];
    
    results.forEach(result => {
      const status = result.passed ? '✅ PASSED' : '❌ FAILED';
      report.push(`\n${status} ${result.scenario.toUpperCase()}`);
      report.push(`  Final Score: ${result.finalScore}/100`);
      report.push(`  Final Stage: ${result.finalStage}`);
      report.push(`  Objectives: ${JSON.stringify(result.objectives, null, 2)}`);
      
      if (!result.passed) {
        report.push('  Message Flow:');
        result.messages.forEach(msg => report.push(`    ${msg}`));
      }
    });
    
    const passedCount = results.filter(r => r.passed).length;
    report.push(`\n📊 Summary: ${passedCount}/${results.length} scenarios passed`);
    
    return report.join('\n');
  }
}

// Quick test runner for debugging
export const runQuickTest = () => {
  const results = ScenarioTester.runAllTests();
  console.log(ScenarioTester.generateTestReport(results));
  return results;
};