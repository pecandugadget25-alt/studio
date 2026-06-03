'use server';
/**
 * @fileOverview A Genkit flow for generating personalized learning recommendations for students.
 *
 * - personalizedLearningRecommendation - A function that provides personalized learning recommendations.
 * - PersonalizedLearningRecommendationInput - The input type for the personalizedLearningRecommendation function.
 * - PersonalizedLearningRecommendationOutput - The return type for the personalizedLearningRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedLearningRecommendationInputSchema = z.object({
  studentName: z.string().describe('Nama siswa untuk personalisasi rekomendasi.'),
  recentQuizResults: z
    .array(
      z.object({
        moduleName: z.string().describe('Nama modul kuis.'),
        score: z.number().describe('Skor kuis (0-100).'),
        difficulty: z.enum(['mudah', 'sedang', 'sulit']).describe('Tingkat kesulitan kuis.'),
      })
    )
    .optional()
    .describe('Hasil kuis terbaru siswa.'),
  completedModules: z.array(z.string()).optional().describe('Daftar modul yang sudah selesai.'),
  points: z.number().optional().describe('Total XP siswa.'),
  level: z.number().optional().describe('Level siswa.'),
  availableModules: z.array(z.string()).describe('Daftar semua modul yang tersedia.'),
  availableBadges: z.array(z.string()).describe('Daftar semua badge yang tersedia.'),
});
export type PersonalizedLearningRecommendationInput = z.infer<typeof PersonalizedLearningRecommendationInputSchema>;

const PersonalizedLearningRecommendationOutputSchema = z.object({
  nextChallenge: z.string().describe('Saran tantangan selanjutnya (Maks 1 kalimat).'),
  motivationMessage: z.string().describe('Pesan motivasi singkat (Maks 1 kalimat).'),
  recommendations: z.array(z.string()).optional(),
  areasForImprovement: z.array(z.string()).optional(),
  suggestedBadge: z.string().optional(),
});
export type PersonalizedLearningRecommendationOutput = z.infer<
  typeof PersonalizedLearningRecommendationOutputSchema
>;

export async function personalizedLearningRecommendation(
  input: PersonalizedLearningRecommendationInput
): Promise<PersonalizedLearningRecommendationOutput> {
  return personalizedLearningRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedLearningRecommendationPrompt',
  input: {schema: PersonalizedLearningRecommendationInputSchema},
  output: {schema: PersonalizedLearningRecommendationOutputSchema},
  system: `Anda adalah ETHNO-AI, Asisten Belajar Pintar untuk siswa SD di platform ETHNO-ARITH.

TUGAS UTAMA: Berikan rekomendasi belajar yang sangat singkat, sederhana, dan memotivasi.
ATURAN KERAS: 
- Total jawaban (Next Challenge + Motivation) maksimal 2 kalimat pendek.
- Gunakan bahasa Indonesia yang ramah anak, ceria, dan mudah dipahami anak SD.
- Hanya bahas matematika, numerasi, dan budaya Indonesia (batik, candi, masjid, permainan) yang ada di ETHNO-ARITH.
- Jika data menunjukkan nilai rendah, beri semangat untuk mencoba lagi.
- Jika data menunjukkan nilai tinggi, beri tantangan lebih seru.
- Jangan membahas topik di luar pembelajaran.`,
  prompt: `Halo ETHNO-AI! Tolong berikan saran belajar untuk:
Nama: {{{studentName}}}
XP: {{#if points}}{{{points}}}{{else}}0{{/if}}
Level: {{#if level}}{{{level}}}{{else}}1{{/if}}
Modul Selesai: {{#if completedModules}}{{#each completedModules}}{{{this}}}, {{/each}}{{else}}Belum ada.{{/if}}
Hasil Kuis Terakhir: {{#if recentQuizResults}}{{#each recentQuizResults}}Modul {{{moduleName}}} (Skor: {{{score}}}); {{/each}}{{else}}Belum ada kuis.{{/if}}

Modul yang Tersedia: {{#each availableModules}}{{{this}}}, {{/each}}

Tentukan 1 tantangan seru berikutnya dan 1 kalimat penyemangat yang hangat!`
});

const personalizedLearningRecommendationFlow = ai.defineFlow(
  {
    name: 'personalizedLearningRecommendationFlow',
    inputSchema: PersonalizedLearningRecommendationInputSchema,
    outputSchema: PersonalizedLearningRecommendationOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) throw new Error('AI generated empty output');
      return output;
    } catch (error) {
      console.error('Gemini API Error (Handled):', error);
      // Fallback sederhana yang ramah anak
      return {
        nextChallenge: "Ayo coba jelajahi Modul Batik Nusantara hari ini!",
        motivationMessage: `Semangat terus belajarnya ya, ${input.studentName}, kamu pasti bisa jadi juara!`
      };
    }
  }
);
