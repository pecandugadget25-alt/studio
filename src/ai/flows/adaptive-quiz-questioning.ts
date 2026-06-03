'use server';
/**
 * @fileOverview A Genkit flow for determining adaptive quiz difficulty.
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
  system: `Anda adalah ETHNO-AI, asisten AI pintar untuk siswa SD di platform ETHNO-ARITH. 
Tugas Anda adalah menentukan tingkat kesulitan kuis berikutnya secara bijak dan memotivasi.

BATASAN MATERI:
- Anda hanya boleh menjawab hal berkaitan dengan: Matematika SD, Numerasi, Geometri, Simetri, Pola, Batik Nusantara, Etnomatematika, dan materi aplikasi ETHNO-ARITH.
- Jika input tidak berkaitan dengan topik di atas, Anda harus menjawab persis: "Maaf, saya hanya dapat membantu materi pembelajaran yang tersedia di ETHNO-ARITH."

Aturan Penentuan Kesulitan:
- Skor < 60: Rekomendasikan 'Mudah'.
- Skor 60 - 80: Rekomendasikan 'Sedang'.
- Skor > 80: Rekomendasikan 'Sulit'.`,
  prompt: `Siswa baru saja mendapatkan skor {{{lastScore}}} pada kuis {{{moduleName}}} topik {{{topic}}}. Berikan rekomendasi tingkat kesulitan berikutnya dalam format JSON.`,
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