import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DynamicScenarios } from '../services/dynamicScenarios';
import { SessionManager } from '../services/sessionManager';
import { ScenarioConfig } from '../types';

export const ScenarioSelector: React.FC = () => {
  const [scenarios, setScenarios] = useState<ScenarioConfig[]>([]);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const sessionExists = SessionManager.hasValidSession();
    setHasSession(sessionExists);
    
    // Load dynamic scenarios
    const scenarioIds = ['vacation-planning', 'upcoming-trip-recommendations', 'vacation-concierge'];
    const loadedScenarios = scenarioIds
      .map(id => DynamicScenarios.getScenarioConfig(id))
      .filter(scenario => scenario !== null) as ScenarioConfig[];
    
    setScenarios(loadedScenarios);
  }, []);

  const handleClearSession = () => {
    SessionManager.clearSession();
    window.location.reload();
  };

  return (
    <div className="max-w-6xl mx-auto px-6" style={{backgroundColor: '#e5ddd5', minHeight: 'calc(100vh - 70px)'}}>
      <div className="pt-12 pb-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            איך אוכל לעזור לך היום?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            בחר את התרחיש המתאים לך ואני אדאג לך לחווית נסיעה מושלמת עם עוזר הנסיעות החכם של קישרי תעופה
          </p>
          {hasSession && (
            <div className="mt-6 p-4 bg-green-100 rounded-lg inline-block">
              <p className="text-green-800 mb-2">✅ יש לך נסיעה שמורה במערכת - תרחישים 2 ו-3 יותאמו אליך אישית!</p>
              <button 
                onClick={handleClearSession}
                className="text-sm text-green-600 hover:text-green-800 underline"
              >
                מחק נסיעה ותתחיל מחדש
              </button>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-10">
          {scenarios.map((scenario) => (
            <Link
              key={scenario.id}
              to={`/chat/${scenario.id}`}
              className="group bg-white rounded-xl p-10 hover:bg-white/95 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="text-center">
                <div className="text-7xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {scenario.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {scenario.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {scenario.description}
                </p>
              </div>
              <div className="mt-8 flex justify-center">
                <div className="bg-[#128c7e] text-white px-8 py-3 rounded-full text-lg font-semibold group-hover:bg-[#075e54] transition-colors shadow-lg">
                  התחל שיחה
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-20 text-center">
          <div className="bg-white rounded-xl p-10 max-w-4xl mx-auto shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              למה לבחור בעוזר הנסיעות החכם שלנו?
            </h3>
            <div className="grid md:grid-cols-3 gap-10 text-lg">
              <div className="text-center">
                <div className="text-4xl mb-4">🕒</div>
                <div className="font-bold mb-2 text-gray-900">זמין 24/7</div>
                <div className="text-gray-600">תמיכה מלאה בכל שעות היממה</div>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🎓</div>
                <div className="font-bold mb-2 text-gray-900">מומחה נסיעות</div>
                <div className="text-gray-600">ידע מקצועי ומעודכן עם GPT-5</div>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">💎</div>
                <div className="font-bold mb-2 text-gray-900">שירות אישי</div>
                <div className="text-gray-600">פתרונות מותאמים אישית לכל לקוח</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};