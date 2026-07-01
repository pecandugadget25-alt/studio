'use server';
/**
 * @fileOverview ETHNO-AI Analysis Flow.
 * Menghasilkan laporan pedagogik profesional berbasis data nyata siswa.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StudentDataSchema = z.object({
  nama: z.string(),
  level: z.number(),
  poin: z.number(),
  badgeCount: z.number(),
  completedMaterials: z.array(z.string()),
  unfinishedMaterials: z.array(z.string()),
});

const AnalysisOutputSchema = z.object({
  status: z.string().describe('Status perkembangan siswa (ORIENTASI, BERKEMBANG, AKTIF, UNGGUL)'),
  ringkasan: z.string().describe('Ringkasan pedagogik kemampuan siswa.'),
  kelebihan: z.array(z.string()).describe('Daftar kelebihan siswa.'),
  areaLatih: z.array(z.string()).describe('Daftar area kompetensi yang perlu ditingkatkan.'),
  saranGuru: z.string().describe('Saran strategis untuk guru.'),
  tipsSiswa: z.string().describe('Pesan personal dan motivasi untuk siswa.'),
  prediksi: z.string().describe('Prediksi perkembangan belajar masa depan.'),
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
  system: `Anda adalah ETHNO-AI, sistem analisis pembelajaran pada platform ETHNO-ARITH.
Tugas Anda adalah menganalisis data siswa dan menghasilkan laporan pedagogik yang ramah guru, profesional, singkat, dan berbasis data nyata.

ATURAN PENTING:
1. JANGAN pernah menampilkan ID siswa, XP mentah, atau data debugging teknis dalam narasi.
2. Gunakan Bahasa Indonesia formal yang mudah dipahami Guru SD.
3. Jangan mengarang prestasi yang tidak didukung data.
4. Jika data masih minim (XP = 0), akui secara profesional.

LOGIKA STATUS:
- XP = 0: "ORIENTASI"
- XP 1-50: "BERKEMBANG"
- XP 51-150: "AKTIF"
- XP > 150: "UNGGUL"

LOGIKA AREA LATIH:
Ubah nama materi menjadi area kompetensi berikut (Maksimal 2):
- "Bangun Ruang Candi Jawi" -> "Numerasi pada bentuk bangun ruang candi"
- "Candi Penataran" -> "Numerasi pada struktur bangunan bersejarah"
- "Gajah Mungkur" -> "Numerasi pada pengamatan bentuk ruang"
- "Jembatan Merah" -> "Numerasi pada bentuk dan konstruksi"
- "Keraton Sumenep" -> "Numerasi pada pola arsitektur budaya"

LOGIKA RINGKASAN:
- XP = 0: "Siswa masih berada pada tahap orientasi awal platform ETHNO-ARITH. Aktivitas belum mencukupi untuk pemetaan mendalam."
- Materi 1-2 selesai: "Siswa menunjukkan keterlibatan awal dalam pembelajaran berbasis budaya dan mulai membangun pemahaman materi."
- Materi 3+ selesai: "Siswa menunjukkan konsistensi belajar yang baik dan telah menguasai sebagian besar materi budaya."`,
  prompt: `Analisis siswa berikut:
Nama: {{{nama}}}
XP: {{{poin}}}
Badge: {{{badgeCount}}}
Materi Selesai: {{#each completedMaterials}}{{{this}}}, {{/each}}
Materi Belum: {{#each unfinishedMaterials}}{{{this}}}, {{/each}}

Hasilkan laporan dalam format JSON sesuai skema yang ditentukan.`
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
      if (!output) throw new Error('AI Analysis failed');
      return output;
    } catch (error) {
      console.error('AI Flow Error:', error);
      
      // Fallback Logic
      let status = "ORIENTASI";
      if (input.poin > 150) status = "UNGGUL";
      else if (input.poin > 50) status = "AKTIF";
      else if (input.poin > 0) status = "BERKEMBANG";

      return {
        status,
        ringkasan: input.poin === 0 ? "Siswa masih berada pada tahap orientasi awal." : "Siswa sedang dalam proses membangun pemahaman numerasi budaya.",
        kelebihan: ["Memiliki kesiapan mengikuti pembelajaran"],
        areaLatih: ["Eksplorasi materi numerasi dasar"],
        saranGuru: "Dampingi siswa dalam eksplorasi awal fitur aplikasi.",
        tipsSiswa: "Ayo mulai petualanganmu dengan menyelesaikan satu aktivitas hari ini!",
        prediksi: "Siswa akan berkembang seiring peningkatan interaksi dengan materi."
      };
    }
  }
);
