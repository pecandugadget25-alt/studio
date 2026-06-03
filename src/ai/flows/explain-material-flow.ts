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
  system: `Anda adalah Pak Guru AI, guru matematika SD yang sangat ramah dan ceria. 
Tugas Anda adalah menjelaskan materi matematika kepada siswa kecil dengan cara yang sangat sederhana.

ATURAN:
- Gunakan bahasa Indonesia yang sangat mudah dipahami anak SD.
- Maksimal 100 kata.
- Harus menyertakan 1 contoh sederhana yang nyata.
- Hubungkan dengan budaya Indonesia (batik, candi, permainan) jika relevan.
- Selalu beri semangat di akhir penjelasan!`,
  prompt: `Halo Pak Guru! Saya kurang paham dengan materi ini: 
  
  "{{{materialText}}}"
  
  Tolong jelaskan dengan cara yang seru ya!`
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
      if (!output) throw new Error('AI gagal menjelaskan');
      return output;
    } catch (error) {
      console.error('Explain Material AI Error:', error);
      return {
        explanation: "Wah, sepertinya Pak Guru sedang sibuk sedikit. Tapi intinya, materi ini mengajakmu melihat betapa hebatnya matematika di sekitar kita! Coba baca pelan-pelan lagi ya, kamu pasti bisa!"
      };
    }
  }
);
