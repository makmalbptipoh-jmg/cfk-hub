# PD-020: Bolehkah Admin tambah atau urus cawangan baharu dalam sistem?

## Status
Diputuskan

## Soalan
Adakah cawangan dalam sistem CFK HUB ditetapkan secara tetap (hardcode) atau boleh diurus oleh Admin sendiri apabila ada cawangan baharu dibuka atau cawangan lama ditutup?

## Konteks
CFK kini mempunyai 4 cawangan (Klebang, Buntong, Sri Iskandar, SMK Star). Terdapat kemungkinan cawangan baharu dibuka pada masa hadapan. Jika cawangan adalah hardcode, setiap perubahan memerlukan bantuan pembangun sistem.

## Pilihan
- **A** — Cawangan ditetapkan (hardcode) dalam sistem — tidak boleh diubah tanpa bantuan pembangun
- **B** — Admin boleh tambah cawangan baharu sahaja
- **C** — Admin boleh tambah, edit nama, dan nyahaktifkan cawangan — cawangan yang ditutup kekal dalam rekod bersejarah

## Keputusan
**Pilihan C** — Admin mempunyai kawalan penuh ke atas pengurusan cawangan:
- **Tambah** cawangan baharu (nama, alamat)
- **Edit** nama atau maklumat cawangan sedia ada
- **Nyahaktifkan** cawangan yang ditutup — status bertukar "Tidak Aktif"; semua rekod lama (kehadiran, bayaran, aset) kekal dikaitkan dengan cawangan tersebut

## Sebab
CFK mungkin membuka cawangan baharu atau menutup cawangan sedia ada tanpa perlu hubungi pembangun sistem. Fleksibiliti ini memastikan sistem kekal relevan jangka panjang. Cawangan yang ditutup tidak boleh dipadam kerana rekod bersejarah (kehadiran, bayaran 7 tahun) masih perlu kekal.

## Kesan
- Modul Tetapan Admin perlu ada seksyen "Pengurusan Cawangan"
- Senarai cawangan dalam semua dropdown (pelajar, kehadiran, perbelanjaan) ditarik dari pangkalan data, bukan hardcode
- Cawangan "Tidak Aktif" tidak muncul dalam dropdown pendaftaran pelajar baharu
- Cawangan "Tidak Aktif" kekal dalam penapisan laporan bersejarah
- Semua modul yang menggunakan cawangan perlu update untuk baca dari pangkalan data
