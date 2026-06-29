# DR-016: Berapakah bilangan pelajar yang dijangka dalam sistem?

## Status
Diputuskan

## Soalan
Apakah skala kapasiti pelajar yang perlu disokong oleh sistem CFK HUB?

## Konteks
Skala sistem menentukan pilihan teknologi, reka bentuk pangkalan data, dan had prestasi yang perlu dipertimbangkan.

## Keputusan
Sistem direka untuk menampung **100 hingga 200 pelajar**.

## Sebab
CFK dijangka berkembang dan sistem perlu bersedia untuk menampung pertumbuhan tersebut tanpa perlu direka semula. Skala 100-200 pelajar mencerminkan sasaran pertumbuhan organisasi dalam jangka terdekat.

## Kesan
- Free tier Firebase Firestore atau Supabase masih lebih dari mencukupi untuk skala ini
- Tiada keperluan pengoptimuman prestasi kompleks (caching, pagination berat)
- Carian dan penapisan pelajar perlu direka dengan indeks asas untuk prestasi yang baik
- Sistem boleh ditingkatkan lagi kemudian jika CFK berkembang melebihi 200 pelajar
