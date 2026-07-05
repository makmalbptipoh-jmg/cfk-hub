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
          nota: string | null
          created_at: string
        }
        Insert: {
          id?: string
          jurulatih_id: string
          tarikh: string
          status: 'Hadir' | 'Tidak Hadir' | 'Cuti'
          nota?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          jurulatih_id?: string
          tarikh?: string
          status?: 'Hadir' | 'Tidak Hadir' | 'Cuti'
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
          tarikh_bayar?: string | null
          status?: 'Sudah Bayar' | 'Belum Bayar'
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
