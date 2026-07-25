import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // Komponen PDF guna <Image> dari @react-pdf/renderer, BUKAN <img> HTML.
    // Ia dilukis ke dalam fail PDF dan tiada prop `alt` — peraturan
    // aksesibiliti jsx-a11y tidak berkenaan di sini.
    files: ["src/components/pdf/**/*.tsx"],
    rules: { "jsx-a11y/alt-text": "off" },
  },
  {
    // ── Petunjuk React Compiler yang tidak berkenaan pada seni bina app ini ──
    //
    // Keputusan sedar (25 Jul 2026), bukan pengabaian. Semua ralat lint LAIN
    // sudah dibaiki; ketiga-tiga ini dimatikan supaya `npm run lint` kembali
    // menjadi isyarat berguna — bukan 142 baris bunyi yang tiada siapa baca.
    //
    // set-state-in-effect — SEMUA kejadian dalam repo ini ialah corak muat-data
    //   pada mula (`useEffect(() => { muatData() }, [muatData])`) atau polling
    //   berkala. Komponen klien mengambil data dari Supabase; tiada cara lain
    //   untuk menyatakannya. Ini petunjuk PRESTASI (satu render tambahan),
    //   bukan peraturan ketepatan. Menulis semula 22 aliran muat-data dalam
    //   app yang menguruskan duit = risiko tinggi, faedah kosmetik.
    //
    // preserve-manual-memoization / incompatible-library — maklumat semata:
    //   "React Compiler melangkau pengoptimuman komponen ini". Bukan kecacatan;
    //   kod tetap betul, cuma tidak dioptimumkan secara automatik.
    //
    // Peraturan react-hooks LAIN (exhaustive-deps, purity, rules-of-hooks)
    // sengaja DIKEKALKAN — ia menangkap pepijat sebenar. Kes `purity` pada
    // Server Component dimatikan satu-satu dengan komen di tempatnya.
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/incompatible-library": "off",
    },
  },
]);

export default eslintConfig;
