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
  async generateCertificate(studentId: string, courseId: string): Promise<any> {
    const qrCode = `nexlearn://verify/${studentId}-${courseId}`;
    const { data, error } = await supabase
      .from('certificates')
      .insert({
        student_id: studentId,
        course_id: courseId,
        qr_code: qrCode,
      })
      .select('*, users(name), courses(title, users(name))')
      .single();

    if (error) throw error;
    return mapDBCertificateToFrontend(data);
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
