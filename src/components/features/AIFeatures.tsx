import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Send, 
  BookOpen, 
  Award, 
  Settings, 
  CheckCircle, 
  AlertTriangle, 
  ShieldAlert,
  Loader,
  Brain,
  X,
  Play,
  RotateCcw,
  Check,
  ChevronRight,
  FileCheck,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  sender: "student" | "ai";
  text: string;
  timestamp: string;
}

interface Question {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

interface QuizData {
  title: string;
  description: string;
  questions: Question[];
}

interface GraderReport {
  grade: string;
  plagiarismRisk: number;
  aiLikelihood: number;
  critique: string;
  plagiarismDetails: string;
  checklist: string[];
}

export default function AIFeatures() {
  const [activeSubTab, setActiveSubTab] = useState<"tutor" | "quiz" | "grader">("tutor");
  
  // 1. AI Tutor states
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: "Hello! I am your ScholarHub Personalized AI Tutor, trained to master chemistry, physics, logic, or computer science. What subject shall we break down today?",
      timestamp: "Today, Morning"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTutorLoading, setIsTutorLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 2. AI Quiz Generator states
  const [topic, setTopic] = useState("Quantum Superposition Principles");
  const [difficulty, setDifficulty] = useState("college");
  const [isQuizGenerating, setIsQuizGenerating] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<QuizData | null>(null);
  
  // Active playing quiz records
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [quizLocked, setQuizLocked] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // 3. AI Autograder states
  const [assignmentTitle, setAssignmentTitle] = useState("Research Outline: Renewable Solar Cell Efficiency");
  const [rubricExpectation, setRubricExpectation] = useState("Scientific accuracy, AP chemistry standards, clear methodologies.");
  const [submissionText, setSubmissionText] = useState(
    "Renewable solar grids generally focus on Silicon photo-voltaic receptors. However, recent developments in Perovskite lattices suggest potential conversion metrics exceeding 28.5%. Perovskite compounds demonstrate crystal-phase variables that respond exceptionally to wide-band wavelengths, offsetting thermal energy dissipations that limit older cell panels."
  );
  const [isGraderLoading, setIsGraderLoading] = useState(false);
  const [graderReport, setGraderReport] = useState<GraderReport | null>(null);
  const [checkedCheckpoints, setCheckedCheckpoints] = useState<Record<number, boolean>>({});

  // Auto Scroll Chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle Tutor Chat Submit
  const handleSendTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "student",
      text: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTutorLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat-tutor",
          payload: {
            message: userMsg.text,
            history: messages.slice(-6)
          }
        })
      });

      const data = await response.json();
      
      let replyText = "";
      if (data.isDemoFallback) {
        replyText = `**[DEMO MODE FALLBACK]** \nI'm answering here using localized logic because your \`GEMINI_API_KEY\` is not set yet in AI Studio Secrets. Once configured, you'll receive dynamic, live responses directly from Gemini! \n\n*Review on "${userMsg.text}":* That is a fascinating inquiry! Generally, academic workflows emphasize starting from first-principles (e.g., breaking down variables, setting hypotheses, testing with controls). Would you like to generate an interactive quiz on this topic to test yourself?`;
      } else if (data.error) {
        replyText = `Error: ${data.error}`;
      } else {
        replyText = data.text;
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }]);

    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "I experienced an error connecting to the backend. Please verify your server logs or configure GEMINI_API_KEY.",
        timestamp: "Now"
      }]);
    } finally {
      setIsTutorLoading(false);
    }
  };

  // Handle Quiz Request
  const handleGenerateQuiz = async () => {
    if (!topic.trim()) return;
    setIsQuizGenerating(true);
    setActiveQuiz(null);
    setQuizFinished(false);
    setCurrentQuestionIndex(0);
    setCorrectAnswersCount(0);
    setQuizLocked(false);
    setSelectedOptionIndex(null);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-quiz",
          payload: { topic, difficulty }
        })
      });

      const data = await response.json();
      
      if (data.isDemoFallback) {
        // Fallback mockup quiz
        const mockQuiz: QuizData = {
          title: `Quiz: ${topic}`,
          description: `Localized demonstration assessment of ${topic} concepts.`,
          questions: [
            {
              question: `Which principal term best defines core elements of ${topic}?`,
              options: [
                "Quantized baseline parameters",
                "Entropy variables in micro-environments",
                "Non-linear interference vectors",
                "Thermal dissipation limits"
              ],
              answerIndex: 0,
              explanation: "Primary studies show quantized baseline parameters stabilize molecular fields under experimental testing."
            },
            {
              question: "What primary mathematical tool is used to formulate this topic?",
              options: [
                "Gaussian distribution analysis",
                "Hermitian matrix coordinates",
                "Lagrangian perturbation factors",
                "Fourier transform quotients"
              ],
              answerIndex: 1,
              explanation: "Hermitian matrix structures map complex values directly into predictable real-number observations."
            },
            {
              question: "Which boundary condition typically restricts experimental verification?",
              options: [
                "Ambient air moisture factors",
                "Detector efficiency boundaries",
                "Relative humidity in the room",
                "The observer effect and quantum noise"
              ],
              answerIndex: 3,
              explanation: "The observer effect modifies targeted energy registers, making direct measurements highly volatile."
            },
            {
              question: "What is the primary academic significance of analyzing this concept?",
              options: [
                "Increasing commercial battery lifespan",
                "Providing a foundation for sub-molecular engineering",
                "Minimizing web browser memory usage",
                "Automating spreadsheet calculation routines"
              ],
              answerIndex: 1,
              explanation: "Sub-molecular physics relies heavily on these verified models to develop quantum computation gates."
            }
          ]
        };
        setActiveQuiz(mockQuiz);
      } else if (data.quiz) {
        setActiveQuiz(data.quiz);
      } else {
        alert("Unexpected error parsing AI response. Try again.");
      }

    } catch (err) {
      console.error(err);
      alert("Fail to connect to quiz generator API. Check server console.");
    } finally {
      setIsQuizGenerating(false);
    }
  };

  // Lock MCQ Option Choice
  const handleLockOption = (optId: number) => {
    if (quizLocked) return;
    setSelectedOptionIndex(optId);
  };

  const handleConfirmAnswer = () => {
    if (selectedOptionIndex === null || quizLocked) return;
    
    setQuizLocked(true);
    const correctIdx = activeQuiz?.questions[currentQuestionIndex].answerIndex;
    if (selectedOptionIndex === correctIdx) {
      setCorrectAnswersCount(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (!activeQuiz) return;
    
    if (currentQuestionIndex + 1 < activeQuiz.questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptionIndex(null);
      setQuizLocked(false);
    } else {
      setQuizFinished(true);
    }
  };

  const restartQuizGame = () => {
    setQuizFinished(false);
    setCurrentQuestionIndex(0);
    setCorrectAnswersCount(0);
    setQuizLocked(false);
    setSelectedOptionIndex(null);
  };

  // Run AI Autograder
  const handleRunGrader = async () => {
    if (!submissionText.trim()) return;
    setIsGraderLoading(true);
    setGraderReport(null);
    setCheckedCheckpoints({});

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "check-assignment",
          payload: {
            title: assignmentTitle,
            submission: submissionText,
            instructions: rubricExpectation
          }
        })
      });

      const data = await response.json();

      if (data.isDemoFallback) {
        const mockReport: GraderReport = {
          grade: "88% (B+)",
          plagiarismRisk: 4,
          aiLikelihood: 12,
          critique: "The draft presents solid core metrics regarding perovskite crystal-lattice systems. It starts well by introducing photo-voltaic limits and details wide-band advantages. However, the methodology section needs clear references, and the thermodynamic variables should be structured more cleanly. Incorporating the exact heat tolerance limits will significantly improve credibility.",
          plagiarismDetails: "No notable online matches. Excellent original research parameters identified.",
          checklist: [
            "Outline clear thermodynamic heat limits under standard solar rays (1000W/m²)",
            "Cite at least 2 peer-review papers on wide-band wavelength efficiency gains",
            "Separate the introduction from methodology into clear paragraph partitions",
            "Define the synthesis parameters used for compiling crystal phases"
          ]
        };
        setGraderReport(mockReport);
      } else if (data.report) {
        setGraderReport(data.report);
      } else {
        alert("Autograding report structure error. Try again.");
      }

    } catch (err) {
      console.error(err);
      alert("Error reaching Grader endpoint.");
    } finally {
      setIsGraderLoading(false);
    }
  };

  const toggleCheckpoint = (id: number) => {
    setCheckedCheckpoints(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="bg-[#FFFCE1] rounded-3xl border border-[#E1DCC9]/20 overflow-hidden dark:bg-[#412D15] dark:border-[#412D15] shadow-sm">
      
      {/* Sub Tabs Selection Header */}
      <div className="border-b border-[#E1DCC9]/20 bg-[#FFFCE1] px-6 py-3 flex gap-2 dark:bg-[#412D15] dark:border-neutral-850">
        <button
          onClick={() => setActiveSubTab("tutor")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === "tutor"
              ? "bg-[#FFFCE1] text-brand-primary shadow-sm dark:bg-[#412D15] dark:text-[#E1DCC9]"
              : "text-[#7c7c6f] hover:text-[#7c7c6f] dark:hover:text-[#7c7c6f]"
          }`}
        >
          🎓 AI Study Tutor
        </button>

        <button
          onClick={() => setActiveSubTab("quiz")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === "quiz"
              ? "bg-[#FFFCE1] text-brand-primary shadow-sm dark:bg-[#412D15] dark:text-[#E1DCC9]"
              : "text-[#7c7c6f] hover:text-[#7c7c6f] dark:hover:text-[#7c7c6f]"
          }`}
        >
          ⚡ Dynamic Quiz Station
        </button>

        <button
          onClick={() => setActiveSubTab("grader")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === "grader"
              ? "bg-[#FFFCE1] text-brand-primary shadow-sm dark:bg-[#412D15] dark:text-[#E1DCC9]"
              : "text-[#7c7c6f] hover:text-[#7c7c6f] dark:hover:text-[#7c7c6f]"
          }`}
        >
          🔍 Homework & Essay Grader
        </button>
      </div>

      <div className="p-6">
        
        {/* TAB 1: PERSOLNALIZED AI TUTOR */}
        {activeSubTab === "tutor" && (
          <div className="space-y-4">
            
            {/* Header info */}
            <div className="p-3 bg-[#FFFCE1] text-[#7c7c6f] rounded-xl flex items-center gap-3 dark:bg-[#412D15]/40 dark:text-[#7c7c6f] border border-[#E1DCC9]/40 dark:border-[#412D15]">
              <Sparkles className="w-5 h-5 text-brand-primary shrink-0" />
              <p className="text-xs">
                Your Tutor uses **Gemini-3.5-flash** to breakdown advanced topics into step-by-step concepts with formulas.
              </p>
            </div>

            {/* Chat Box Container */}
            <div className="h-96 border border-[#E1DCC9]/20 rounded-3xl p-4 overflow-y-auto flex flex-col gap-3 custom-scrollbar bg-[#FFFCE1]/10 dark:border-[#412D15] dark:bg-[#1F150C]/20">
              {messages.map((msg) => {
                const isAI = msg.sender === "ai";
                return (
                  <div
                    key={msg.id}
                    className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isAI
                        ? "bg-[#FFFCE1] text-[#0e100f] self-start rounded-tl-none dark:bg-neutral-850 dark:text-neutral-200"
                        : "bg-brand-primary text-[#E1DCC9] self-end rounded-tr-none shadow-sm shadow-brand-primary/10"
                    }`}
                  >
                    {/* Render markdown style lines simply */}
                    {msg.text.split("\n").map((line, idx) => (
                      <p key={idx} className={line.startsWith("*") || line.startsWith("-") ? "pl-2 py-0.5" : "py-0.5"}>
                        {line.replace(/\*\*/g, "").replace(/\*/g, "")}
                      </p>
                    ))}
                    <span className={`block text-[9px] mt-1 text-right ${isAI ? "text-[#7c7c6f]" : "text-neutral-200"}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                );
              })}
              {isTutorLoading && (
                <div className="bg-[#FFFCE1] text-[#7c7c6f] rounded-xl p-3 self-start border border-[#E1DCC9]/20 flex items-center gap-2 dark:bg-[#412D15]/40 dark:border-[#412D15]">
                  <Loader className="w-3.5 h-3.5 animate-spin text-brand-primary" />
                  <span className="text-[10px]">Tutor is analyzing details...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input controls form */}
            <form onSubmit={handleSendTutor} className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything: Explain nuclear fusion simply, solve high school matrices, etc..."
                className="flex-1 px-4 py-3 border border-[#E1DCC9]/20 rounded-xl text-xs bg-[#FFFCE1] dark:bg-[#412D15] dark:border-[#412D15] dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
              <button
                type="submit"
                disabled={isTutorLoading || !inputValue.trim()}
                className="px-5 bg-brand-primary text-[#E1DCC9] rounded-xl hover:bg-brand-primary-dark transition-all flex items-center justify-center disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        )}

        {/* TAB 2: DYNAMIC QUIZ STATION */}
        {activeSubTab === "quiz" && (
          <div className="space-y-6">
            
            {/* Setting parameters when NO quiz is loaded or playing */}
            {!activeQuiz && !isQuizGenerating && (
              <div className="max-w-xl space-y-4">
                <div>
                  <h4 className="font-serif font-bold text-lg text-[#0e100f] dark:text-[#E1DCC9]">
                    Syllabus MCQ Examination Engine
                  </h4>
                  <p className="text-xs text-[#7c7c6f]">
                    Type any curriculum topic (e.g., Photosynthesis, Algebra, Cold War Chemistry). The system will compile a specialized interactive quiz with explanations for each option.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#7c7c6f] dark:text-[#7c7c6f]">Topic of Choice</label>
                    <input
                      type="text"
                      className="w-full px-3.5 py-2.5 border border-[#E1DCC9]/20 rounded-lg text-xs bg-[#FFFCE1] dark:bg-[#412D15] dark:border-[#412D15] dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#7c7c6f] dark:text-[#7c7c6f]">Target Level</label>
                    <select
                      className="w-full px-3.5 py-2.5 border border-[#E1DCC9]/20 rounded-lg text-xs bg-[#FFFCE1] dark:bg-[#412D15] dark:border-[#412D15] dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                    >
                      <option value="school">Preparatory School Grade</option>
                      <option value="college">Advanced University Scholar</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleGenerateQuiz}
                  className="px-5 py-2.5 bg-brand-primary text-[#E1DCC9] rounded-lg hover:bg-brand-primary-dark font-semibold text-xs flex items-center gap-2"
                >
                  <Brain className="w-4 h-4" />
                  <span>Generate Course Quiz</span>
                </button>
              </div>
            )}

            {/* Loading Indicator */}
            {isQuizGenerating && (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <Loader className="w-8 h-8 animate-spin text-brand-primary" />
                <p className="text-xs text-[#7c7c6f] dark:text-[#7c7c6f] font-medium">
                  Gemini is constructing structured questions, option pairs, and answer rubrics. Please stand by...
                </p>
              </div>
            )}

            {/* Active Quiz Play Panel */}
            {activeQuiz && !isQuizGenerating && (
              <div className="space-y-6">
                
                {/* Score or Progress indicator */}
                <div className="flex justify-between items-center bg-[#FFFCE1] dark:bg-[#412D15] p-4 rounded-xl border border-[#E1DCC9]/40 dark:border-[#412D15]">
                  <div>
                    <h5 className="font-serif font-bold text-[#0e100f] dark:text-[#E1DCC9] text-sm leading-none">
                      {activeQuiz.title}
                    </h5>
                    <p className="text-[10px] text-[#7c7c6f] mt-1">{activeQuiz.description}</p>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-[10px] font-mono leading-none tracking-wider text-[#7c7c6f] uppercase block font-bold">
                      Progress Score
                    </span>
                    <strong className="font-sans text-sm text-brand-primary dark:text-brand-tertiary font-extrabold uppercase">
                      {!quizFinished ? `Q# ${currentQuestionIndex + 1} / ${activeQuiz.questions.length}` : "Completed"}
                    </strong>
                  </div>
                </div>

                {!quizFinished ? (
                  <div className="space-y-6">
                    
                    {/* Active Question Title Card */}
                    <div className="p-5 border border-brand-primary/20 bg-brand-primary/5 rounded-xl">
                      <p className="text-[9px] font-bold text-[#7c7c6f] dark:text-[#7c7c6f] uppercase tracking-wide leading-none mb-1.5">
                        Question {currentQuestionIndex + 1}
                      </p>
                      <h4 className="font-serif text-sm font-bold text-[#0e100f] dark:text-[#E1DCC9]">
                        {activeQuiz.questions[currentQuestionIndex].question}
                      </h4>
                    </div>

                    {/* Options list selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activeQuiz.questions[currentQuestionIndex].options.map((option, idx) => {
                        const isSelected = selectedOptionIndex === idx;
                        const isCorrect = idx === activeQuiz.questions[currentQuestionIndex].answerIndex;
                        
                        let cardStyle = "border-[#E1DCC9]/20 bg-[#FFFCE1] hover:bg-[#FFFCE1] dark:border-[#412D15] dark:bg-[#412D15]";
                        if (isSelected) {
                          cardStyle = "border-brand-primary bg-[#FFFCE1]/50 ring-1 ring-brand-primary dark:bg-[#412D15]";
                        }
                        if (quizLocked) {
                          if (isCorrect) {
                            cardStyle = "border-[#00bae2] bg-[#00bae2]/40 text-[#00bae2] font-bold dark:bg-[#00bae2]/20 dark:text-[#00bae2]";
                          } else if (isSelected) {
                            cardStyle = "border-red-500 bg-red-500/40 text-red-500 dark:bg-red-500/20 dark:text-red-500";
                          }
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleLockOption(idx)}
                            disabled={quizLocked}
                            className={`p-4 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${cardStyle}`}
                          >
                            <span>{option}</span>
                            {quizLocked && isCorrect && <CheckCircle className="w-4 h-4 text-[#00bae2] shrink-0 ml-2" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Lock and next navigation triggers */}
                    <div className="flex justify-between items-center">
                      <button
                        onClick={restartQuizGame}
                        className="text-xs text-[#7c7c6f] hover:text-[#0e100f] dark:text-[#7c7c6f] dark:hover:text-neutral-200 font-semibold"
                      >
                        Exit Quiz
                      </button>

                      <div className="flex items-center gap-3">
                        {selectedOptionIndex !== null && !quizLocked && (
                          <button
                            onClick={handleConfirmAnswer}
                            className="px-4 py-2 bg-brand-primary text-[#E1DCC9] text-xs font-bold rounded-lg hover:bg-brand-primary-dark transition"
                          >
                            Lock Answer
                          </button>
                        )}

                        {quizLocked && (
                          <button
                            onClick={handleNextQuestion}
                            className="px-4 py-2 bg-[#412D15] text-[#E1DCC9] text-xs font-bold rounded-lg hover:bg-neutral-850 dark:bg-[#FFFCE1] dark:text-neutral-950 transition flex items-center gap-1"
                          >
                            <span>
                              {currentQuestionIndex + 1 < activeQuiz.questions.length ? "Next Question" : "View Scorecard"}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Explanatory insights shown of selection lock */}
                    {quizLocked && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-amber-500 text-amber-500 border border-amber-500/40 rounded-xl text-xs space-y-1.5 dark:bg-amber-500/20 dark:text-amber-500"
                      >
                        <strong className="block text-[10px] uppercase font-bold tracking-wider">
                          Explanation Key
                        </strong>
                        <p>{activeQuiz.questions[currentQuestionIndex].explanation}</p>
                      </motion.div>
                    )}

                  </div>
                ) : (
                  // Quiz Finished Scorecard Screen
                  <div className="py-6 text-center space-y-6 max-w-md mx-auto">
                    <div className="w-20 h-20 rounded-full bg-amber-500 text-amber-500 flex items-center justify-center mx-auto border-2 border-amber-500">
                      <Award className="w-12 h-12" />
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-serif font-bold text-xl text-[#0e100f] dark:text-[#E1DCC9]">
                        Exam Session Complete
                      </h4>
                      <p className="text-xs text-[#7c7c6f]">
                        You successfully registered a scoring matrix on this dynamic session.
                      </p>
                    </div>

                    <div className="p-4 bg-[#FFFCE1] dark:bg-[#412D15] rounded-2xl border border-[#E1DCC9]/20 flex items-center justify-between">
                      <span className="text-xs text-[#7c7c6f] dark:text-[#7c7c6f] font-semibold">Correct Responses</span>
                      <strong className="text-xl font-sans text-brand-primary">
                        {correctAnswersCount} / {activeQuiz.questions.length}
                      </strong>
                    </div>

                    <div className="flex gap-4 p-2 justify-center">
                      <button
                        onClick={restartQuizGame}
                        className="px-4 py-2 bg-brand-primary text-[#E1DCC9] text-xs font-bold rounded-lg hover:bg-brand-primary-dark transition"
                      >
                        Try Again
                      </button>
                      <button
                        onClick={() => setActiveQuiz(null)}
                        className="px-4 py-2 bg-[#FFFCE1] text-[#7c7c6f] text-xs font-bold rounded-lg hover:bg-neutral-200 dark:bg-[#412D15] dark:text-[#7c7c6f] dark:hover:bg-neutral-700 transition"
                      >
                        Compile Different Topic
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* TAB 3: ESSAY & ASSIGNMENT GRADER */}
        {activeSubTab === "grader" && (
          <div className="space-y-6">
            
            {/* Setting config form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-serif font-bold text-base text-[#0e100f] dark:text-[#E1DCC9]">
                    Rubric Grader & AI Editor
                  </h4>
                  <p className="text-xs text-[#7c7c6f]">
                    Paste homework essays, program codes, or labs. Enter standard expectation guidelines and get an instant professional rubric review.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#7c7c6f] dark:text-[#7c7c6f]">Assignment Headline / Title</label>
                  <input
                    type="text"
                    className="w-full px-3.5 py-2.5 border border-[#E1DCC9]/20 rounded-lg text-xs bg-[#FFFCE1] dark:bg-[#412D15] dark:border-[#412D15] dark:text-neutral-200 focus:outline-none"
                    value={assignmentTitle}
                    onChange={(e) => setAssignmentTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#7c7c6f] dark:text-[#7c7c6f]">Evaluation Rubrics & Grading Norms</label>
                  <textarea
                    rows={2}
                    className="w-full p-3 border border-[#E1DCC9]/20 rounded-lg text-xs bg-[#FFFCE1] dark:bg-[#412D15] dark:border-[#412D15] dark:text-neutral-200 focus:outline-none"
                    value={rubricExpectation}
                    onChange={(e) => setRubricExpectation(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#7c7c6f] dark:text-[#7c7c6f]">Student Submission Text</label>
                  <textarea
                    rows={6}
                    className="w-full p-3 border border-[#E1DCC9]/20 rounded-lg text-xs bg-[#FFFCE1] dark:bg-[#412D15] dark:border-[#412D15] dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleRunGrader}
                  disabled={isGraderLoading || !submissionText.trim()}
                  className="px-5 py-2.5 bg-brand-primary text-[#E1DCC9] rounded-lg hover:bg-brand-primary-dark font-semibold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {isGraderLoading ? (
                    <>
                      <Loader className="w-3.5 h-3.5 animate-spin" />
                      <span>Copilot is inspecting drafts...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Analyze Draft Homework</span>
                    </>
                  )}
                </button>
              </div>

              {/* REPORT CARD DISPLAY SIDE */}
              <div className="border border-[#E1DCC9]/20 rounded-2xl bg-[#FFFCE1]/40 p-6 dark:border-neutral-850 dark:bg-[#412D15]/40 flex flex-col justify-center min-h-[300px]">
                
                {isGraderLoading && (
                  <div className="text-center py-12 space-y-3">
                    <Loader className="w-7 h-7 animate-spin text-brand-primary mx-auto" />
                    <p className="text-xs text-[#7c7c6f] font-medium">
                      Gemini is compiling plagiarism scans, AI indicators, suggested weights, and structural feedback notes...
                    </p>
                  </div>
                )}

                {!graderReport && !isGraderLoading && (
                  <div className="text-center py-12 text-[#7c7c6f] space-y-1.5">
                    <Brain className="w-10 h-10 text-[#7c7c6f] mx-auto" />
                    <p className="text-xs font-medium">Ready to inspect scholastic works.</p>
                  </div>
                )}

                {graderReport && !isGraderLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6 text-xs"
                  >
                    
                    {/* Header score indices */}
                    <div className="grid grid-cols-3 gap-3">
                      
                      {/* Metric 1 */}
                      <div className="p-3 bg-[#FFFCE1] border border-[#E1DCC9]/20 rounded-xl dark:bg-[#412D15] dark:border-neutral-850">
                        <span className="text-[9px] uppercase tracking-wider text-[#7c7c6f] block font-bold">Suggested GPA</span>
                        <strong className="text-lg font-sans text-brand-primary text-brand-secondary">{graderReport.grade}</strong>
                      </div>

                      {/* Metric 2 */}
                      <div className="p-3 bg-[#FFFCE1] border border-[#E1DCC9]/20 rounded-xl dark:bg-[#412D15] dark:border-neutral-850">
                        <span className="text-[9px] uppercase tracking-wider text-[#7c7c6f] block font-bold flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3 text-[#00bae2]" />
                          <span>Plagiarism Risk</span>
                        </span>
                        <strong className="text-lg font-sans text-[#00bae2] block">
                          {graderReport.plagiarismRisk}%
                        </strong>
                      </div>

                      {/* Metric 3 */}
                      <div className="p-3 bg-[#FFFCE1] border border-[#E1DCC9]/20 rounded-xl dark:bg-[#412D15] dark:border-neutral-850">
                        <span className="text-[9px] uppercase tracking-wider text-[#7c7c6f] block font-bold">AI Probability</span>
                        <strong className="text-lg font-sans text-[#7c7c6f] dark:text-[#7c7c6f] block">
                          {graderReport.aiLikelihood}%
                        </strong>
                      </div>

                    </div>

                    {/* Critique Text description */}
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase tracking-wider text-[#7c7c6f] block font-bold">Autograder Critique</span>
                      <p className="p-4 bg-[#FFFCE1] border border-[#E1DCC9]/20 rounded-xl text-[#7c7c6f] leading-relaxed dark:bg-[#412D15] dark:text-[#7c7c6f] dark:border-[#412D15]">
                        {graderReport.critique}
                      </p>
                    </div>

                    {/* Interactive improvement checkpoints checklist */}
                    {graderReport.checklist && graderReport.checklist.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[9px] uppercase tracking-wider text-[#7c7c6f] block font-bold">
                          Step-by-Step Improvement Checklists
                        </span>
                        
                        <div className="space-y-1.5 font-sans font-medium">
                          {graderReport.checklist.map((task, index) => {
                            const isChecked = !!checkedCheckpoints[index];
                            return (
                              <button
                                key={index}
                                onClick={() => toggleCheckpoint(index)}
                                className="w-full flex items-start gap-2.5 p-2 bg-[#FFFCE1] hover:bg-[#FFFCE1] rounded-lg border border-[#E1DCC9]/40 text-left transition text-[11px] text-[#7c7c6f] dark:bg-[#412D15] dark:border-[#412D15] dark:text-[#7c7c6f]"
                              >
                                <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                                  isChecked 
                                    ? "bg-brand-primary border-brand-primary text-[#E1DCC9]" 
                                    : "border-neutral-300 bg-[#FFFCE1]"
                                }`}>
                                  {isChecked && <Check className="w-3 h-3" />}
                                </span>
                                <span className={isChecked ? "line-through text-[#7c7c6f]" : ""}>{task}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </motion.div>
                )}

              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
