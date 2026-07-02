let id = null
let parts = window.location.pathname.split("/")

if(parts[1] === "edit"){
    id = parts[2]
}

function getCookie(name) {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(';').shift()
}

const socket = io({
    auth: { token: getCookie('token') }
})

// Socket events
socket.on('connect', () => {
    console.log('✅ Connected to server')
})

socket.on('data-updated', (data) => {
    showNotification(`📢 ${data.message}`)
    if (document.getElementById('data')) ambilData()
    if (document.getElementById('saldo')) ambilData()
})

socket.on('admin-notification', (data) => {
    showNotification(`🔔 ${data.message}`)
})

// Notification
function showNotification(message) {
    const existing = document.querySelector('.notification-toast')
    if (existing) existing.remove()

    const div = document.createElement('div')
    div.className = 'notification-toast'
    div.textContent = message
    document.body.appendChild(div)
    
    setTimeout(() => {
        div.style.animation = 'slideOut 0.5s ease'
        setTimeout(() => div.remove(), 500)
    }, 3000)
}

// Format Rupiah
function rupiah(angka){
    return "Rp " + Number(angka).toLocaleString("id-ID")
}

// Ambil Data
async function ambilData(){
    const res = await fetch("/data")
    const data = await res.json()
    let saldo = 0, masuk = 0, keluar = 0
    let isi = ""

    let search = document.getElementById("search")?.value || ""
    let filter = document.getElementById("filter")?.value || "all"

    for(let d of data){
        if(search && !d.keterangan.toLowerCase().includes(search.toLowerCase())) continue
        if(filter !== "all" && d.tipe !== filter) continue

        if(d.tipe === "masuk"){
            saldo += d.jumlah
            masuk += d.jumlah
        } else {
            saldo -= d.jumlah
            keluar += d.jumlah
        }

        isi += `
        <tr>
            <td>${d.keterangan}</td>
            <td>${rupiah(d.jumlah)}</td>
            <td><span class="${d.tipe === 'masuk' ? 'badge-masuk' : 'badge-keluar'}">${d.tipe}</span></td>
            <td>${d.kategori || "-"}</td>
            <td>
                <div class="table-actions">
                    <a href="/edit/${d.id}" class="btn-edit">✏️ Edit</a>
                    <button class="btn-delete" onclick="hapus(${d.id})">🗑️ Hapus</button>
                </div>
            </td>
        </tr>`
    }

    if(document.getElementById("saldo")){
        document.getElementById("saldo").innerHTML = rupiah(saldo)
    }

    if(document.getElementById("masuk")){
        document.getElementById("masuk").innerHTML = rupiah(masuk)
    }

    if(document.getElementById("keluar")){
        document.getElementById("keluar").innerHTML = rupiah(keluar)
    }

    if(document.getElementById("data")){
        document.getElementById("data").innerHTML = isi || '<tr><td colspan="5" style="padding:20px;opacity:0.6;text-align:center;">Tidak ada data</td></tr>'
    }
}

// Tambah Data
async function tambah(){
    let k = document.getElementById("k").value
    let j = document.getElementById("j").value
    let t = document.getElementById("t").value
    let c = document.getElementById("c").value

    if(!k || !j){
        return alert("Data tidak boleh kosong")
    }

    if(isNaN(j)){
        return alert("Jumlah harus angka")
    }

    j = Number(j)

    await fetch("/data", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({k,j,t,c})
    })

    if (socket) {
        socket.emit('data-changed', { type: 'insert' })
    }

    alert("✅ Berhasil ditambahkan")
    window.location.href = "/dataPage"
}

// Hapus Data
async function hapus(id){
    if(confirm("Yakin mau hapus data ini?")){
        await fetch("/data/" + id, {method:"DELETE"})
        
        if (socket) {
            socket.emit('data-changed', { type: 'delete', id })
        }
        
        ambilData()
    }
}

// Update Data
async function update(){
    if(!id){
        return alert("ID tidak ditemukan")
    }

    let k = document.getElementById("k").value
    let j = document.getElementById("j").value
    let t = document.getElementById("t").value
    let c = document.getElementById("c").value

    if(!k || !j){
        return alert("Data tidak boleh kosong")
    }

    if(isNaN(j)){
        return alert("Jumlah harus angka")
    }

    j = Number(j)

    let res = await fetch("/data/" + id, {
        method:"PUT",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({k,j,t,c})
    })

    let result = await res.json()

    if (socket) {
        socket.emit('data-changed', { type: 'update', id })
    }

    alert(result.message || "✅ Update berhasil")
    window.location.href = "/dataPage"
}

// Load Edit
async function loadEdit(){
    if(!id) return

    let res = await fetch("/data/" + id)
    let d = await res.json()

    document.getElementById("k").value = d.keterangan || ""
    document.getElementById("j").value = d.jumlah || ""
    document.getElementById("t").value = d.tipe || "masuk"
    document.getElementById("c").value = d.kategori || ""
}

// Reset Data
async function resetData(){
    if(confirm("⚠️ Yakin mau hapus SEMUA data?")){
        await fetch("/reset", {method:"DELETE"})
        
        if (socket) {
            socket.emit('data-changed', { type: 'reset' })
        }
        
        ambilData()
        alert("✅ Semua data berhasil direset")
    }
}

// Logout
async function logout() {
    if(confirm("Yakin mau logout?")){
        await fetch('/api/logout', { method: 'POST' })
        window.location.href = '/login'
    }
}

// Check User Role (untuk Admin Link)
async function checkUserRole() {
    try {
        const res = await fetch('/api/me')
        const user = await res.json()
        console.log('User role:', user)
        
        if (user && user.role === 'admin') {
            const adminLink = document.getElementById('adminLink')
            if (adminLink) {
                adminLink.style.display = 'block'
                adminLink.href = '/admin'
                console.log('✅ Admin link shown')
            }
        }
    } catch (error) {
        console.error('Check role error:', error)
        if (!window.location.pathname.includes('/login') && 
            !window.location.pathname.includes('/signup')) {
            window.location.href = '/login'
        }
    }
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    checkUserRole()
    
    if (document.getElementById('data') || document.getElementById('saldo')) {
        ambilData()
    }

    if (document.getElementById('k') && document.getElementById('k').id === 'k') {
        loadEdit()
    }
})