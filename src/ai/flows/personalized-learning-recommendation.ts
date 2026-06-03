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
    .describe('Hasil kuis terbaru siswa, termasuk nama modul, skor, dan tingkat kesulitan.'),
  completedModules: z.array(z.string()).describe('Daftar modul pembelajaran yang sudah diselesaikan siswa.'),
  availableModules: z.array(z.string()).describe('Daftar semua modul pembelajaran yang tersedia dalam aplikasi.'),
  availableBadges: z.array(z.string()).describe('Daftar semua badge prestasi yang tersedia dalam aplikasi.'),
});
export type PersonalizedLearningRecommendationInput = z.infer<typeof PersonalizedLearningRecommendationInputSchema>;

const PersonalizedLearningRecommendationOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe('Rekomendasi modul atau topik pembelajaran yang relevan untuk siswa, bisa untuk peningkatan atau eksplorasi.'),
  areasForImprovement: z
    .array(z.string())
    .describe('Area spesifik yang perlu ditingkatkan siswa berdasarkan hasil kuis.'),
  nextChallenge: z
    .string()
    .describe('Saran tantangan selanjutnya untuk siswa, bisa berupa modul, kuis dengan tingkat kesulitan tertentu, atau tantangan harian.'),
  suggestedBadge: z.string().describe('Nama badge yang dapat menjadi target siswa untuk memotivasi belajar.'),
  motivationMessage: z.string().describe('Pesan motivasi yang personal untuk siswa.'),
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
  prompt: `Anda adalah seorang Penasihat Pembelajaran AI yang membantu siswa sekolah dasar ETHNO-ARITH meningkatkan kemampuan numerasi mereka.\nTugas Anda adalah menganalisis riwayat belajar siswa dan memberikan rekomendasi yang dipersonalisasi serta motivasi.\n\nSiswa: {{{studentName}}}\n\nBerikut adalah hasil kuis terbaru siswa:\n{{#if recentQuizResults}}\n{{#each recentQuizResults}}\n- Modul: {{{moduleName}}}, Skor: {{{score}}} (Kesulitan: {{{difficulty}}})\n{{/each}}\n{{else}}\nTidak ada hasil kuis terbaru.\n{{/if}}\n\nModul yang sudah diselesaikan siswa:\n{{#if completedModules}}\n{{#each completedModules}}\n- {{{this}}}\n{{/each}}\n{{else}}\nTidak ada modul yang diselesaikan.\n{{/if}}\n\nModul yang tersedia:\n{{#if availableModules}}\n{{#each availableModules}}\n- {{{this}}}\n{{/each}}\n{{else}}\nTidak ada modul yang tersedia.\n{{/if}}\n\nBadge yang tersedia:\n{{#if availableBadges}}\n{{#each availableBadges}}\n- {{{this}}}\n{{/each}}\n{{else}}\nTidak ada badge yang tersedia.\n{{/if}}\n\nBerdasarkan informasi di atas, berikan rekomendasi belajar yang dipersonalisasi untuk {{{studentName}}}.\n1.  Identifikasi area spesifik yang perlu ditingkatkan siswa berdasarkan skor kuis dan tingkat kesulitan. Jika skor rendah pada modul tertentu, rekomendasikan modul tersebut atau prasyaratnya.\n2.  Sertakan rekomendasi modul baru yang belum diselesaikan siswa, baik untuk eksplorasi lebih lanjut atau untuk memperkuat pemahaman. Prioritaskan modul yang relevan dengan area peningkatan.\n3.  Sarankan tantangan selanjutnya, bisa berupa modul tertentu, kuis dengan tingkat kesulitan tertentu, atau aktivitas lain.\n4.  Sebutkan satu badge yang paling relevan yang bisa menjadi target siswa berikutnya untuk memotivasi mereka.\n5.  Berikan pesan motivasi yang positif dan personal.\n\nPastikan semua rekomendasi praktis dan relevan untuk siswa sekolah dasar.`
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
      console.error('Gemini API Quota or Connection Error:', error);
      // Fallback response for resilience
      return {
        recommendations: ["Batik Nusantara", "Candi Nusantara"],
        areasForImprovement: ["Selesaikan modul dasar yang tersedia"],
        nextChallenge: "Tuntaskan modul Batik hari ini untuk membuka tantangan baru!",
        suggestedBadge: "Juara Numerasi",
        motivationMessage: "Langkah kecil hari ini adalah awal kesuksesan besar di masa depan. Semangat belajar!"
      };
    }
  }
);
