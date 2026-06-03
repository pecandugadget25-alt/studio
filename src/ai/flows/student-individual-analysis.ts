'use server';
/**
 * @fileOverview Genkit flow untuk melakukan analisis mendalam individu siswa.
 * Menghasilkan laporan terperinci sesuai spesifikasi kurikulum ETHNO-ARITH.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StudentDataSchema = z.object({
  nama: z.string(),
  level: z.number(),
  poin: z.number(),
  badges: z.array(z.string()).optional(),
  completedModules: z.array(z.string()).optional(),
});

const AnalysisOutputSchema = z.object({
  summary: z.string().describe('Ringkasan kemampuan numerasi dan budaya siswa.'),
  strengths: z.array(z.string()).describe('3-4 Kelebihan utama siswa dalam pembelajaran.'),
  weaknesses: z.array(z.string()).describe('3-4 Kekurangan atau area yang butuh perbaikan.'),
  teacherRecommendations: z.array(z.string()).describe('3-4 saran konkret untuk Guru dalam membimbing siswa ini.'),
  prediction: z.string().describe('Prediksi perkembangan belajar siswa di masa depan.'),
  riskLevel: z.enum(['aman', 'perhatian', 'risiko']).describe('Tingkat risiko kesulitan belajar.'),
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
  
Tugas Anda adalah menganalisis data progres siswa SD dalam mempelajari etnomatematika.

KATEGORI LAPORAN:
1. Ringkasan Kemampuan: Narasi singkat tentang pemahaman materi.
2. Kelebihan & Kekurangan: Fokus pada numerasi dan literasi budaya.
3. Rekomendasi Guru: Instruksi teknis untuk pengajaran di kelas.
4. Prediksi Perkembangan: Ramalan kemajuan belajar berdasarkan poin dan modul.

Gunakan bahasa Indonesia yang edukatif, suportif, dan objektif.`,
  prompt: `Lakukan analisis untuk siswa:
Nama: {{{nama}}}
Level: {{{level}}}
XP: {{{poin}}}
Lencana: {{#each badges}}{{{this}}}, {{/each}}
Modul Selesai: {{#each completedModules}}{{{this}}}, {{/each}}

Jika data XP < 10, nyatakan bahwa siswa masih dalam tahap orientasi awal.`
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
        summary: "Siswa sedang memulai petualangan belajarnya.",
        strengths: ["Memiliki kemauan belajar"],
        weaknesses: ["Data aktivitas terbatas"],
        teacherRecommendations: ["Berikan motivasi untuk mencoba modul pertama"],
        prediction: "Siswa akan berkembang pesat setelah menyelesaikan 1 modul.",
        riskLevel: "perhatian"
      };
    }
  }
);
