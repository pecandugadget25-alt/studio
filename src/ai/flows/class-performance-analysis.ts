'use server';
/**
 * @fileOverview A Genkit flow for analyzing class performance for teachers.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClassAnalysisInputSchema = z.object({
  totalStudents: z.number().describe('Jumlah total siswa di kelas.'),
  averageXP: z.number().describe('Rata-rata poin XP siswa.'),
  averageQuiz: z.number().describe('Rata-rata nilai kuis siswa.'),
  popularModule: z.string().describe('Modul yang paling banyak diselesaikan.'),
  difficultModule: z.string().describe('Modul dengan rata-rata nilai terendah.'),
});
export type ClassAnalysisInput = z.infer<typeof ClassAnalysisInputSchema>;

const ClassAnalysisOutputSchema = z.object({
  summary: z.string().describe('Ringkasan analisis performa kelas (Maks 3 kalimat).'),
});
export type ClassAnalysisOutput = z.infer<typeof ClassAnalysisOutputSchema>;

export async function analyzeClassPerformance(
  input: ClassAnalysisInput
): Promise<ClassAnalysisOutput> {
  return classAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'classAnalysisPrompt',
  input: {schema: ClassAnalysisInputSchema},
  output: {schema: ClassAnalysisOutputSchema},
  system: `Anda adalah Analis Pendidikan untuk platform ETHNO-ARITH.

BATASAN TOPIK:
Anda hanya boleh memberikan analisis terkait: Matematika SD, Numerasi, Geometri, Simetri, Pola, Batik Nusantara, Etnomatematika, dan progres belajar di ETHNO-ARITH.

JIKA DI LUAR TOPIK:
Balas: "Maaf, saya hanya dapat membantu materi pembelajaran yang tersedia di ETHNO-ARITH."

ATURAN RINGKASAN:
- Hasil akhir HARUS maksimal 3 kalimat pendek.
- Bahasa Indonesia formal namun suportif.
- Fokus pada: Kondisi kelas, materi kritis, dan rekomendasi guru.`,
  prompt: `Analisis data kelas: Siswa {{{totalStudents}}}, Rerata XP {{{averageXP}}}, Rerata Kuis {{{averageQuiz}}}%. Modul Populer: {{{popularModule}}}, Modul Sulit: {{{difficultModule}}}. Berikan ringkasan eksekutif 3 kalimat.`
});

const classAnalysisFlow = ai.defineFlow(
  {
    name: 'classAnalysisFlow',
    inputSchema: ClassAnalysisInputSchema,
    outputSchema: ClassAnalysisOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) throw new Error('AI Analysis empty');
      return output;
    } catch (error) {
      console.error('Class Analysis AI Error:', error);
      return {
        summary: `Kelas aktif dengan rata-rata ${input.averageXP} XP. Modul ${input.difficultModule} memerlukan perhatian khusus. Disarankan penguatan konsep dasar sebelum melanjutkan.`
      };
    }
  }
);
