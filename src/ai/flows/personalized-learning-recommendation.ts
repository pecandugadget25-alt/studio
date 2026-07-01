'use server';
/**
 * @fileOverview A Genkit flow for generating personalized learning recommendations for students.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedLearningRecommendationInputSchema = z.object({
  studentName: z.string().describe('Nama siswa untuk personalisasi rekomendasi.'),
  recentQuizResults: z
    .array(
      z.object({
        materialName: z.string().describe('Nama materi kuis.'),
        score: z.number().describe('Skor kuis (0-100).'),
        difficulty: z.enum(['mudah', 'sedang', 'sulit']).describe('Tingkat kesulitan kuis.'),
      })
    )
    .optional()
    .describe('Hasil kuis terbaru siswa.'),
  completedMaterials: z.array(z.string()).optional().describe('Daftar materi yang sudah selesai.'),
  points: z.number().optional().describe('Total XP siswa.'),
  level: z.number().optional().describe('Level siswa.'),
  availableMaterials: z.array(z.string()).describe('Daftar semua materi yang tersedia.'),
  availableBadges: z.array(z.string()).describe('Daftar semua lencana yang tersedia.'),
});
export type PersonalizedLearningRecommendationInput = z.infer<typeof PersonalizedLearningRecommendationInputSchema>;

const PersonalizedLearningRecommendationOutputSchema = z.object({
  nextChallenge: z.string().describe('Saran tantangan selanjutnya (Maks 1 kalimat).'),
  motivationMessage: z.string().describe('Pesan motivasi singkat (Maks 1 kalimat).'),
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
  system: `Anda adalah ETHNO-AI, asisten belajar pintar di platform ETHNO-ARITH.

TUGAS UTAMA: Berikan rekomendasi belajar yang sangat singkat (maksimal 2 kalimat), ceria, dan memotivasi untuk anak SD.

BATASAN MATERI:
- Anda hanya boleh menjawab hal berkaitan dengan: Matematika SD, Numerasi, Geometri, Simetri, Pola, Batik Nusantara, Etnomatematika, dan materi dalam aplikasi ETHNO-ARITH.
- Jika di luar topik tersebut, balas persis: "Maaf, saya hanya dapat membantu materi pembelajaran yang tersedia di ETHNO-ARITH."

ATURAN FORMAT:
- Berikan saran tantangan berikutnya dan 1 kalimat penyemangat.
- Gunakan bahasa Indonesia yang ramah anak.`,
  prompt: `Halo ETHNO-AI! Berikan saran belajar untuk {{{studentName}}} (Level {{{level}}}, XP {{{points}}}). Materi tersedia: {{#each availableMaterials}}{{{this}}}, {{/each}}. Berikan 1 tantangan berikutnya dan motivasi ceria dalam maksimal 2 kalimat.`
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
      console.error('AI Flow Error:', error);
      return {
        nextChallenge: "Ayo jelajahi komik budaya hari ini!",
        motivationMessage: `Semangat terus belajarnya ya, ${input.studentName}, kamu pasti bisa!`
      };
    }
  }
);
