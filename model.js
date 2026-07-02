class Transaksi {
    constructor(k, j, t, c){
        this.keterangan = k
        this.jumlah = j
        this.tipe = t
        this.kategori = c
    }
}

class Pemasukan extends Transaksi {
    constructor(k,j,c){
        super(k,j,"masuk",c)
    }
}

class Pengeluaran extends Transaksi {
    constructor(k,j,c){
        super(k,j,"keluar",c)
    }
}

export { Transaksi, Pemasukan, Pengeluaran }