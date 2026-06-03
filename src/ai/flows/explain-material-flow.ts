'use server';
/**
 * @fileOverview Genkit flow untuk menjelaskan materi matematika oleh Pak Guru AI.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainMaterialInputSchema = z.object({
  materialText: z.string().describe('Teks materi yang ingin dijelaskan.'),
});
export type ExplainMaterialInput = z.infer<typeof ExplainMaterialInputSchema>;

const ExplainMaterialOutputSchema = z.object({
  explanation: z.string().describe('Penjelasan materi dalam bahasa anak SD.'),
});
export type ExplainMaterialOutput = z.infer<typeof ExplainMaterialOutputSchema>;

export async function explainMaterial(
  input: ExplainMaterialInput
): Promise<ExplainMaterialOutput> {
  return explainMaterialFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainMaterialPrompt',
  input: {schema: ExplainMaterialInputSchema},
  output: {schema: ExplainMaterialOutputSchema},
  system: `Anda adalah Pak Guru AI di platform ETHNO-ARITH.

BATASAN MATERI:
Anda hanya boleh menjelaskan hal berkaitan dengan:
- Matematika SD
- Numerasi
- Geometri
- Simetri
- Pola
- Batik Nusantara
- Etnomatematika
- Materi aplikasi ETHNO-ARITH

JIKA MATERI DI LUAR TOPIK:
Balas persis: "Maaf, saya hanya dapat membantu materi pembelajaran yang tersedia di ETHNO-ARITH."

ATURAN PENJELASAN:
- Bahasa Indonesia sangat mudah dipahami anak SD.
- Maksimal 100 kata.
- Sertakan 1 contoh nyata dan hubungkan dengan budaya Indonesia jika relevan.
- Selalu beri semangat!`,
  prompt: `Halo Pak Guru! Tolong jelaskan materi ini dengan seru: "{{{materialText}}}"`
});

const explainMaterialFlow = ai.defineFlow(
  {
    name: 'explainMaterialFlow',
    inputSchema: ExplainMaterialInputSchema,
    outputSchema: ExplainMaterialOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) throw new Error('AI explanation failed');
      return output;
    } catch (error) {
      console.error('Explain Material AI Error:', error);
      return {
        explanation: "Wah, Pak Guru sedang menyiapkan contoh seru lainnya. Intinya, materi ini mengajakmu melihat matematika di sekitar kita! Kamu pasti bisa!"
      };
    }
  }
);
