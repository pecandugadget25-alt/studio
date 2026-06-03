'use server';
/**
 * @fileOverview Genkit flow untuk melakukan analisis mendalam individu siswa.
 * Menghasilkan laporan terperinci berbasis data realtime untuk kurikulum ETHNO-ARITH.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StudentDataSchema = z.object({
  nama: z.string(),
  level: z.number(),
  poin: z.number().describe('Total XP siswa'),
  badgeCount: z.number().describe('Jumlah lencana yang dimiliki'),
  completedModules: z.array(z.string()).describe('Daftar nama modul yang selesai'),
  unfinishedModules: z.array(z.string()).describe('Daftar nama modul yang belum selesai'),
  activitySummary: z.string().optional().describe('Ringkasan aktivitas terakhir siswa'),
});

const AnalysisOutputSchema = z.object({
  summary: z.string().describe('Ringkasan kemampuan numerasi dan budaya siswa.'),
  strengths: z.array(z.string()).describe('3-4 Kelebihan utama siswa.'),
  improvementAreas: z.array(z.string()).describe('3-4 Area yang perlu dikembangkan.'),
  teacherRecommendations: z.array(z.string()).describe('Saran konkret untuk Guru.'),
  prediction: z.string().describe('Prediksi perkembangan belajar siswa.'),
  riskLevel: z.enum(['aman', 'perhatian', 'risiko']).describe('Tingkat risiko akademik.'),
});

export type StudentAnalysisInput = z.infer<typeof StudentDataSchema>;
export type StudentAnalysisOutput = z.infer<typeof AnalysisOutputSchema>;

export async function analyzeStudentIndividually(input: StudentAnalysisInput): Promise<StudentAnalysisOutput> {
  return studentIndividualAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'studentIndividualAnalysisPrompt',
  input: { schema: StudentDataSchema },
  output: { schema: AnalysisOutputSchema },
  system: `Anda adalah Senior AI Education Consultant di platform ETHNO-ARITH.
  
Tugas Anda adalah menganalisis data progres siswa SD secara JUJUR, PERSONAL, dan DINAMIS berdasarkan data nyata. 
JANGAN gunakan template statis. Setiap siswa harus mendapatkan analisis berbeda.

LOGIKA ANALISIS:
1. Jika XP = 0 & Modul Selesai = 0: Analisis sebagai 'Fase Orientasi/Pemula'. Fokus pada motivasi memulai.
2. Jika XP > 0: Analisis 'Grafik Pertumbuhan'. Bahas bagaimana poin dikumpulkan.
3. Jika Badge Count >= 3: Berikan apresiasi atas 'Konsistensi Belajar' dan dedikasi.
4. Jika ada Unfinished Modules: Berikan rekomendasi spesifik untuk menyelesaikan materi tersebut.
5. Jika SEMUA modul selesai: Analisis sebagai 'Siswa Unggul/Pahlawan Numerasi'.

HASILKAN DALAM BAHASA INDONESIA YANG EDUKATIF DAN SUPORTIF.`,
  prompt: `Lakukan analisis mendalam untuk siswa berikut:
Nama: {{{nama}}}
Level: {{{level}}}
Total XP: {{{poin}}}
Jumlah Lencana: {{{badgeCount}}}
Modul Selesai: {{#each completedModules}}{{{this}}}, {{/each}}
Modul Belum Selesai: {{#each unfinishedModules}}{{{this}}}, {{/each}}
Riwayat Aktivitas: {{{activitySummary}}}

Instruksi Output:
- summary: Narasi singkat (2-3 kalimat) tentang profil belajar saat ini.
- strengths: Daftar poin kelebihan numerasi/budaya.
- improvementAreas: Daftar poin yang masih harus dipelajari (terutama modul yang belum selesai).
- teacherRecommendations: Langkah teknis untuk guru di kelas.
- prediction: Ramalan kemajuan jika pola belajar dipertahankan.`
});

const studentIndividualAnalysisFlow = ai.defineFlow(
  {
    name: 'studentIndividualAnalysisFlow',
    inputSchema: StudentDataSchema,
    outputSchema: AnalysisOutputSchema,
  },
  async input => {
    try {
      const { output } = await prompt(input);
      if (!output) throw new Error('AI failed to generate analysis');
      return output;
    } catch (error) {
      console.error('AI Analysis Error:', error);
      return {
        summary: "Siswa sedang berada dalam tahap awal eksplorasi numerasi budaya.",
        strengths: ["Memiliki akun aktif di platform"],
        improvementAreas: ["Memulai pengerjaan modul pertama"],
        teacherRecommendations: ["Berikan bimbingan langsung untuk memandu penggunaan aplikasi"],
        prediction: "Siswa akan segera berkembang setelah mencoba fitur Smart Scan.",
        riskLevel: "perhatian"
      };
    }
  }
);
