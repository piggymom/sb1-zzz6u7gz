import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, ThumbsUp, ArrowRight, Copy, RefreshCw, Check, Briefcase, HeartCrack, Bird, Cloud, BookOpen, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';

type Step = 1 | 2 | 3 | 4 | 5;
type Scenario = 'job-loss' | 'breakup' | 'grief' | 'distant-friend';
type EmotionSet = {
  'job-loss': ['Embarrassed', 'Angry', 'Relieved', 'Anxious', 'Ashamed', 'Lonely'];
  'breakup': ['Heartbroken', 'Angry', 'Rejected', 'Confused', 'Lonely', 'Numb'];
  'grief': ['Devastated', 'Empty', 'Disoriented', 'Angry', 'Withdrawn', 'In shock'];
  'distant-friend': ['Overwhelmed', 'Low energy', 'Disconnected', 'Anxious', 'Withdrawn', 'Unmotivated'];
};

type JournalEntry = {
  id: string;
  scenario: Scenario;
  message: string;
  reflection: string;
  date: string;
  insight: string;
};

const scenarios = {
  'job-loss': {
    title: 'My friend just lost their job',
    icon: Briefcase,
    emoji: '💼',
    description: 'Support a friend who\'s just been let go.',
    emotions: ['Embarrassed', 'Angry', 'Relieved', 'Anxious', 'Ashamed', 'Lonely'] as const,
    feedback: 'Those are common feelings in this situation. Recognizing these emotions helps us respond with more understanding.',
    sampleMessage: [
      {
        text: "Hey, I just heard — I'm really sorry. That really sucks.",
        explanation: "This acknowledges the situation and validates their feelings without minimizing the experience."
      },
      {
        text: "I'm here for you, however you need.",
        explanation: "This offers support while giving them space to process their emotions."
      },
      {
        text: "Whether you want to talk, vent, or just hang out.",
        explanation: "This provides specific ways you can help, making your support more tangible."
      }
    ],
    prompts: [
      '"That sounds really tough..."',
      '"I\'ve got your back if you need..."',
      '"I\'m here to listen..."'
    ]
  },
  'breakup': {
    title: 'My friend is going through a breakup',
    icon: HeartCrack,
    emoji: '💔',
    description: 'Be there during a heartbreak.',
    emotions: ['Heartbroken', 'Angry', 'Rejected', 'Confused', 'Lonely', 'Numb'] as const,
    feedback: 'Breakups bring up a lot of feelings — thank you for reflecting honestly.',
    sampleMessage: [
      {
        text: "Hey, I just heard about the breakup — I'm really sorry. That must be incredibly hard.",
        explanation: "This acknowledges their pain while validating the significance of what they're going through."
      },
      {
        text: "Just wanted you to know I'm here,",
        explanation: "This offers a gentle, non-pressuring form of support that lets them know they're not alone."
      },
      {
        text: "whether you want to talk about it or just take your mind off things.",
        explanation: "This gives them options and control over how they want to be supported."
      }
    ],
    prompts: [
      '"Breakups suck, I\'m really sorry..."',
      '"I\'ve got you if you need anything at all..."',
      '"Whatever you need right now..."'
    ]
  },
  'grief': {
    title: 'My sibling is grieving a loss',
    icon: Bird,
    emoji: '🕊️',
    description: 'Offer comfort in a moment of grief.',
    emotions: ['Devastated', 'Empty', 'Disoriented', 'Angry', 'Withdrawn', 'In shock'] as const,
    feedback: 'Loss is never simple — you\'re doing something kind just by showing up.',
    sampleMessage: [
      {
        text: "I can't imagine what you're going through, but I want you to know I'm here for you.",
        explanation: "This shows emotional humility by acknowledging the uniqueness and depth of their experience without presuming to understand it fully."
      },
      {
        text: "Whatever you need — space, a call, or anything in between — I've got you.",
        explanation: "This offers flexible support that respects their grieving process, giving them control over how and when to reach out."
      }
    ],
    prompts: [
      '"I don\'t have the right words, but I\'m here..."',
      '"Take all the time and space you need..."',
      '"I\'m holding you in my heart..."'
    ]
  },
  'distant-friend': {
    title: 'My friend seems distant or down',
    icon: Cloud,
    emoji: '🌧️',
    description: 'Reach out when someone\'s going quiet.',
    emotions: ['Overwhelmed', 'Low energy', 'Disconnected', 'Anxious', 'Withdrawn', 'Unmotivated'] as const,
    feedback: 'Noticing when someone\'s off is the first step — thanks for paying attention.',
    sampleMessage: [
      {
        text: "Hey — just wanted to check in.",
        explanation: "This opens the conversation gently, showing care without pressure."
      },
      {
        text: "You've seemed a bit off lately, and I wanted to let you know I'm here if you ever want to talk or just hang.",
        explanation: "This acknowledges what you've noticed while offering support in a way that gives them control over how to respond."
      },
      {
        text: "No pressure, just care.",
        explanation: "This closing removes any sense of obligation, emphasizing that your support comes without expectations."
      }
    ],
    prompts: [
      '"I\'ve been thinking about you lately..."',
      '"If you ever feel like chatting, I\'m here..."',
      '"No pressure at all, just wanted to check in..."'
    ]
  }
} as const;

