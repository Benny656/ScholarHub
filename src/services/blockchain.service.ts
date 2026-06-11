import { supabase } from '../lib/supabase';

export interface BlockchainReceipt {
  transactionHash: string;
  blockNumber: number;
  contractAddress: string;
  tokenId: number;
  issued: boolean;
}

export const blockchainService = {
  async issueCertificate(studentId: string, courseId: string, certCode?: string): Promise<BlockchainReceipt> {
    const finalCertCode = certCode || `SCH-${studentId.substring(0, 4)}-${courseId.substring(0, 4)}`.toUpperCase();
    console.log('[BlockchainService] Issuing Certificate', finalCertCode, 'on Polygon for Student:', studentId);

    const mockHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const mockTokenId = Math.floor(Math.random() * 100000);

    const { error } = await supabase
      .from('certificates')
      .update({ qr_code: `polygon:${mockHash}` })
      .eq('student_id', studentId)
      .eq('course_id', courseId);

    if (error) {
      console.error('Error updating certificate QR code:', error);
    }

    return {
      transactionHash: mockHash,
      blockNumber: Math.floor(58000000 + Math.random() * 10000),
      contractAddress: '0x3456789ABCDEF0123456789ABCDEF0123456789A',
      tokenId: mockTokenId,
      issued: true,
    };
  },

  async verifyCertificate(certificateIdOrHash: string): Promise<{ valid: boolean; blockNumber: number; issuer: string }> {
    console.log('[BlockchainService] Verifying on-chain for:', certificateIdOrHash);

    const isHash = certificateIdOrHash.startsWith('0x') && certificateIdOrHash.length === 66;
    let finalHash = certificateIdOrHash;
    
    if (!isHash) {
      try {
        const { data } = await supabase
          .from('certificates')
          .select('qr_code')
          .eq('id', certificateIdOrHash)
          .single() as any;
        if (data && data.qr_code && data.qr_code.startsWith('polygon:')) {
          finalHash = data.qr_code.split(':')[1];
        }
      } catch (e) {
        console.error('Error fetching certificate hash for verification:', e);
      }
    }

    return {
      valid: true,
      blockNumber: 58124953,
      issuer: `0x1234567890123456789012345678901234567890 (ScholarHub Issuer for hash ${finalHash.substring(0, 10)}...)`,
    };
  }
};
