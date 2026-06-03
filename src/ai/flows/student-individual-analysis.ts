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
  completedModules: z.array(z.string()).describe('Daftar nama modul yang SELESAI'),
  unfinishedModules: z.array(z.string()).describe('Daftar nama modul yang BELUM selesai'),
  activitySummary: z.string().optional().describe('Ringkasan aktivitas terakhir siswa'),
});

const AnalysisOutputSchema = z.object({
  summary: z.string().describe('Ringkasan kemampuan numerasi dan budaya siswa.'),
  strengths: z.array(z.string()).describe('3-4 Kelebihan utama siswa (sebutkan nama modul).'),
  improvementAreas: z.array(z.string()).describe('3-4 Area yang perlu dikembangkan (sebutkan modul yang belum selesai).'),
  teacherRecommendations: z.array(z.string()).describe('Saran konkret untuk Guru berdasarkan modul spesifik.'),
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
  
Tugas Anda adalah menganalisis data progres siswa secara FAKTUAL, JUJUR, dan DINAMIS.
JANGAN gunakan template statis atau kalimat generik seperti "siswa aktif", "siswa berkembang", atau "memiliki semangat".

ATURAN WAJIB:
1. SEBUTKAN NAMA MODUL secara spesifik dalam analisis Anda (misal: "Batik Nusantara", "Candi Nusantara", dll).
2. Jika modul ada di daftar 'Modul Selesai', nyatakan sebagai penguasaan materi tersebut.
3. Jika modul ada di daftar 'Modul Belum Selesai', nyatakan sebagai target belajar berikutnya.
4. Jika XP = 0 dan belum ada modul selesai, analisis sebagai 'Fase Orientasi'.
5. Hubungkan jumlah XP ({{{poin}}}) dan Lencana ({{{badgeCount}}}) dengan dedikasi nyata siswa pada materi tertentu.

HASILKAN DALAM BAHASA INDONESIA YANG EDUKATIF BERBASIS DATA NYATA.`,
  prompt: `Lakukan analisis mendalam untuk siswa berikut:
Nama: {{{nama}}}
Level: {{{level}}}
Total XP: {{{poin}}}
Jumlah Lencana: {{{badgeCount}}}
Modul Selesai: {{#each completedModules}}{{{this}}}, {{/each}}
Modul Belum Selesai: {{#each unfinishedModules}}{{{this}}}, {{/each}}
Riwayat Aktivitas: {{{activitySummary}}}

Instruksi Output:
- summary: Narasi (2-3 kalimat) tentang profil belajar saat ini menggunakan fakta modul yang sudah/belum selesai.
- strengths: Poin kelebihan numerasi pada materi yang sudah diselesaikan.
- improvementAreas: Poin modul yang masih harus dituntaskan.
- teacherRecommendations: Langkah teknis untuk guru membantu siswa menyelesaikan modul yang tertunda.
- prediction: Ramalan kemajuan jika materi spesifik selanjutnya diselesaikan.`
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
        summary: "Data aktivitas siswa saat ini belum mencukupi untuk menghasilkan analisis mendalam.",
        strengths: ["Memulai penggunaan platform"],
        improvementAreas: ["Menyelesaikan modul pertama"],
        teacherRecommendations: ["Bantu siswa melakukan pindaian QR pertama"],
        prediction: "Siswa akan berkembang setelah mencoba materi Batik Nusantara.",
        riskLevel: "perhatian"
      };
    }
  }
);
