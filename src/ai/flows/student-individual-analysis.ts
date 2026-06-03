'use server';
/**
 * @fileOverview Genkit flow untuk melakukan analisis mendalam individu siswa.
 * Menghasilkan laporan terperinci berbasis data realtime untuk kurikulum ETHNO-ARITH.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StudentDataSchema = z.object({
  nama: z.string(),
  level: z.number(),
  poin: z.number().describe('Total XP siswa'),
  badgeCount: z.number().describe('Jumlah lencana yang dimiliki'),
  completedModules: z.array(z.string()).describe('Daftar NAMA materi yang SELESAI'),
  unfinishedModules: z.array(z.string()).describe('Daftar NAMA materi yang BELUM selesai'),
  activitySummary: z.string().optional().describe('Ringkasan aktivitas terakhir siswa'),
});

const AnalysisOutputSchema = z.object({
  summary: z.string().describe('Ringkasan kemampuan numerasi dan budaya siswa yang menyebutkan nama modul spesifik.'),
  strengths: z.array(z.string()).describe('3-4 Kelebihan utama siswa berdasarkan materi yang dikuasai.'),
  improvementAreas: z.array(z.string()).describe('3-4 Area yang perlu dikembangkan berdasarkan modul yang tertunda.'),
  teacherRecommendations: z.array(z.string()).describe('Saran konkret untuk Guru membantu siswa.'),
  studentRecommendations: z.array(z.string()).describe('Saran langsung untuk Siswa meningkatkan belajarnya.'),
  prediction: z.string().describe('Prediksi perkembangan belajar jika materi spesifik dituntaskan.'),
  riskLevel: z.enum(['aman', 'perhatian', 'risiko']).describe('Tingkat risiko akademik.'),
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
  
Tugas Anda adalah menganalisis data progres siswa secara FAKTUAL, JUJUR, dan DINAMIS berdasarkan daftar modul dan status XP.

DATA KONTEKS:
- Nama: {{{nama}}}
- XP: {{{poin}}}
- Lencana: {{{badgeCount}}}
- Modul Selesai: {{#each completedModules}}{{{this}}}, {{/each}}
- Modul Belum: {{#each unfinishedModules}}{{{this}}}, {{/each}}

ATURAN WAJIB (STRICT RULES):
1. SEBUTKAN NAMA MATERI secara spesifik dalam analisis Anda. 
2. JANGAN PERNAH katakan "Belum ada progres signifikan" jika XP > 0 atau ada modul yang selesai. Jika siswa punya 5 XP sekalipun, hargai itu sebagai bukti interaksi awal.
3. Jika modul selesai ada 1-2, sebutkan modul tersebut di bagian SUMMARY.
4. Jika modul selesai > 2, nyatakan siswa memiliki minat tinggi pada Etnomatematika.
5. Jika XP = 0 dan modul selesai = 0, analisis sebagai fase orientasi (AMAN).
6. Berikan rekomendasi yang BERBEDA untuk Guru dan Siswa.
7. SESUAIKAN TINGKAT RISIKO: 
   - 'aman': XP bertambah dalam log aktivitas atau modul selesai > 0.
   - 'perhatian': XP > 0 tapi modul belum ada yang selesai dalam waktu lama.
   - 'risiko': XP = 0 dan belum ada aktivitas di modul manapun setelah mendaftar.

HASILKAN DALAM BAHASA INDONESIA YANG EDUKATIF BERBASIS DATA NYATA.`,
  prompt: `Lakukan analisis mendalam untuk siswa: {{{nama}}}. 
Gunakan fakta bahwa dia memiliki {{{poin}}} XP dan telah menyelesaikan modul: {{#each completedModules}}{{{this}}}, {{/each}}. 
Modul yang tersisa adalah: {{#each unfinishedModules}}{{{this}}}, {{/each}}.
Ringkasan aktivitas: {{{activitySummary}}}`
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
      // Fallback yang lebih cerdas jika AI gagal
      const hasProgress = input.poin > 0 || input.completedModules.length > 0;
      return {
        summary: hasProgress 
          ? `Siswa atas nama ${input.nama} telah menunjukkan interaksi dengan platform ETHNO-ARITH (XP: ${input.poin}). Fokus saat ini adalah menuntaskan materi ${input.unfinishedModules[0] || 'Nusantara'}.`
          : "Siswa sedang dalam tahap awal eksplorasi platform.",
        strengths: hasProgress ? ["Memiliki kemauan mencoba modul", "Interaksi awal berhasil"] : ["Memulai pendaftaran"],
        improvementAreas: [input.unfinishedModules[0] || "Menyelesaikan modul pertama"],
        teacherRecommendations: ["Berikan dorongan untuk memindai QR pada modul fisik."],
        studentRecommendations: ["Ayo selesaikan modul pertamamu untuk dapat lencana!"],
        prediction: "Siswa akan berkembang setelah memahami konsep dasar numerasi.",
        riskLevel: hasProgress ? "aman" : "perhatian"
      };
    }
  }
);
