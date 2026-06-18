import { supabase } from '../lib/supabase';

function mapDBCertificateToFrontend(dbCert: any): any {
  return {
    id: dbCert.id,
    studentName: dbCert.users?.name || 'Student',
    courseName: dbCert.courses?.title || 'Course',
    instructorName: dbCert.courses?.users?.name || 'Instructor',
    issuedDate: dbCert.issued_at ? dbCert.issued_at.split('T')[0] : '',
    verificationCode: dbCert.id.substring(0, 8).toUpperCase(),
    qrCode: dbCert.qr_code || '',
  };
}

export const certificatesService = {
  async generateCertificate(studentId: string, courseId: string, studentName: string, courseName: string, institutionType: string): Promise<any> {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    const response = await fetch(`${API_URL}/api/certificates/mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentId,
        courseId,
        studentName,
        courseName,
        institutionType
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to mint certificate');
    }
    
    const result = await response.json();
    
    // We fetch the latest certificate directly from Supabase since the backend inserted it
    const { data, error } = await supabase
      .from('certificates')
      .select('*, users(name), courses(title, users(name))')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    
    const mapped = mapDBCertificateToFrontend(data);
    // Add the specific URL if needed, although mapped object might just use the old structure for the UI
    return { ...mapped, pdfUrl: result.certificateUrl };
  },

  async verifyCertificate(certificateId: string): Promise<any> {
    const { data, error } = await supabase
      .from('certificates')
      .select('*, users(name), courses(title, users(name))')
      .eq('id', certificateId)
      .single();

    if (error) throw error;
    return mapDBCertificateToFrontend(data);
  },

  async getCertificates(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('certificates')
      .select('*, users(name), courses(title, users(name))')
      .eq('student_id', userId);

    if (error) throw error;
    if (!data) return [];
    return data.map(mapDBCertificateToFrontend);
  },

  async downloadCertificate(certificateId: string): Promise<void> {
    // Mock file download
    console.log(`Downloading certificate: ${certificateId}`);
  }
};
