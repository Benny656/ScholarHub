import type { Certificate } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_CERTIFICATES: Certificate[] = [
  {
    id: 'cert1',
    studentId: 'u1',
    studentName: 'Alex Johnson',
    courseId: 'c3',
    courseTitle: 'UI/UX Design Masterclass',
    issueDate: '2024-06-07',
    verificationCode: 'NXL-2024-CERT-UXD-7A3B',
    instructorName: 'Emma Lawson',
    grade: 'A+',
  },
  {
    id: 'cert2',
    studentId: 'u1',
    studentName: 'Alex Johnson',
    courseId: 'c4',
    courseTitle: 'Data Structures & Algorithms',
    issueDate: '2024-04-15',
    verificationCode: 'NXL-2024-CERT-DSA-9C2D',
    instructorName: 'Dr. Sarah Chen',
    grade: 'B+',
  },
];

export const certificatesService = {
  async getCertificates(userId: string): Promise<Certificate[]> {
    await delay(500);
    // In real app: GET /api/certificates/student/:userId
    return MOCK_CERTIFICATES.filter(c => c.studentId === userId);
  },

  async generateCertificate(userId: string, courseId: string): Promise<Certificate> {
    await delay(1500); // Simulate generation time
    const cert: Certificate = {
      id: `cert-${Date.now()}`,
      studentId: userId,
      studentName: 'Alex Johnson',
      courseId,
      courseTitle: 'Full-Stack Web Development Bootcamp',
      issueDate: new Date().toISOString().split('T')[0],
      verificationCode: `NXL-2024-CERT-WEB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      instructorName: 'Dr. Sarah Chen',
      grade: 'A',
    };
    // In real app: POST /api/certificates/generate
    return cert;
  },

  async verifyCertificate(certId: string): Promise<{ valid: boolean; certificate?: Certificate }> {
    await delay(600);
    const cert = MOCK_CERTIFICATES.find(c => c.id === certId || c.verificationCode === certId);
    // In real app: GET /api/certificates/verify/:certId (public endpoint)
    if (cert) return { valid: true, certificate: cert };
    return { valid: false };
  },

  async downloadCertificate(certId: string): Promise<{ url: string }> {
    await delay(800);
    // In real app: GET /api/certificates/:id/download (returns PDF blob URL)
    return { url: `#mock-certificate-pdf-${certId}` };
  },
};
