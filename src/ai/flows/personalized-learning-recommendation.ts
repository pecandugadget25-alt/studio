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
    .describe('Rekomendasi modul atau topik pembelajaran yang relevan untuk siswa.'),
  areasForImprovement: z
    .array(z.string())
    .describe('Area spesifik yang perlu ditingkatkan siswa berdasarkan hasil kuis.'),
  nextChallenge: z
    .string()
    .describe('Saran tantangan selanjutnya untuk siswa.'),
  suggestedBadge: z.string().describe('Nama badge yang dapat menjadi target siswa.'),
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
  system: `Anda adalah ETHNO-AI, Asisten Belajar Pintar pada platform ETHNO-ARITH (Ethnomathematics AR Learning Ecosystem).

TUJUAN UTAMA:
Membantu siswa TK dan SD memahami matematika dasar, numerasi, geometri, pola, simetri, dan etnomatematika Indonesia melalui pendekatan yang menyenangkan, sederhana, dan memotivasi.

ATURAN WAJIB:
- Gunakan bahasa Indonesia yang sederhana dan mudah dipahami anak TK dan SD.
- Berikan jawaban singkat, jelas, dan edukatif.
- Gunakan contoh yang dekat dengan kehidupan sehari-hari anak.
- Hubungkan penjelasan dengan budaya Indonesia dan motif batik jika memungkinkan.
- Selalu bersikap ramah, positif, dan memotivasi.
- Jangan menggunakan istilah teknis yang sulit dipahami anak.

BATASAN:
- Hanya bahas matematika, numerasi, geometri, simetri, pola, etnomatematika, batik, dan budaya matematika Indonesia.
- Jangan membahas politik, agama, kekerasan, atau topik dewasa.
- Jika ada hal di luar topik, sampaikan bahwa Anda hanya membantu materi ETHNO-ARITH.`,
  prompt: `Halo ETHNO-AI! Tolong berikan rekomendasi belajar untuk siswa bernama {{{studentName}}}.

Data Siswa:
- Hasil Kuis Terbaru: {{#if recentQuizResults}}{{#each recentQuizResults}}Modul {{{moduleName}}} (Skor: {{{score}}}, Kesulitan: {{{difficulty}}}); {{/each}}{{else}}Belum ada kuis.{{/if}}
- Modul Selesai: {{#if completedModules}}{{#each completedModules}}{{{this}}}, {{/each}}{{else}}Belum ada modul selesai.{{/if}}
- Modul Tersedia: {{#each availableModules}}{{{this}}}, {{/each}}
- Lencana Tersedia: {{#each availableBadges}}{{{this}}}, {{/each}}

Berdasarkan data ini, berikan:
1. Rekomendasi modul selanjutnya.
2. Area yang perlu ditingkatkan (pilih yang paling penting).
3. Tantangan seru berikutnya.
4. Target lencana (badge) selanjutnya.
5. Pesan motivasi yang hangat dan menyemangati ala guru pendamping digital.`
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
      return {
        recommendations: ["Batik Nusantara", "Candi Nusantara"],
        areasForImprovement: ["Latih lagi konsep simetri pada modul Batik"],
        nextChallenge: "Selesaikan 1 kuis di modul Batik Nusantara untuk membuka tantangan baru!",
        suggestedBadge: "Ahli Geometri Batik",
        motivationMessage: `Halo ${input.studentName}, teruslah belajar! Setiap tantangan yang kamu selesaikan akan membawamu lebih dekat ke puncak klasemen.`
      };
    }
  }
);
