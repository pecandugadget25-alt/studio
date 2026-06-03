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
  
Tugas Anda adalah menganalisis data progres siswa secara FAKTUAL, JUJUR, dan DINAMIS berdasarkan daftar modul.

ATURAN WAJIB (STRICT RULES):
1. SEBUTKAN NAMA MATERI secara spesifik dalam analisis Anda (misal: "Batik Nusantara", "Candi Nusantara", "Masjid Al Akbar", "Permainan Tradisional").
2. JANGAN gunakan kalimat generik seperti "siswa aktif", "siswa berkembang", atau "memiliki semangat" jika ada modul yang selesai.
3. JANGAN pernah katakan "data belum mencukupi" jika jumlah XP > 0 atau ada modul selesai.
4. KASUS 0 MODUL SELESAI: Analisis sebagai fase orientasi awal.
5. KASUS 1-2 MODUL SELESAI: Sebutkan nama modul tersebut sebagai bukti penguasaan awal.
6. KASUS SEMUA MODUL SELESAI: Nyatakan jalur pembelajaran telah tuntas dan siswa siap untuk level pengayaan.
7. Gunakan fakta XP ({{{poin}}}) dan Lencana ({{{badgeCount}}}) untuk menilai ketekunan siswa pada materi yang telah diselesaikan.

HASILKAN DALAM BAHASA INDONESIA YANG EDUKATIF DAN PERSONAL BERBASIS DATA NYATA.`,
  prompt: `Lakukan analisis mendalam untuk siswa berikut:
Nama: {{{nama}}}
Level: {{{level}}}
Total XP: {{{poin}}}
Jumlah Lencana: {{{badgeCount}}}
Materi SELESAI: {{#each completedModules}}{{{this}}}, {{/each}}
Materi BELUM Selesai: {{#each unfinishedModules}}{{{this}}}, {{/each}}
Aktivitas: {{{activitySummary}}}

Instruksi Output:
- summary: Narasi (2-3 kalimat) profil belajar. WAJIB sebutkan modul yang telah/belum selesai.
- strengths: Poin kelebihan pada materi spesifik yang sudah diselesaikan.
- improvementAreas: Poin materi spesifik yang harus segera dituntaskan.
- teacherRecommendations: Langkah teknis guru untuk membantu siswa di materi yang belum selesai.
- studentRecommendations: Tips belajar asik bagi siswa agar cepat naik level.
- prediction: Ramalan kemajuan akademik berdasarkan sisa materi yang ada.`
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
        summary: "Siswa sedang dalam tahap awal eksplorasi ETHNO-ARITH. Belum ada progres modul yang tercatat secara signifikan untuk analisis mendalam.",
        strengths: ["Memulai orientasi platform"],
        improvementAreas: ["Menyelesaikan modul pertama", "Mencoba Smart Scan QR"],
        teacherRecommendations: ["Berikan bimbingan untuk melakukan pindaian QR pertama pada materi Batik."],
        studentRecommendations: ["Ayo coba buka modul Batik Nusantara untuk mendapatkan lencana pertamamu!"],
        prediction: "Siswa akan menunjukkan minat tinggi setelah mencoba fitur Augmented Reality.",
        riskLevel: "perhatian"
      };
    }
  }
);
