'use server';
/**
 * @fileOverview Genkit flow untuk melakukan analisis mendalam individu siswa.
 * Menghasilkan laporan terperinci sesuai spesifikasi kurikulum ETHNO-ARITH.
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
    description: z.string().optional(),
    timestamp: z.string().optional()
  })).describe('Log aktivitas terbaru siswa dari Firestore.')
});

const AnalysisOutputSchema = z.object({
  summary: z.string().describe('Ringkasan kemampuan numerasi dan budaya siswa.'),
  strengths: z.array(z.string()).describe('Kelebihan utama siswa dalam pembelajaran.'),
  weaknesses: z.array(z.string()).describe('Kekurangan atau area yang butuh perbaikan.'),
  engagementLevel: z.string().describe('Tingkat keaktifan siswa (contoh: Sangat Aktif, Pasif, Konsisten).'),
  riskLevel: z.enum(['aman', 'perhatian', 'risiko']).describe('Tingkat risiko kesulitan belajar.'),
  teacherRecommendations: z.array(z.string()).describe('3-4 saran konkret untuk Guru dalam membimbing siswa ini.'),
  studentRecommendations: z.array(z.string()).describe('3-4 saran konkret untuk Siswa agar progresnya meningkat.')
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
  system: `Anda adalah Senior AI Education Consultant di platform ETHNO-ARITH.
  
Tugas Anda adalah menganalisis data progres siswa SD dalam mempelajari etnomatematika (matematika berbasis budaya).

KATEGORI LAPORAN:
1. Ringkasan Kemampuan: Narasi singkat tentang sejauh mana siswa memahami materi.
2. Kelebihan & Kekurangan: Fokus pada numerasi, logika, dan literasi budaya.
3. Tingkat Keaktifan: Analisis berdasarkan scanCount dan variasi aktivitas.
4. Risiko: Tentukan apakah siswa 'aman', perlu 'perhatian', atau 'risiko' (jarang aktivitas).
5. Rekomendasi Terpisah: Berikan instruksi teknis untuk GURU dan motivasi belajar untuk SISWA.

Gunakan bahasa Indonesia yang edukatif, suportif, dan objektif.`,
  prompt: `Lakukan analisis mendalam untuk siswa berikut:
Nama: {{{nama}}}
Level: {{{level}}}
XP: {{{poin}}}
Total Scan QR: {{{scanCount}}}
Modul Selesai: {{#each completedModules}}{{{this}}}, {{/each}}
Komik: {{#each completedComics}}{{{this}}}, {{/each}}
Video: {{#each completedVideos}}{{{this}}}, {{/each}}

Riwayat Aktivitas Terakhir:
{{#each recentActivities}}
- {{{title}}} (Tipe: {{{type}}}) : {{{description}}}
{{/each}}

Jika data aktivitas sangat minim (XP < 10 atau Scan < 1), nyatakan bahwa data belum cukup.`
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
        summary: "Siswa baru dalam tahap pengenalan platform.",
        strengths: ["Semangat memulai"],
        weaknesses: ["Data belum cukup"],
        engagementLevel: "Pemula",
        riskLevel: "perhatian",
        teacherRecommendations: ["Berikan bimbingan cara menggunakan scanner", "Ajak siswa mencoba modul batik"],
        studentRecommendations: ["Ayo mulai petualanganmu dengan scan QR pertama!", "Baca komik Misteri Batik ya!"]
      };
    }
  }
);
