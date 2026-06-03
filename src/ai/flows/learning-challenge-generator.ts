'use server';
/**
 * @fileOverview Generator tantangan belajar cerdas ETHNO-ARITH.
 * 
 * Flow ini menghasilkan tantangan numerasi berbasis budaya yang dipersonalisasi
 * berdasarkan data statistik siswa.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LearningChallengeInputSchema = z.object({
  xp: z.number().describe('Total XP siswa saat ini.'),
  level: z.number().describe('Level siswa saat ini.'),
  completedModules: z.array(z.string()).describe('Daftar ID modul yang sudah diselesaikan.'),
  quizScore: z.number().optional().describe('Rata-rata atau skor kuis terakhir.'),
});
export type LearningChallengeInput = z.infer<typeof LearningChallengeInputSchema>;

const LearningChallengeOutputSchema = z.object({
  title: z.string().describe('Judul tantangan yang menarik.'),
  description: z.string().describe('Deskripsi tantangan dalam 1-2 kalimat sederhana.'),
  rewardXP: z.number().describe('Jumlah XP yang akan didapatkan (10-50 XP).'),
});
export type LearningChallengeOutput = z.infer<typeof LearningChallengeOutputSchema>;

export async function generateLearningChallenge(
  input: LearningChallengeInput
): Promise<LearningChallengeOutput> {
  return learningChallengeFlow(input);
}

const challengePrompt = ai.definePrompt({
  name: 'learningChallengePrompt',
  input: {schema: LearningChallengeInputSchema},
  output: {schema: LearningChallengeOutputSchema},
  system: `Anda adalah ETHNO-AI, Generator Tantangan Pintar untuk siswa SD.
Tugas Anda adalah membuat 1 tantangan belajar numerasi yang seru dan berkaitan dengan budaya Indonesia (batik, candi, masjid, permainan).

ATURAN:
- Bahasa Indonesia yang ceria dan sangat mudah dipahami anak SD.
- Tantangan harus konkret (misal: hitung simetri di kain batik, cari balok di candi).
- Sesuaikan tingkat kesulitan dengan Level siswa.
- Reward XP berkisar antara 10 sampai 50 XP.`,
  prompt: `Halo ETHNO-AI! Buatlah satu tantangan spesial untuk siswa dengan data berikut:
Level: {{{level}}}
XP: {{{xp}}}
Modul Selesai: {{#each completedModules}}{{{this}}}, {{/each}}
Skor Terakhir: {{{quizScore}}}

Buat tantangan yang unik dan memotivasi!`
});

const learningChallengeFlow = ai.defineFlow(
  {
    name: 'learningChallengeFlow',
    inputSchema: LearningChallengeInputSchema,
    outputSchema: LearningChallengeOutputSchema,
  },
  async input => {
    try {
      const {output} = await challengePrompt(input);
      if (!output) throw new Error('AI gagal membuat tantangan');
      return output;
    } catch (error) {
      console.error('Learning Challenge AI Error:', error);
      // Fallback tantangan default yang aman
      return {
        title: "Penjelajah Motif Batik",
        description: "Temukan 3 garis simetri pada motif batik di sekitarmu atau di modul Batik Nusantara!",
        rewardXP: 25
      };
    }
  }
);
