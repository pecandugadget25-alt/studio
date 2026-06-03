'use server';
/**
 * @fileOverview A Genkit flow for determining adaptive quiz difficulty.
 *
 * - getAdaptiveQuizDifficulty - A function that handles determining the next quiz difficulty.
 * - AdaptiveQuizInput - The input type for the getAdaptiveQuizDifficulty function.
 * - AdaptiveQuizOutput - The return type for the getAdaptiveQuizDifficulty function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdaptiveQuizInputSchema = z.object({
  lastScore: z
    .number()
    .min(0)
    .max(100)
    .describe('Skor terakhir siswa pada kuis sebelumnya (0-100).'),
  moduleName: z
    .string()
    .describe('Nama modul pembelajaran yang sedang diikuti siswa.'),
  topic: z
    .string()
    .describe('Topik spesifik dalam modul pembelajaran.'),
});
export type AdaptiveQuizInput = z.infer<typeof AdaptiveQuizInputSchema>;

const AdaptiveQuizOutputSchema = z.object({
  difficulty: z
    .enum(['Mudah', 'Sedang', 'Sulit'])
    .describe('Tingkat kesulitan yang direkomendasikan untuk kuis berikutnya.'),
});
export type AdaptiveQuizOutput = z.infer<typeof AdaptiveQuizOutputSchema>;

export async function getAdaptiveQuizDifficulty(
  input: AdaptiveQuizInput
): Promise<AdaptiveQuizOutput> {
  return adaptiveQuizQuestioningFlow(input);
}

const adaptiveQuizPrompt = ai.definePrompt({
  name: 'adaptiveQuizPrompt',
  input: {schema: AdaptiveQuizInputSchema},
  output: {schema: AdaptiveQuizOutputSchema},
  system: `Anda adalah ETHNO-AI, asisten AI pintar untuk siswa sekolah dasar. Tugas Anda adalah menentukan tingkat kesulitan kuis berikutnya secara bijak dan memotivasi.

Aturan Penentuan:
- Skor < 60: Rekomendasikan 'Mudah' agar siswa lebih percaya diri.
- Skor 60 - 80: Rekomendasikan 'Sedang' untuk mengasah kemampuan.
- Skor > 80: Rekomendasikan 'Sulit' sebagai tantangan baru bagi juara!

Gunakan bahasa yang ramah dan sederhana dalam proses analisis internal Anda.`,
  prompt: `Siswa baru saja mendapatkan skor {{{lastScore}}} pada kuis {{{moduleName}}} topik {{{topic}}}. Berikan rekomendasi tingkat kesulitan berikutnya dalam format JSON sesuai skema.`,
});

const adaptiveQuizQuestioningFlow = ai.defineFlow(
  {
    name: 'adaptiveQuizQuestioningFlow',
    inputSchema: AdaptiveQuizInputSchema,
    outputSchema: AdaptiveQuizOutputSchema,
  },
  async input => {
    try {
      const {output} = await adaptiveQuizPrompt(input);
      if (!output) throw new Error('No output from prompt');
      return output;
    } catch (e) {
      console.error('Adaptive Quiz Flow Error:', e);
      let fallbackDifficulty: 'Mudah' | 'Sedang' | 'Sulit' = 'Sedang';
      if (input.lastScore < 60) fallbackDifficulty = 'Mudah';
      else if (input.lastScore > 80) fallbackDifficulty = 'Sulit';
      
      return { difficulty: fallbackDifficulty };
    }
  }
);
