# קישרי תעופה - AI Travel Assistant Demo

A sophisticated AI-powered travel assistant demo built for Kishrey Teufa (קישרי תעופה) with an authentic WhatsApp-style interface.

## 🌟 Features

### 🎯 Three Interactive Scenarios
1. **תכנון חופשה** (Vacation Planning) - Plan your perfect trip with AI assistance
2. **המלצות לנסיעה קרובה** (Upcoming Trip Recommendations) - Get personalized recommendations for your booked trip
3. **קונסיירז' בחופשה** (Vacation Concierge) - Real-time assistance during your vacation

### 💬 WhatsApp-Style Interface
- **Pixel-perfect WhatsApp UI** with authentic colors and styling
- **Hebrew/RTL support** with proper text direction and layout
- **Real-time typing indicators** and status updates
- **Responsive design** optimized for presentations on large screens

### 🤖 AI-Powered Conversations
- **OpenAI GPT-4 integration** with intelligent conversation flows
- **Business-specific prompts** tailored for travel industry
- **Lead qualification system** with automatic scoring
- **Upselling logic** with contextual recommendations
- **Session persistence** across scenarios for connected experience

### 🏢 Business Intelligence
- **Customer context tracking** with automatic information extraction
- **Conversation stage management** (information gathering → recommendations → upselling → closing)
- **Hebrew language processing** for names, destinations, and travel details
- **Real-time lead scoring** and sales opportunity identification

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd tehofa-demo
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure OpenAI API**
```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your OpenAI API key
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

4. **Start development server**
```bash
npm run dev
```

5. **Open in browser**
Navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── ChatContainer.tsx    # Main chat interface
│   ├── ChatInput.tsx       # Message input component
│   ├── MessageBubble.tsx   # Individual message display
│   └── TypingIndicator.tsx # Typing animation
├── services/            # Business logic
│   ├── openai.ts           # OpenAI API integration
│   ├── conversationManager.ts # Conversation flow logic
│   ├── dynamicScenarios.ts    # Scenario configuration
│   ├── sessionManager.ts      # Session persistence
│   ├── leadQualifier.ts       # Lead scoring system
│   └── followupSystem.ts      # Follow-up suggestions
├── pages/               # Application pages
│   ├── ScenarioSelector.tsx # Homepage with scenario selection
│   └── ChatPage.tsx        # Chat interface
├── config/              # Configuration
│   └── scenarios.ts        # Scenario definitions
├── types/               # TypeScript definitions
│   └── index.ts           # Shared types
├── hooks/               # Custom React hooks
│   └── useChat.ts         # Chat functionality hook
└── index.css           # WhatsApp-style CSS
```

## 🎮 Usage Guide

### For Demonstrations

1. **Start with Scenario 1** (תכנון חופשה)
   - Enter customer details (name, destination, dates, travelers)
   - Experience natural Hebrew conversation flow
   - AI automatically extracts and stores vacation details

2. **Continue to Scenario 2** (המלצות לנסיעה קרובה)
   - AI recognizes you from previous session
   - Provides personalized recommendations based on your planned trip
   - Demonstrates connected customer experience

3. **Finish with Scenario 3** (קונסיירז' בחופשה)
   - Real-time vacation assistance simulation
   - AI knows your location and previous activities
   - Shows advanced customer service capabilities

### For Development

1. **Modify Scenarios**
   - Edit `src/config/scenarios.ts` for system prompts
   - Update `src/services/dynamicScenarios.ts` for behavior logic

2. **Customize UI**
   - Modify `src/index.css` for styling changes
   - Update `src/components/ChatContainer.tsx` for layout changes

3. **Business Logic**
   - Enhance `src/services/conversationManager.ts` for conversation flows
   - Modify `src/services/leadQualifier.ts` for scoring algorithms

## 🛠 Technical Details

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom WhatsApp theme
- **AI**: OpenAI GPT-4 API
- **State Management**: React Hooks + localStorage
- **Fonts**: Noto Sans Hebrew for proper Hebrew rendering

### Key Technologies
- **Vite**: Fast development server and build tool
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type-safe development
- **OpenAI SDK**: Official OpenAI integration

### AI Integration
- **Dynamic System Prompts**: Context-aware conversation guidance
- **Session Continuity**: Customer data persists across scenarios
- **Hebrew Processing**: Natural language understanding in Hebrew
- **Business Intelligence**: Automatic lead qualification and scoring

## 🎨 UI/UX Features

### WhatsApp Authenticity
- Exact color scheme (#128c7e header, #dcf8c6 user bubbles)
- Authentic typography and spacing
- Real typing indicators and status updates
- Proper RTL layout for Hebrew text

### Responsive Design
- Optimized for large screen presentations
- Mobile-friendly responsive breakpoints
- Scalable fonts and components
- Touch-friendly interactive elements

## 🔧 Configuration

### Environment Variables
```bash
# Required
VITE_OPENAI_API_KEY=your_openai_api_key

# Optional
VITE_APP_TITLE="קישרי תעופה AI"
VITE_DEBUG_MODE=false
```

### Customization Options
- Update company logo: Replace `/public/logo-kisheri.png`
- Modify scenarios: Edit `src/config/scenarios.ts`
- Change styling: Customize `src/index.css`
- Adjust business logic: Update `src/services/conversationManager.ts`

## 📊 Business Features

### Lead Qualification
- Automatic customer information extraction
- Real-time lead scoring (cold/warm/hot/emergency)
- Conversation stage tracking
- Upselling opportunity identification

### Session Management
- 24-hour session persistence
- Cross-scenario customer recognition
- Vacation details storage and retrieval
- Personalized experience continuity

### Analytics Ready
- Conversation tracking and logging
- Customer interaction metrics
- Lead conversion funnel analysis
- Business objective completion tracking

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is proprietary software developed for Kishrey Teufa (קישרי תעופה).

## 🔗 Links

- **Company Website**: [Kishrey Teufa](https://www.kishrey-teufa.co.il)
- **OpenAI Documentation**: [OpenAI API](https://platform.openai.com/docs)
- **React Documentation**: [React](https://react.dev)
- **Tailwind CSS**: [Tailwind](https://tailwindcss.com)

## 💡 Tips for Presentations

1. **Use Chrome/Safari** for best WhatsApp visual accuracy
2. **Full screen mode** (F11) for immersive experience
3. **Start with empty session** - clear localStorage if needed
4. **Prepare example inputs** in Hebrew for smooth demonstrations
5. **Large screen optimization** - interface scales well for projectors

---

**Built with ❤️ for Kishrey Teufa (קישרי תעופה)**  
*Powered by OpenAI GPT-4 and modern web technologies*