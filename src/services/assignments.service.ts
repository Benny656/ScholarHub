import type { Assignment, Quiz, QuizQuestion } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: 'a1',
    title: 'React Component Architecture',
    description: 'Design and implement a reusable component library with proper TypeScript types, props validation, and Storybook documentation.',
    courseId: 'c1',
    courseName: 'Full-Stack Web Development',
    dueDate: '2024-06-15T23:59:00Z',
    status: 'pending',
    priority: 'high',
    maxScore: 100,
    type: 'file',
  },
  {
    id: 'a2',
    title: 'ML Model Evaluation',
    description: 'Train and evaluate three different ML models on the provided dataset. Compare accuracy, precision, and recall.',
    courseId: 'c2',
    courseName: 'Machine Learning Fundamentals',
    dueDate: '2024-06-20T23:59:00Z',
    status: 'submitted',
    priority: 'medium',
    maxScore: 100,
    type: 'file',
    submittedAt: '2024-06-12T14:30:00Z',
    files: ['ml_evaluation.ipynb'],
  },
  {
    id: 'a3',
    title: 'UX Research Report',
    description: 'Conduct user interviews with 5 participants and synthesize findings into a comprehensive UX research report.',
    courseId: 'c3',
    courseName: 'UI/UX Design Masterclass',
    dueDate: '2024-06-08T23:59:00Z',
    status: 'graded',
    priority: 'high',
    maxScore: 100,
    score: 87,
    feedback: 'Excellent research methodology and clear presentation of findings. The affinity mapping was particularly insightful.',
    type: 'file',
    submittedAt: '2024-06-07T20:00:00Z',
  },
  {
    id: 'a4',
    title: 'Algorithm Challenge Set',
    description: 'Solve 10 algorithmic problems covering arrays, trees, and dynamic programming.',
    courseId: 'c4',
    courseName: 'Data Structures & Algorithms',
    dueDate: '2024-06-05T23:59:00Z',
    status: 'overdue',
    priority: 'high',
    maxScore: 100,
    type: 'quiz',
  },
  {
    id: 'a5',
    title: 'AWS Architecture Design',
    description: 'Design a scalable cloud architecture for a high-traffic e-commerce platform.',
    courseId: 'c5',
    courseName: 'Cloud Computing with AWS',
    dueDate: '2024-06-25T23:59:00Z',
    status: 'pending',
    priority: 'medium',
    maxScore: 100,
    type: 'text',
  },
  {
    id: 'a6',
    title: 'Penetration Testing Lab',
    description: 'Complete the security audit of the provided vulnerable web application.',
    courseId: 'c6',
    courseName: 'Cybersecurity Fundamentals',
    dueDate: '2024-06-18T23:59:00Z',
    status: 'submitted',
    priority: 'low',
    maxScore: 100,
    type: 'file',
    submittedAt: '2024-06-11T09:45:00Z',
  },
];

export const MOCK_QUIZ: Quiz = {
  id: 'q1',
  assignmentId: 'a4',
  title: 'Data Structures & Algorithms Final Quiz',
  questions: [
    {
      id: 'qq1',
      question: 'What is the time complexity of binary search on a sorted array of n elements?',
      options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
      correctAnswer: 1,
      explanation: 'Binary search halves the search space each iteration, resulting in O(log n) complexity.',
      points: 10,
    },
    {
      id: 'qq2',
      question: 'Which data structure uses LIFO (Last In, First Out) ordering?',
      options: ['Queue', 'Stack', 'Heap', 'Tree'],
      correctAnswer: 1,
      explanation: 'A stack processes elements in Last In, First Out order.',
      points: 10,
    },
    {
      id: 'qq3',
      question: 'What is the space complexity of merge sort?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      correctAnswer: 2,
      explanation: 'Merge sort requires O(n) additional space for the temporary arrays during merging.',
      points: 10,
    },
    {
      id: 'qq4',
      question: 'Which traversal visits nodes in sorted order for a Binary Search Tree?',
      options: ['Pre-order', 'Post-order', 'In-order', 'Level-order'],
      correctAnswer: 2,
      explanation: 'In-order traversal (left, root, right) visits BST nodes in ascending sorted order.',
      points: 10,
    },
    {
      id: 'qq5',
      question: 'What algorithm is most efficient for finding the shortest path in a weighted graph?',
      options: ["Breadth-First Search", "Depth-First Search", "Dijkstra's Algorithm", "Bubble Sort"],
      correctAnswer: 2,
      explanation: "Dijkstra's algorithm efficiently finds shortest paths in weighted graphs with non-negative weights.",
      points: 10,
    },
  ],
  timeLimit: 30,
  attempts: 0,
  maxAttempts: 2,
};

export const assignmentsService = {
  async getAssignments(userId: string): Promise<Assignment[]> {
    await delay(500);
    // In real app: GET /api/assignments?userId=...
    return MOCK_ASSIGNMENTS;
  },

  async getAssignmentById(id: string): Promise<Assignment> {
    await delay(400);
    const assignment = MOCK_ASSIGNMENTS.find(a => a.id === id);
    if (!assignment) throw new Error('Assignment not found');
    return assignment;
  },

  async submitAssignment(id: string, data: { text?: string; files?: File[] }): Promise<Assignment> {
    await delay(1000);
    const assignment = MOCK_ASSIGNMENTS.find(a => a.id === id);
    if (!assignment) throw new Error('Assignment not found');
    // In real app: POST /api/assignments/:id/submit
    return { ...assignment, status: 'submitted', submittedAt: new Date().toISOString() };
  },

  async getQuiz(assignmentId: string): Promise<Quiz> {
    await delay(400);
    // In real app: GET /api/assignments/:id/quiz
    return MOCK_QUIZ;
  },

  async submitQuiz(quizId: string, answers: Record<string, number>): Promise<{ score: number; total: number; results: Record<string, boolean> }> {
    await delay(800);
    let score = 0;
    const results: Record<string, boolean> = {};
    MOCK_QUIZ.questions.forEach(q => {
      const isCorrect = answers[q.id] === q.correctAnswer;
      results[q.id] = isCorrect;
      if (isCorrect) score += q.points;
    });
    const total = MOCK_QUIZ.questions.reduce((sum, q) => sum + q.points, 0);
    // In real app: POST /api/quiz/:id/submit
    return { score, total, results };
  },

  async getTeacherAssignments(teacherId: string): Promise<Assignment[]> {
    await delay(500);
    // In real app: GET /api/teacher/assignments
    return MOCK_ASSIGNMENTS;
  },

  async gradeAssignment(id: string, score: number, feedback: string): Promise<Assignment> {
    await delay(600);
    const assignment = MOCK_ASSIGNMENTS.find(a => a.id === id);
    if (!assignment) throw new Error('Assignment not found');
    // In real app: PUT /api/assignments/:id/grade
    return { ...assignment, status: 'graded', score, feedback };
  },
};