console.log("🔐 OpenAI API Key:", import.meta.env.VITE_OPENAI_API_KEY);
const generateInsight = async (message: string): Promise<string> => {
  const defaultInsights = [
    "You're building your empathy skills with each message.",
    "Sometimes just reaching out is exactly what's needed.",
    "Your willingness to support others shows real emotional strength.",
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an empathy coach analyzing supportive messages. Provide encouraging, specific feedback about the emotional intelligence shown in the message.'
          },
          {
            role: 'user',
            content: `Analyze this message for emotional intelligence. What emotional support moves does it make (e.g. validation, empathy, space-giving)? Return a single encouraging sentence that gives the writer thoughtful feedback.\n\nMessage: "${message}"`
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate insight');
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating insight:', error);
    return defaultInsights[Math.floor(Math.random() * defaultInsights.length)];
  }
};

function App() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [userMessage, setUserMessage] = useState('');
  const [reflection, setReflection] = useState('');
  const [copied, setCopied] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('empathy-journal');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setJournalEntries(parsed);
        }
      } catch (e) {
        console.error('Failed to parse journal:', e);
      }
    }
  }, []);

  const saveJournalEntry = async () => {
    if (!selectedScenario || !userMessage || !reflection || hasSaved) return;

    const insight = await generateInsight(userMessage);
    
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      scenario: selectedScenario,
      message: userMessage,
      reflection,
      date: new Date().toISOString(),
      insight,
    };

    const updatedEntries = [...journalEntries, newEntry];
    setJournalEntries(updatedEntries);
    localStorage.setItem('empathy-journal', JSON.stringify(updatedEntries));
    setHasSaved(true);
  };

  const resetApp = () => {
    setCurrentStep(1);
    setSelectedScenario(null);
    setSelectedEmotions([]);
    setUserMessage('');
    setReflection('');
    setCopied(false);
    setHasSaved(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(userMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleEmotionToggle = (emotion: string) => {
    setSelectedEmotions(prev =>
      prev.includes(emotion)
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    );
  };

  const renderJournal = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-indigo-600">
          <BookOpen className="w-6 h-6" />
          <h2 className="text-xl font-semibold">Progress Journal</h2>
        </div>
        <button
          onClick={() => setShowJournal(false)}
          className="text-gray-500 hover:text-gray-700 flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div className="bg-indigo-50 p-4 rounded-lg">
        <p className="text-gray-700">
          This is your empathy log — a space to see how you're growing.
        </p>
      </div>

      <div className="space-y-4">
        {journalEntries.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No journal entries yet — complete a message to see it here.
          </p>
        ) : (
          journalEntries.map((entry) => (
            <div key={entry.id} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{scenarios[entry.scenario].emoji}</span>
                <h3 className="text-lg font-medium text-gray-900">
                  {scenarios[entry.scenario].title}
                </h3>
              </div>
              <p className="text-sm text-gray-500 mb-3">
                {format(new Date(entry.date), 'MMMM d, yyyy')}
              </p>
              <p className="text-gray-700 mb-3">{entry.message}</p>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-gray-500">Reflection:</span>
                <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {entry.reflection}
                </span>
              </div>
              <p className="text-sm text-indigo-600 italic">{entry.insight}</p>
            </div>
          ))
        )}
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
        <p className="text-gray-700 mb-4">Want to check in on someone this week?</p>
        <button
          onClick={() => {
            setShowJournal(false);
            resetApp();
          }}
          className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Start New Message
        </button>
      </div>
    </div>
  );

  const renderScenarioPicker = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-indigo-600">
          <Heart className="w-6 h-6" />
          <h2 className="text-xl font-semibold">Choose a Scenario</h2>
        </div>
        {journalEntries.length > 0 && (
          <button
            onClick={() => setShowJournal(true)}
            className="text-gray-500 hover:text-gray-700 flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            View Journal
          </button>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {(Object.entries(scenarios) as [Scenario, typeof scenarios[Scenario]][]).map(([key, scenario]) => {
          const Icon = scenario.icon;
          return (
            <button
              key={key}
              onClick={() => {
                setSelectedScenario(key);
                setSelectedEmotions([]);
              }}
              className="p-6 rounded-xl text-left border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 transform hover:-translate-y-1 group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-2xl">{scenario.emoji}</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{scenario.title}</h3>
              <p className="text-gray-600">{scenario.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderStep = () => {
    if (showJournal) {
      return renderJournal();
    }

    if (currentStep === 1 && !selectedScenario) {
      return renderScenarioPicker();
    }

    if (!selectedScenario) return null;
    const scenario = scenarios[selectedScenario];

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-indigo-600">
              <Heart className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Scenario</h2>
            </div>
            <p className="text-gray-700">{scenario.description}</p>
            <p className="text-gray-700 font-medium">What do you think your friend might be feeling?</p>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {scenario.emotions.map(emotion => (
                <button
                  key={emotion}
                  onClick={() => handleEmotionToggle(emotion)}
                  className={`p-3 rounded-lg text-left ${
                    selectedEmotions.includes(emotion)
                      ? 'bg-indigo-100 border-indigo-300'
                      : 'bg-white border-gray-200'
                  } border transition-colors duration-200`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedEmotions.includes(emotion)}
                      onChange={() => {}}
                      className="rounded text-indigo-600"
                    />
                    {emotion}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-indigo-600">
              <ThumbsUp className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Great Reflection!</h2>
            </div>
            <p className="text-gray-700">{scenario.feedback}</p>
            <button
              onClick={() => setCurrentStep(3)}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-indigo-600">
              <MessageCircle className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Example Response</h2>
            </div>
            <div className="space-y-4">
              {scenario.sampleMessage.map((part, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-700 font-medium">{part.text}</p>
                  <p className="text-gray-500 text-sm mt-2">{part.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-indigo-600">
              <Send className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Write Your Message</h2>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-gray-600 text-sm mb-3">Try starting with:</p>
              <ul className="text-gray-600 text-sm list-disc list-inside space-y-1 mb-4">
                {scenario.prompts.map((prompt, index) => (
                  <li key={index}>{prompt}</li>
                ))}
              </ul>
              <textarea
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                className="w-full h-32 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Write your supportive message here..."
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-indigo-600">
              <Heart className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Reflection</h2>
            </div>
            <p className="text-gray-700">How did writing that message feel?</p>
            <div className="grid grid-cols-3 gap-3">
              {['Easy', 'Tough', 'Surprisingly good'].map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setReflection(option);
                    saveJournalEntry();
                  }}
                  className={`p-3 rounded-lg text-center ${
                    reflection === option
                      ? 'bg-indigo-100 border-indigo-300'
                      : 'bg-white border-gray-200'
                  } border transition-colors duration-200`}
                >
                  {option}
                </button>
              ))}
            </div>
            {reflection && (
              <div className="space-y-6">
                {hasSaved && (
                  <p className="text-green-600 text-sm font-medium">
                    Your message was saved to your progress journal.
                  </p>
                )}
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    Empathy takes practice — you're building a powerful skill. Keep showing up for others with understanding and care.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Your Message</h3>
                  <p className="text-gray-700 mb-4">{userMessage}</p>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy to clipboard
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={resetApp}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Start Over
                  </button>
                  <button
                    onClick={() => setShowJournal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    View Journal
                  </button>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto p-6">
        <header className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Empathy Coach Lite</h1>
          <p className="text-gray-600">Practice responding to difficult situations with empathy</p>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {renderStep()}
          
          {!showJournal && (
            <div className="mt-8 flex justify-between">
              {((currentStep > 1 && currentStep < 5) || (currentStep === 1 && selectedScenario)) && (
                <button
                  onClick={() => {
                    if (currentStep === 1) {
                      setSelectedScenario(null);
                    } else {
                      setCurrentStep((prev) => (prev - 1) as Step);
                    }
                  }}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Back
                </button>
              )}
              {currentStep < 5 && selectedEmotions.length > 0 && (
                <button
                  onClick={() => setCurrentStep((prev) => (prev + 1) as Step)}
                  className="ml-auto bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Continue
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
