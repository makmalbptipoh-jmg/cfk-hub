# DR-034: Adakah sistem memerlukan modul pendaftaran dan pengurusan aset?

## Status
Diputuskan

## Soalan
Adakah CFK HUB perlu menyediakan fungsi untuk mendaftar dan mengurus aset fizikal milik organisasi CFK?

## Konteks
CFK memiliki aset fizikal seperti set catur, papan catur, meja, kerusi, dan peralatan lain yang tersebar di pelbagai cawangan. Tanpa sistem pendaftaran aset, sukar untuk tahu bilangan, lokasi, dan status setiap aset.

## Keputusan
**Ya** — sistem perlu menyediakan modul pengurusan aset yang merangkumi:

**Pendaftaran Aset:**
- Nama aset
- Kategori (peralatan catur, perabot, elektronik, dll.)
- Nombor siri / kod aset (jika ada)
- Tarikh perolehan
- Kos perolehan
- Cawangan / lokasi aset
- Status aset (Aktif / Rosak / Dilupuskan)

**Pengurusan Aset:**
- Kemaskini status aset
- Pindah aset antara cawangan
- Rekod penyelenggaraan atau pembaikan
- Laporan senarai aset per cawangan

## Sebab
Pendaftaran aset membolehkan CFK:
1. Tahu dengan tepat apa yang dimiliki dan di mana ia berada
2. Rekod kos perolehan aset — berkaitan dengan rekod perbelanjaan (DR-033)
3. Urus aset yang rosak atau perlu diganti
4. Sokong pelaporan aset untuk tujuan kewangan dan audit

## Kesan
- Modul baharu "Aset" perlu dibangunkan
- Rekod perolehan aset perlu dikaitkan dengan modul Kewangan (DR-033) sebagai perbelanjaan
- Laporan senarai aset dan nilai aset perlu disokong
- Hanya Admin yang boleh tambah, edit, atau padam rekod aset
- Jurulatih boleh lihat senarai aset di cawangan mereka
- Menambah skop pembangunan — perlu diambil kira dalam jadual pelancaran (DR-030)
