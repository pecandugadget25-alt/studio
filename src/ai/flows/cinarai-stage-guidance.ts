'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { CinaraiStageId } from '@/components/cinarai/types';

const CinaraiStageGuidanceInputSchema = z.object({
  stage: z.enum([
    'cover',
    'contextualization',
    'identification',
    'navigation',
    'argumentation',
    'resolution',
    'application',
    'introspection',
    'report',
  ]),
  prompt: z.string(),
  stageRules: z.string().optional(),
});

const CinaraiStageGuidanceOutputSchema = z.object({
  response: z.string(),
});

export type CinaraiStageGuidanceInput = z.infer<typeof CinaraiStageGuidanceInputSchema>;
export type CinaraiStageGuidanceOutput = z.infer<typeof CinaraiStageGuidanceOutputSchema>;

export async function cinaraiStageGuidance(input: CinaraiStageGuidanceInput): Promise<CinaraiStageGuidanceOutput> {
  return cinaraiStageGuidanceFlow(input);
}

const stageRules: Record<CinaraiStageId, string> = {
  cover: 'Hanya sambut siswa, jelaskan alur belajar CINARAI, dan ajak mereka memulai. Jangan membahas tahap lain.',
  contextualization: 'Hanya bahas cerita komik dan alur narasinya. Jangan memberi jawaban kuis, menebak bentuk, atau mengulas soal numerasi.',
  identification: 'Bantu siswa mengenali bentuk atau pola dengan petunjuk singkat. Jangan langsung memberi jawaban, dan jangan membahas tahap lain.',
  navigation: 'Jelaskan objek yang sedang terdeteksi oleh kamera AR. Jangan membahas komik, kuis, atau soal numerasi.',
  argumentation: 'Bantu siswa menilai alasan mereka dengan fokus pada akurasi konsep, kelengkapan, kosakata matematika, dan penjelasan logis. Jangan memberi jawaban langsung untuk tahap lain.',
  resolution: 'Jelaskan langkah penyelesaian soal numerasi secara bertahap. Jangan membahas komik atau AR.',
  application: 'Beri bimbingan untuk menerapkan konsep ke situasi dunia nyata. Jangan memberi jawaban segera, dan jangan membahas tahap lain.',
  introspection: 'Bantu siswa merefleksikan pemahaman, rasa percaya diri, dan pengalaman belajar. Jangan memberi jawaban soal.',
  report: 'Ringkas pencapaian belajar siswa berdasarkan tahap yang sudah selesai. Jangan mengubah proses belajar.',
};

const prompt = ai.definePrompt({
  name: 'cinaraiStageGuidancePrompt',
  input: { schema: CinaraiStageGuidanceInputSchema },
  output: { schema: CinaraiStageGuidanceOutputSchema },
  system: `Anda adalah ETHNO-AI yang membimbing siswa SD dalam alur belajar CINARAI. Selalu ikuti aturan tahap aktif. Jika pertanyaan tidak relevan dengan tahap yang aktif, balas: "Maaf, saya hanya dapat membantu pada tahap belajar yang aktif saat ini." Gunakan bahasa Indonesia yang ramah anak, singkat, dan suportif.`,
  prompt: `Tahap aktif: {{{stage}}}. Aturan tahap: {{stageRules}}. Pertanyaan siswa: {{{prompt}}}.`,
});

const cinaraiStageGuidanceFlow = ai.defineFlow(
  {
    name: 'cinaraiStageGuidanceFlow',
    inputSchema: CinaraiStageGuidanceInputSchema,
    outputSchema: CinaraiStageGuidanceOutputSchema,
  },
  async input => {
    try {
      const { output } = await prompt({ ...input, stageRules: stageRules[input.stage as CinaraiStageId] });
      if (!output) throw new Error('AI generated empty output');
      return output;
    } catch (error) {
      console.error('CINARAI AI guidance error:', error);
      return {
        response: 'Maaf, saya hanya dapat membantu pada tahap belajar yang aktif saat ini.',
      };
    }
  }
);
