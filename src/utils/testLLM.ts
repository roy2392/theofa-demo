import { openAiService, ChatMessage } from '../services/openai';
import { TravelScenario } from '../types';

export interface LLMTestResult {
  scenario: TravelScenario;
  testMessage: string;
  response: string;
  usedLLM: boolean;
  systemPrompt: string;
  responseTime: number;
  success: boolean;
}

export class LLMTester {
  
  static async testScenario(scenario: TravelScenario, userMessage: string): Promise<LLMTestResult> {
    const startTime = Date.now();
    
    try {
      // Initialize conversation
      openAiService.initializeConversation(scenario);
      
      // Prepare test messages
      const messages: ChatMessage[] = [
        { role: 'user', content: userMessage }
      ];
      
      console.log(`🧪 Testing ${scenario} with message: "${userMessage}"`);
      
      // Get response from LLM
      const response = await openAiService.sendMessage(messages, scenario, userMessage);
      const responseTime = Date.now() - startTime;
      
      // Check if response looks like real LLM or fallback
      const usedLLM = !response.includes('התקלה הטכנית') && 
                     !response.includes('emergency fallback') &&
                     response.length > 50;
      
      // const context = openAiService.getConversationContext();
      
      return {
        scenario,
        testMessage: userMessage,
        response,
        usedLLM,
        systemPrompt: 'Dynamic prompt based on conversation context',
        responseTime,
        success: true
      };
      
    } catch (error) {
      console.error(`❌ Test failed for ${scenario}:`, error);
      
      return {
        scenario,
        testMessage: userMessage,
        response: `Error: ${error}`,
        usedLLM: false,
        systemPrompt: 'N/A',
        responseTime: Date.now() - startTime,
        success: false
      };
    }
  }
  
  static async testAllScenarios(): Promise<LLMTestResult[]> {
    const testCases = [
      { scenario: 'vacation-planning' as TravelScenario, message: 'היי, אני רוצה לתכנן חופשה למשפחה ביוון' },
      { scenario: 'business-travel' as TravelScenario, message: 'אני צריך טיסה לפגישה עסקית בלונדון' },
      { scenario: 'emergency-support' as TravelScenario, message: 'חירום! הטיסה שלי בוטלה ואני צריך לטוס הלילה' }
    ];
    
    const results: LLMTestResult[] = [];
    
    for (const testCase of testCases) {
      console.log(`\n🔄 Testing ${testCase.scenario}...`);
      const result = await this.testScenario(testCase.scenario, testCase.message);
      results.push(result);
      
      // Wait between tests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
  }
  
  static generateTestReport(results: LLMTestResult[]): string {
    const report = ['🤖 Real LLM Implementation Test Results', '=' .repeat(50)];
    
    let successCount = 0;
    let llmCount = 0;
    
    results.forEach((result, index) => {
      const status = result.success ? '✅ SUCCESS' : '❌ FAILED';
      const llmStatus = result.usedLLM ? '🧠 Real LLM' : '🔄 Fallback';
      
      report.push(`\n${index + 1}. ${status} ${result.scenario.toUpperCase()}`);
      report.push(`   Message: "${result.testMessage}"`);
      report.push(`   Response: "${result.response.substring(0, 100)}..."`);
      report.push(`   Method: ${llmStatus}`);
      report.push(`   Time: ${result.responseTime}ms`);
      
      if (result.success) successCount++;
      if (result.usedLLM) llmCount++;
    });
    
    const llmSuccessRate = results.length > 0 ? (llmCount / results.length * 100).toFixed(1) : '0';
    const overallSuccessRate = results.length > 0 ? (successCount / results.length * 100).toFixed(1) : '0';
    
    report.push(`\n📊 Summary:`);
    report.push(`   Total Tests: ${results.length}`);
    report.push(`   Successful: ${successCount}/${results.length} (${overallSuccessRate}%)`);
    report.push(`   Used Real LLM: ${llmCount}/${results.length} (${llmSuccessRate}%)`);
    report.push(`   Used Fallback: ${results.length - llmCount}/${results.length}`);
    
    if (llmCount === results.length) {
      report.push('\n🎉 Excellent! All tests used real LLM responses');
    } else if (llmCount > 0) {
      report.push('\n✅ Good! Some tests used real LLM, others used intelligent fallback');
    } else {
      report.push('\n⚠️  Warning: No tests used real LLM - check API configuration');
    }
    
    return report.join('\n');
  }
}

// Quick test runner for debugging
export const runLLMTest = async () => {
  console.log('🚀 Starting LLM Implementation Test...');
  const results = await LLMTester.testAllScenarios();
  const report = LLMTester.generateTestReport(results);
  console.log(report);
  return results;
};