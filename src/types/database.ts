export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      cawangan: {
        Row: {
          id: string
          nama: string
          alamat: string | null
          no_telefon: string | null
          status: 'Aktif' | 'Tidak Aktif'
          created_at: string
        }
        Insert: {
          id?: string
          nama: string
          alamat?: string | null
          no_telefon?: string | null
          status?: 'Aktif' | 'Tidak Aktif'
          created_at?: string
        }
        Update: {
          id?: string
          nama?: string
          alamat?: string | null
          no_telefon?: string | null
          status?: 'Aktif' | 'Tidak Aktif'
          created_at?: string
        }
        Relationships: []
      }
      pengguna_profil: {
        Row: {
          id: string
          nama: string
          is_admin: boolean
          cawangan_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          nama: string
          is_admin?: boolean
          cawangan_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          nama?: string
          is_admin?: boolean
          cawangan_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      pelajar: {
        Row: {
          id: string
          nama_penuh: string
          tarikh_lahir: string | null
          nama_ibu_bapa: string
          no_telefon: string
          emel_ibu_bapa: string | null
          alamat: string | null
          keluarga_id: string | null
          cawangan_daftar_id: string
          jenis_kelas: 'Kumpulan' | 'Personal' | 'Kumpulan+Personal'
          yuran_bulanan: number
          status: 'Aktif' | 'Tidak Aktif'
          tarikh_daftar: string
          sumber_daftar: 'GoogleForms' | 'Manual'
          created_at: string
        }
        Insert: {
          id?: string
          nama_penuh: string
          tarikh_lahir?: string | null
          nama_ibu_bapa: string
          no_telefon: string
          emel_ibu_bapa?: string | null
          alamat?: string | null
          keluarga_id?: string | null
          cawangan_daftar_id: string
          jenis_kelas?: 'Kumpulan' | 'Personal' | 'Kumpulan+Personal'
          yuran_bulanan: number
          status?: 'Aktif' | 'Tidak Aktif'
          tarikh_daftar?: string
          sumber_daftar?: 'GoogleForms' | 'Manual'
          created_at?: string
        }
        Update: {
          id?: string
          nama_penuh?: string
          tarikh_lahir?: string | null
          nama_ibu_bapa?: string
          no_telefon?: string
          emel_ibu_bapa?: string | null
          alamat?: string | null
          keluarga_id?: string | null
          cawangan_daftar_id?: string
          jenis_kelas?: 'Kumpulan' | 'Personal' | 'Kumpulan+Personal'
          yuran_bulanan?: number
          status?: 'Aktif' | 'Tidak Aktif'
          tarikh_daftar?: string
          sumber_daftar?: 'GoogleForms' | 'Manual'
          created_at?: string
        }
        Relationships: []
      }
      kehadiran: {
        Row: {
          id: string
          pelajar_id: string
          tarikh: string
          status: 'Hadir' | 'Tidak Hadir' | 'Cuti'
          nota: string | null
          cawangan_daftar_id: string
          cawangan_sesi_id: string
          jurulatih_id: string | null
          direkod_oleh: string | null
          created_at: string
        }
        Insert: {
          id?: string
          pelajar_id: string
          tarikh: string
          status: 'Hadir' | 'Tidak Hadir' | 'Cuti'
          nota?: string | null
          cawangan_daftar_id: string
          cawangan_sesi_id: string
          jurulatih_id?: string | null
          direkod_oleh?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          pelajar_id?: string
          tarikh?: string
          status?: 'Hadir' | 'Tidak Hadir' | 'Cuti'
          nota?: string | null
          cawangan_daftar_id?: string
          cawangan_sesi_id?: string
          jurulatih_id?: string | null
          direkod_oleh?: string | null
          created_at?: string
        }
        Relationships: []
      }
      resit: {
        Row: {
          id: string
          nombor_resit: string
          pelajar_id: string
          bulan_bayaran: string
          tahun_bayaran: number
          jenis: 'Kumpulan' | 'Personal' | 'Pendaftaran'
          jumlah: number
          bil_kelas: number | null
          kaedah_bayaran: 'Tunai' | 'Transfer' | null
          tarikh_bayar: string
          status: 'Aktif' | 'Dibatalkan'
          sebab_batal: string | null
          tarikh_batal: string | null
          dibatal_oleh: string | null
          direkod_oleh: string | null
          created_at: string
        }
        Insert: {
          id?: string
          nombor_resit?: string
          pelajar_id: string
          bulan_bayaran: string
          tahun_bayaran: number
          jenis: 'Kumpulan' | 'Personal' | 'Pendaftaran'
          jumlah: number
          bil_kelas?: number | null
          kaedah_bayaran?: 'Tunai' | 'Transfer' | null
          tarikh_bayar: string
          status?: 'Aktif' | 'Dibatalkan'
          sebab_batal?: string | null
          tarikh_batal?: string | null
          dibatal_oleh?: string | null
          direkod_oleh?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          nombor_resit?: string
          pelajar_id?: string
          bulan_bayaran?: string
          tahun_bayaran?: number
          jenis?: 'Kumpulan' | 'Personal' | 'Pendaftaran'
          jumlah?: number
          kaedah_bayaran?: 'Tunai' | 'Transfer' | null
          tarikh_bayar?: string
          status?: 'Aktif' | 'Dibatalkan'
          sebab_batal?: string | null
          tarikh_batal?: string | null
          dibatal_oleh?: string | null
          direkod_oleh?: string | null
          created_at?: string
        }
        Relationships: []
      }
      jurulatih: {
        Row: {
          id: string
          pengguna_id: string | null
          gambar_path: string | null
          nama_penuh: string
          no_ic: string | null
          no_telefon: string | null
          emel: string | null
          cawangan_ids: string[]
          kadar_bayaran: number | null
          tarikh_mula: string | null
          pengalaman_ringkas: string | null
          kelayakan: string | null
          no_tng: string | null
          tng_qr_path: string | null
          status: 'Aktif' | 'Tidak Aktif'
          created_at: string
        }
        Insert: {
          id?: string
          pengguna_id?: string | null
          gambar_path?: string | null
          nama_penuh: string
          no_ic?: string | null
          no_telefon?: string | null
          emel?: string | null
          cawangan_ids?: string[]
          kadar_bayaran?: number | null
          tarikh_mula?: string | null
          pengalaman_ringkas?: string | null
          kelayakan?: string | null
          no_tng?: string | null
          tng_qr_path?: string | null
          status?: 'Aktif' | 'Tidak Aktif'
          created_at?: string
        }
        Update: {
          id?: string
          pengguna_id?: string | null
          gambar_path?: string | null
          nama_penuh?: string
          no_ic?: string | null
          no_telefon?: string | null
          emel?: string | null
          cawangan_ids?: string[]
          kadar_bayaran?: number | null
          tarikh_mula?: string | null
          pengalaman_ringkas?: string | null
          kelayakan?: string | null
          no_tng?: string | null
          tng_qr_path?: string | null
          status?: 'Aktif' | 'Tidak Aktif'
          created_at?: string
        }
        Relationships: []
      }
      kehadiran_jurulatih: {
        Row: {
          id: string
          jurulatih_id: string
          tarikh: string
          status: 'Hadir' | 'Tidak Hadir' | 'Cuti'
          cawangan_id: string | null
          jenis_kelas: 'Kumpulan' | 'Personal'
          nota: string | null
          created_at: string
        }
        Insert: {
          id?: string
          jurulatih_id: string
          tarikh: string
          status: 'Hadir' | 'Tidak Hadir' | 'Cuti'
          cawangan_id?: string | null
          jenis_kelas?: 'Kumpulan' | 'Personal'
          nota?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          jurulatih_id?: string
          tarikh?: string
          status?: 'Hadir' | 'Tidak Hadir' | 'Cuti'
          cawangan_id?: string | null
          jenis_kelas?: 'Kumpulan' | 'Personal'
          nota?: string | null
          created_at?: string
        }
        Relationships: []
      }
      bayaran_jurulatih: {
        Row: {
          id: string
          jurulatih_id: string
          bulan_bayaran: string
          tahun_bayaran: number
          bilangan_sesi: number
          kadar_per_sesi: number
          jumlah: number
          potongan_advance: number
          kaedah_bayaran: string | null
          tarikh_bayar: string | null
          status: 'Sudah Bayar' | 'Belum Bayar'
          nota: string | null
          direkod_oleh: string | null
          created_at: string
        }
        Insert: {
          id?: string
          jurulatih_id: string
          bulan_bayaran: string
          tahun_bayaran: number
          bilangan_sesi: number
          kadar_per_sesi: number
          potongan_advance?: number
          kaedah_bayaran?: string | null
          tarikh_bayar?: string | null
          status?: 'Sudah Bayar' | 'Belum Bayar'
          nota?: string | null
          direkod_oleh?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          jurulatih_id?: string
          bulan_bayaran?: string
          tahun_bayaran?: number
          bilangan_sesi?: number
          kadar_per_sesi?: number
          potongan_advance?: number
          kaedah_bayaran?: string | null
          tarikh_bayar?: string | null
          status?: 'Sudah Bayar' | 'Belum Bayar'
          nota?: string | null
          direkod_oleh?: string | null
          created_at?: string
        }
        Relationships: []
      }
      advance_jurulatih: {
        Row: {
          id: string
          jurulatih_id: string
          jumlah: number
          baki: number
          tarikh_advance: string
          kaedah_bayaran: string | null
          status: 'Belum Selesai' | 'Selesai'
          bayaran_id: string | null
          nota: string | null
          direkod_oleh: string | null
          created_at: string
        }
        Insert: {
          id?: string
          jurulatih_id: string
          jumlah: number
          baki: number
          tarikh_advance: string
          kaedah_bayaran?: string | null
          status?: 'Belum Selesai' | 'Selesai'
          bayaran_id?: string | null
          nota?: string | null
          direkod_oleh?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          jurulatih_id?: string
          jumlah?: number
          baki?: number
          tarikh_advance?: string
          kaedah_bayaran?: string | null
          status?: 'Belum Selesai' | 'Selesai'
          bayaran_id?: string | null
          nota?: string | null
          direkod_oleh?: string | null
          created_at?: string
        }
        Relationships: []
      }
      kewangan_perbelanjaan: {
        Row: {
          id: string
          tarikh: string
          kategori: string
          penerangan: string
          jumlah: number
          cawangan_id: string | null
          direkod_oleh: string | null
          bukti_path: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tarikh: string
          kategori: string
          penerangan: string
          jumlah: number
          cawangan_id?: string | null
          direkod_oleh?: string | null
          bukti_path?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tarikh?: string
          kategori?: string
          penerangan?: string
          jumlah?: number
          cawangan_id?: string | null
          direkod_oleh?: string | null
          bukti_path?: string | null
          created_at?: string
        }
        Relationships: []
      }
      aset: {
        Row: {
          id: string
          nama: string
          kategori: string | null
          kuantiti: number
          harga_seunit: number | null
          nilai_asal: number | null
          tarikh_beli: string | null
          cawangan_id: string | null
          status: 'Aktif' | 'Lupus'
          sebab_lupus: string | null
          tarikh_lupus: string | null
          nota: string | null
          created_at: string
        }
        Insert: {
          id?: string
          nama: string
          kategori?: string | null
          kuantiti?: number
          harga_seunit?: number | null
          nilai_asal?: number | null
          tarikh_beli?: string | null
          cawangan_id?: string | null
          status?: 'Aktif' | 'Lupus'
          sebab_lupus?: string | null
          tarikh_lupus?: string | null
          nota?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          nama?: string
          kategori?: string | null
          kuantiti?: number
          harga_seunit?: number | null
          nilai_asal?: number | null
          tarikh_beli?: string | null
          cawangan_id?: string | null
          status?: 'Aktif' | 'Lupus'
          sebab_lupus?: string | null
          tarikh_lupus?: string | null
          nota?: string | null
          created_at?: string
        }
        Relationships: []
      }
      import_antrian: {
        Row: {
          id: string
          nama_penuh: string
          tarikh_lahir: string | null
          nama_ibu_bapa: string | null
          no_telefon: string | null
          cawangan_pilihan: string | null
          adalah_pendua: boolean
          status: 'Menunggu' | 'Diimport' | 'Ditolak'
          tarikh_submit: string | null
          created_at: string
        }
        Insert: {
          id?: string
          nama_penuh: string
          tarikh_lahir?: string | null
          nama_ibu_bapa?: string | null
          no_telefon?: string | null
          cawangan_pilihan?: string | null
          adalah_pendua?: boolean
          status?: 'Menunggu' | 'Diimport' | 'Ditolak'
          tarikh_submit?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          nama_penuh?: string
          tarikh_lahir?: string | null
          nama_ibu_bapa?: string | null
          no_telefon?: string | null
          cawangan_pilihan?: string | null
          adalah_pendua?: boolean
          status?: 'Menunggu' | 'Diimport' | 'Ditolak'
          tarikh_submit?: string | null
          created_at?: string
        }
        Relationships: []
      }
      makluman_histori: {
        Row: {
          id: string
          jenis: 'Yuran' | 'Kelas' | 'Pertandingan' | 'Pembatalan'
          penerima: string
          teks: string
          penghantar_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          jenis: 'Yuran' | 'Kelas' | 'Pertandingan' | 'Pembatalan'
          penerima: string
          teks: string
          penghantar_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          jenis?: 'Yuran' | 'Kelas' | 'Pertandingan' | 'Pembatalan'
          penerima?: string
          teks?: string
          penghantar_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      notifikasi: {
        Row: {
          id: string
          jenis: string
          tajuk: string
          mesej: string
          pautan: string | null
          kunci: string | null
          rujukan_id: string | null
          dibaca: boolean
          dibaca_pada: string | null
          created_at: string
        }
        Insert: {
          id?: string
          jenis: string
          tajuk: string
          mesej: string
          pautan?: string | null
          kunci?: string | null
          rujukan_id?: string | null
          dibaca?: boolean
          dibaca_pada?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          jenis?: string
          tajuk?: string
          mesej?: string
          pautan?: string | null
          kunci?: string | null
          rujukan_id?: string | null
          dibaca?: boolean
          dibaca_pada?: string | null
          created_at?: string
        }
        Relationships: []
      }
      pendapatan_lain: {
        Row: {
          id: string
          tarikh: string
          sumber: string
          kategori: string
          jumlah: number
          kaedah: string
          cawangan_id: string | null
          nota: string | null
          bukti_path: string | null
          no_resit: string | null
          dokumen_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tarikh: string
          sumber: string
          kategori: string
          jumlah: number
          kaedah?: string
          cawangan_id?: string | null
          nota?: string | null
          bukti_path?: string | null
          no_resit?: string | null
          dokumen_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tarikh?: string
          sumber?: string
          kategori?: string
          jumlah?: number
          kaedah?: string
          cawangan_id?: string | null
          nota?: string | null
          bukti_path?: string | null
          no_resit?: string | null
          dokumen_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      dokumen_jualan: {
        Row: {
          id: string
          no_dokumen: string
          tarikh: string
          peringkat: 'Sebut Harga' | 'Invois' | 'Resit'
          kategori: string
          pembeli_nama: string
          pembeli_alamat: string | null
          pembeli_telefon: string | null
          pembeli_emel: string | null
          pembeli_pic: string | null
          kaedah_bayaran: 'Tunai' | 'Transfer' | null
          maklumat_bayaran: string | null
          tarikh_bayar: string | null
          sah_sehingga: string | null
          cawangan_id: string | null
          nota: string | null
          created_at: string
        }
        Insert: {
          id?: string
          no_dokumen?: string
          tarikh: string
          peringkat?: 'Sebut Harga' | 'Invois' | 'Resit'
          kategori?: string
          pembeli_nama: string
          pembeli_alamat?: string | null
          pembeli_telefon?: string | null
          pembeli_emel?: string | null
          pembeli_pic?: string | null
          kaedah_bayaran?: 'Tunai' | 'Transfer' | null
          maklumat_bayaran?: string | null
          tarikh_bayar?: string | null
          sah_sehingga?: string | null
          cawangan_id?: string | null
          nota?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          no_dokumen?: string
          tarikh?: string
          peringkat?: 'Sebut Harga' | 'Invois' | 'Resit'
          kategori?: string
          pembeli_nama?: string
          pembeli_alamat?: string | null
          pembeli_telefon?: string | null
          pembeli_emel?: string | null
          pembeli_pic?: string | null
          kaedah_bayaran?: 'Tunai' | 'Transfer' | null
          maklumat_bayaran?: string | null
          tarikh_bayar?: string | null
          sah_sehingga?: string | null
          cawangan_id?: string | null
          nota?: string | null
          created_at?: string
        }
        Relationships: []
      }
      dokumen_item: {
        Row: {
          id: string
          dokumen_id: string
          urutan: number
          perihalan: string
          kuantiti: number
          harga_seunit: number
        }
        Insert: {
          id?: string
          dokumen_id: string
          urutan?: number
          perihalan: string
          kuantiti?: number
          harga_seunit?: number
        }
        Update: {
          id?: string
          dokumen_id?: string
          urutan?: number
          perihalan?: string
          kuantiti?: number
          harga_seunit?: number
        }
        Relationships: []
      }
      log_aktiviti: {
        Row: {
          id: string
          pengguna_id: string | null
          pengguna_nama: string | null
          aksi: string
          jadual: string
          rekod_id: string | null
          data: Record<string, unknown> | null
          created_at: string
        }
        Insert: {
          id?: string
          pengguna_id?: string | null
          pengguna_nama?: string | null
          aksi: string
          jadual: string
          rekod_id?: string | null
          data?: Record<string, unknown> | null
          created_at?: string
        }
        Update: {
          id?: string
          pengguna_id?: string | null
          pengguna_nama?: string | null
          aksi?: string
          jadual?: string
          rekod_id?: string | null
          data?: Record<string, unknown> | null
          created_at?: string
        }
        Relationships: []
      }
      jadual_slot: {
        Row: {
          id: string
          jenis: 'Kumpulan' | 'Personal'
          hari_minggu: number
          masa_mula: string
          masa_tamat: string
          cawangan_id: string | null
          pelajar_id: string | null
          jurulatih_ids: string[]
          lokasi: string | null
          nota: string | null
          status: 'Aktif' | 'Tidak Aktif'
          created_at: string
        }
        Insert: {
          id?: string
          jenis: 'Kumpulan' | 'Personal'
          hari_minggu: number
          masa_mula: string
          masa_tamat: string
          cawangan_id?: string | null
          pelajar_id?: string | null
          jurulatih_ids?: string[]
          lokasi?: string | null
          nota?: string | null
          status?: 'Aktif' | 'Tidak Aktif'
          created_at?: string
        }
        Update: {
          id?: string
          jenis?: 'Kumpulan' | 'Personal'
          hari_minggu?: number
          masa_mula?: string
          masa_tamat?: string
          cawangan_id?: string | null
          pelajar_id?: string | null
          jurulatih_ids?: string[]
          lokasi?: string | null
          nota?: string | null
          status?: 'Aktif' | 'Tidak Aktif'
          created_at?: string
        }
        Relationships: []
      }
      jadual_slot_batal: {
        Row: {
          id: string
          slot_id: string
          tarikh: string
          sebab: string | null
          direkod_oleh: string | null
          created_at: string
        }
        Insert: {
          id?: string
          slot_id: string
          tarikh: string
          sebab?: string | null
          direkod_oleh?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          slot_id?: string
          tarikh?: string
          sebab?: string | null
          direkod_oleh?: string | null
          created_at?: string
        }
        Relationships: []
      }
      aktiviti: {
        Row: {
          id: string
          nama: string
          kategori: 'Pertandingan' | 'Kem' | 'Mesyuarat' | 'Kelas Personal' | 'Kelas Ganti' | 'Lain-lain'
          tarikh: string
          masa_mula: string | null
          masa_tamat: string | null
          lokasi: string | null
          cawangan_id: string | null
          pelajar_id: string | null
          jurulatih_ids: string[]
          penerangan: string | null
          status: 'Aktif' | 'Dibatalkan'
          created_at: string
        }
        Insert: {
          id?: string
          nama: string
          kategori?: 'Pertandingan' | 'Kem' | 'Mesyuarat' | 'Kelas Personal' | 'Kelas Ganti' | 'Lain-lain'
          tarikh: string
          masa_mula?: string | null
          masa_tamat?: string | null
          lokasi?: string | null
          cawangan_id?: string | null
          pelajar_id?: string | null
          jurulatih_ids?: string[]
          penerangan?: string | null
          status?: 'Aktif' | 'Dibatalkan'
          created_at?: string
        }
        Update: {
          id?: string
          nama?: string
          kategori?: 'Pertandingan' | 'Kem' | 'Mesyuarat' | 'Kelas Personal' | 'Kelas Ganti' | 'Lain-lain'
          tarikh?: string
          masa_mula?: string | null
          masa_tamat?: string | null
          lokasi?: string | null
          cawangan_id?: string | null
          pelajar_id?: string | null
          jurulatih_ids?: string[]
          penerangan?: string | null
          status?: 'Aktif' | 'Dibatalkan'
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      jana_nombor_resit: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
