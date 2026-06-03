
'use server';
/**
 * @fileOverview Genkit flow untuk melakukan analisis mendalam individu siswa.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StudentDataSchema = z.object({
  nama: z.string(),
  level: z.number(),
  poin: z.number(),
  scanCount: z.number(),
  completedModules: z.array(z.string()),
  completedComics: z.array(z.string()),
  completedVideos: z.array(z.string()),
  recentActivities: z.array(z.object({
    title: z.string(),
    type: z.string(),
    timestamp: z.string().optional()
  }))
});

const AnalysisOutputSchema = z.object({
  learningProfile: z.string().describe('Tipe profil belajar siswa (contoh: Visual Explorer, Logic Master).'),
  strengths: z.array(z.string()).describe('3-4 poin kekuatan utama siswa.'),
  weaknesses: z.array(z.string()).describe('2-3 poin kelemahan atau area yang butuh peningkatan.'),
  narrative: z.string().describe('Analisis naratif lengkap tentang progres siswa dalam bahasa Indonesia formal.'),
  recommendations: z.array(z.string()).describe('3 saran konkret untuk langkah belajar berikutnya.'),
  riskLevel: z.enum(['aman', 'perhatian', 'risiko']).describe('Status risiko keteringgalan siswa.')
});

export type StudentAnalysisInput = z.infer<typeof StudentDataSchema>;
export type StudentAnalysisOutput = z.infer<typeof AnalysisOutputSchema>;

export async function analyzeStudentIndividually(input: StudentAnalysisInput): Promise<StudentAnalysisOutput> {
  return studentIndividualAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'studentIndividualAnalysisPrompt',
  input: { schema: StudentDataSchema },
  output: { schema: AnalysisOutputSchema },
  system: `Anda adalah Ahli Analitik Pembelajaran Digital di platform ETHNO-ARITH.
  
Tugas Anda adalah menganalisis data siswa secara objektif namun suportif untuk membantu GURU memahami kondisi siswa.

KRITERIA STATUS RISIKO:
- 'aman': Siswa aktif (level > 2), sering scan QR, dan modul hampir selesai.
- 'perhatian': Siswa memiliki beberapa aktivitas tapi jarang login dalam 3 hari terakhir atau modul macet di tengah.
- 'risiko': XP rendah, jarang scan QR, atau belum ada modul yang selesai sama sekali.

Gunakan bahasa Indonesia yang profesional dan mendalam. Hubungkan dengan konsep etnomatematika jika relevan.`,
  prompt: `Analisis data siswa berikut:
Nama: {{{nama}}}
Level: {{{level}}}
XP: {{{poin}}}
Total Scan QR: {{{scanCount}}}
Modul Selesai: {{#each completedModules}}{{{this}}}, {{/each}}
Komik Dibaca: {{#each completedComics}}{{{this}}}, {{/each}}
Video Ditonton: {{#each completedVideos}}{{{this}}}, {{/each}}

Riwayat Aktivitas Terakhir:
{{#each recentActivities}}
- {{{title}}} ({{{type}}})
{{/each}}

Berikan analisis personal yang mendalam.`
});

const studentIndividualAnalysisFlow = ai.defineFlow(
  {
    name: 'studentIndividualAnalysisFlow',
    inputSchema: StudentDataSchema,
    outputSchema: AnalysisOutputSchema,
  },
  async input => {
    try {
      const { output } = await prompt(input);
      if (!output) throw new Error('AI failed to generate analysis');
      return output;
    } catch (error) {
      console.error('AI Analysis Error:', error);
      return {
        learningProfile: "Siswa Pemula",
        strengths: ["Punya semangat belajar"],
        weaknesses: ["Masih perlu adaptasi platform"],
        narrative: "Siswa menunjukkan progres awal yang cukup baik namun perlu bimbingan lebih lanjut.",
        recommendations: ["Selesaikan modul batik", "Tonton video numerasi"],
        riskLevel: "perhatian"
      };
    }
  }
);
