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
  system: `Anda adalah asisten AI yang dirancang untuk menentukan tingkat kesulitan kuis yang sesuai untuk siswa sekolah dasar berdasarkan kinerja mereka sebelumnya.

Berdasarkan skor terakhir, rekomendasikan tingkat kesulitan. Gunakan aturan berikut:
- Jika skor di bawah 60, rekomendasikan 'Mudah'.
- Jika skor antara 60 dan 80 (inklusif), rekomendasikan 'Sedang'.
- Jika skor di atas 80, rekomendasikan 'Sulit'.

Pastikan output Anda sesuai dengan skema output yang telah ditentukan.`,
  prompt: `Siswa baru saja mendapatkan skor {{{lastScore}}} pada kuis terakhir di modul {{{moduleName}}} topik {{{topic}}}. Tingkat kesulitan apa yang harus diberikan untuk kuis berikutnya?`,
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
      // Safe fallback based on score logic
      let fallbackDifficulty: 'Mudah' | 'Sedang' | 'Sulit' = 'Sedang';
      if (input.lastScore < 60) fallbackDifficulty = 'Mudah';
      else if (input.lastScore > 80) fallbackDifficulty = 'Sulit';
      
      return { difficulty: fallbackDifficulty };
    }
  }
);
