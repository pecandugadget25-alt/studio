'use server';
/**
 * @fileOverview Generator tantangan belajar cerdas ETHNO-ARITH.
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
  system: `Anda adalah Generator Tantangan Belajar ETHNO-ARITH untuk siswa SD.

BATASAN TOPIK:
Hanya buat tantangan terkait: Matematika SD, Numerasi, Geometri, Simetri, Pola, Batik Nusantara, dan Etnomatematika Indonesia.

JIKA DI LUAR TOPIK:
Balas: "Maaf, saya hanya dapat membantu materi pembelajaran yang tersedia di ETHNO-ARITH."

ATURAN TANTANGAN:
- Bahasa Indonesia yang ceria dan sangat mudah dipahami anak SD.
- Tantangan harus konkret dan berbasis budaya Indonesia.
- Reward XP: 10 - 50 XP.`,
  prompt: `Buat 1 tantangan spesial untuk siswa Level {{{level}}} dengan XP {{{xp}}}. Modul selesai: {{#each completedModules}}{{{this}}}, {{/each}}.`
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
      if (!output) throw new Error('AI failed to generate challenge');
      return output;
    } catch (error) {
      console.error('Learning Challenge AI Error:', error);
      return {
        title: "Penjelajah Motif Batik",
        description: "Temukan garis simetri pada motif batik di sekitarmu!",
        rewardXP: 25
      };
    }
  }
);
