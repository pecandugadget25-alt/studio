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
  difficultModule: z.string().describe('Modul dengan rata-rata nilai terendah atau paling lambat diselesaikan.'),
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
  system: `Anda adalah Analis Pendidikan pakar untuk platform ETHNO-ARITH. 
Tugas Anda adalah memberikan ringkasan eksekutif kepada guru tentang kondisi kelas mereka.

ATURAN KETAT:
- Hasil akhir HARUS maksimal 3 kalimat pendek.
- Bahasa Indonesia formal namun suportif.
- Fokus pada: Kondisi kelas saat ini, Materi yang perlu perhatian khusus, dan Rekomendasi praktis untuk guru.
- Hubungkan dengan konsep etnomatematika jika relevan.`,
  prompt: `Analisis data kelas berikut dan berikan ringkasan singkat:
Jumlah Siswa: {{{totalStudents}}}
Rerata XP: {{{averageXP}}}
Rerata Nilai Kuis: {{{averageQuiz}}}%
Modul Terpopuler: {{{popularModule}}}
Modul Tersulit: {{{difficultModule}}}

Berikan wawasan yang membantu guru menentukan langkah pengajaran berikutnya.`
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
      if (!output) throw new Error('AI failed to generate analysis');
      return output;
    } catch (error) {
      console.error('Class Analysis AI Error:', error);
      return {
        summary: `Kelas menunjukkan progres aktif dengan rata-rata ${input.averageXP} XP, namun modul ${input.difficultModule} memerlukan pendampingan lebih lanjut. Disarankan memberikan penguatan pada konsep geometri dasar sebelum melanjutkan ke topik berikutnya.`
      };
    }
  }
);
