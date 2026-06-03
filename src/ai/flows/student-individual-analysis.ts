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
  summary: z.string().describe('Ringkasan kemampuan numerasi dan budaya siswa.'),
  strengths: z.array(z.string()).describe('Kelebihan utama siswa.'),
  improvementAreas: z.array(z.string()).describe('Area yang perlu dikembangkan atau modul yang tertunda.'),
  teacherRecommendations: z.array(z.string()).describe('Saran konkret untuk Guru.'),
  studentRecommendations: z.array(z.string()).describe('Saran langsung untuk Siswa.'),
  prediction: z.string().describe('Prediksi perkembangan belajar masa depan.'),
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
  
Tugas Anda adalah menganalisis data progres siswa secara FAKTUAL dan DINAMIS.

ATURAN LOGIKA BERDASARKAN MILESTONE XP:
1. SISWA BARU (XP = 0): Fokus pada motivasi orientasi.
2. AKTIF AWAL (XP 1 - 50): Apresiasi langkah pertama. Jika badgeCount = 0, sarankan lencana pertama.
3. BERKEMBANG (XP 51 - 150): Acknowledge pertumbuhan, fokus pada penyelesaian modul.
4. MAHIR (XP > 150): Fokus pada penguasaan mendalam dan konsistensi.

ATURAN LOGIKA LENCANA (STRICT):
- JIKA badgeCount > 0: DILARANG menggunakan kalimat "dapatkan lencana pertama". Gunakan "Pertahankan progresmu dan kumpulkan lebih banyak lencana".
- JIKA badgeCount = 0: Gunakan "Ayo selesaikan modul pertamamu untuk mendapatkan lencana pertama".

ATURAN LOGIKA MATURITAS:
- JIKA completedModules >= 2: DILARANG menggunakan kata "pemula", "orientasi", atau "lencana pertama". Anggap siswa sudah masuk fase akselerasi.

ATURAN NARASI:
- SEBUTKAN NAMA MATERI secara spesifik (Batik, Candi, Masjid, Permainan).
- Gunakan Bahasa Indonesia yang edukatif dan inspiratif.
- Sesuaikan tingkat RISIKO: 'aman' (progres rutin), 'perhatian' (progres lambat/XP rendah), 'risiko' (tidak ada aktivitas sama sekali).`,
  prompt: `Lakukan analisis untuk siswa bernama {{{nama}}}.
Data Faktual:
- XP: {{{poin}}}
- Jumlah Lencana: {{{badgeCount}}}
- Modul Selesai: {{#each completedModules}}{{{this}}}, {{/each}}
- Modul Belum: {{#each unfinishedModules}}{{{this}}}, {{/each}}
- Ringkasan Aktivitas: {{{activitySummary}}}

Hasilkan analisis yang mendalam dan tidak generik.`
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
      
      // Fallback cerdas berbasis kategori yang diminta user
      const isAdvanced = input.poin > 150;
      const isDeveloping = input.poin > 50 && input.poin <= 150;
      const hasBadges = input.badgeCount > 0;
      const hasModules = input.completedModules.length > 0;

      return {
        summary: hasModules 
          ? `Siswa telah menunjukkan penguasaan materi ${input.completedModules.join(", ")}.`
          : `Siswa sedang memulai eksplorasi pada modul ${input.unfinishedModules[0] || 'Nusantara'}.`,
        strengths: hasModules ? ["Penguasaan modul budaya", "Konsistensi belajar"] : ["Keinginan untuk memulai"],
        improvementAreas: [input.unfinishedModules[0] || "Menyelesaikan modul pertama"],
        teacherRecommendations: ["Berikan apresiasi pada pencapaian XP saat ini."],
        studentRecommendations: hasBadges 
          ? ["Pertahankan progresmu dan kumpulkan lebih banyak lencana!"] 
          : ["Ayo selesaikan modul pertamamu untuk mendapatkan lencana pertama!"],
        prediction: isAdvanced ? "Siswa akan menjadi tutor sebaya yang baik." : "Siswa akan berkembang seiring penyelesaian modul.",
        riskLevel: input.poin > 0 ? "aman" : "perhatian"
      };
    }
  }
);
