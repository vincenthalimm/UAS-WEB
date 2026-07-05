import dotenv from "dotenv"
dotenv.config()
import express from "express"
import path from "path"
import { fileURLToPath } from 'url'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'
import db from "./db.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const SECRET_KEY = process.env.JWT_SECRET || "secret-key-123"
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static("public"))

// ============================================
// 🔥 ROOT → LOGIN
// ============================================

app.get("/", (req, res) => {
    res.redirect("/login")
})

// ============================================
// MIDDLEWARE AUTHENTICATION (DENGAN DEBUG)
// ============================================

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies?.token
        console.log("🔍 TOKEN DARI COOKIE:", token ? "ADA" : "TIDAK ADA")
        
        if (!token) {
            console.log("❌ Token tidak ada, redirect ke login")
            return res.redirect('/login')
        }
        
        const decoded = jwt.verify(token, SECRET_KEY)
        console.log("🔍 DECODED USER:", decoded.email)
        
        const [sessions] = await db.execute(
            "SELECT * FROM sessions WHERE user_id = ? AND token = ? AND is_active = TRUE",
            [decoded.id, token]
        )
        console.log("🔍 SESSIONS FOUND:", sessions.length)
        
        if (sessions.length === 0) {
            console.log("❌ Session tidak ditemukan di DB, redirect ke login")
            return res.redirect('/login')
        }
        
        req.user = decoded
        next()
    } catch (error) {
        console.log("❌ ERROR AUTH:", error.message)
        res.redirect('/login')
    }
}

const isAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Akses ditolak" })
        }
        next()
    } catch (error) {
        res.status(403).json({ message: "Akses ditolak" })
    }
}

// ============================================
// AUTH ROUTES
// ============================================

app.get("/login", (req, res) => {
    res.sendFile(path.resolve("public/login.html"))
})

app.get("/signup", (req, res) => {
    res.sendFile(path.resolve("public/signup.html"))
})

app.post("/api/signup", async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body

        if (!email || !password || !confirmPassword) {
            return res.status(400).json({ success: false, message: "Semua field harus diisi" })
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: "Password tidak cocok" })
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Password minimal 6 karakter" })
        }

        const [existing] = await db.execute("SELECT * FROM users WHERE email = ?", [email])
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: "Email sudah terdaftar" })
        }

        const [count] = await db.execute("SELECT COUNT(*) as total FROM users")
        const role = count[0].total === 0 ? 'admin' : 'user'

        await db.execute(
            "INSERT INTO users (email, password, role, is_active) VALUES (?, ?, ?, TRUE)",
            [email, password, role]
        )

        res.status(201).json({ 
            success: true,
            message: "Pendaftaran berhasil! Silakan login.",
            redirect: "/login"
        })
    } catch (error) {
        console.error("Signup error:", error)
        res.status(500).json({ success: false, message: "Gagal mendaftar" })
    }
})

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body

        console.log("📝 Login attempt:", email)

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email dan password harus diisi" })
        }

        const [users] = await db.execute(
            "SELECT * FROM users WHERE email = ? AND is_active = TRUE",
            [email]
        )

        if (users.length === 0) {
            console.log("❌ User tidak ditemukan:", email)
            return res.status(401).json({ success: false, message: "Email atau password salah" })
        }

        const user = users[0]
        const isValid = (password === user.password)

        if (!isValid) {
            console.log("❌ Password salah untuk:", email)
            return res.status(401).json({ success: false, message: "Email atau password salah" })
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            SECRET_KEY,
            { expiresIn: '7d' }
        )

        console.log("✅ Token generated for:", email)

        // INSERT SESSION DENGAN created_at
        await db.execute(
            "INSERT INTO sessions (user_id, token, is_active, created_at) VALUES (?, ?, TRUE, NOW())",
            [user.id, token]
        )

        console.log("✅ Session saved to database")

        // COOKIE DENGAN SAME SITE
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,  // false untuk localhost
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        console.log("✅ Cookie set for:", email)

        res.json({
            success: true,
            message: "Login berhasil",
            redirect: "/dashboard",
            role: user.role
        })
    } catch (error) {
        console.error("❌ Login error:", error)
        res.status(500).json({ success: false, message: "Gagal login" })
    }
})

app.post("/api/logout", async (req, res) => {
    try {
        const token = req.cookies?.token
        if (token) {
            const decoded = jwt.verify(token, SECRET_KEY)
            await db.execute(
                "UPDATE sessions SET is_active = FALSE WHERE user_id = ? AND token = ?",
                [decoded.id, token]
            )
            console.log("👋 Logout:", decoded.email)
        }
        res.clearCookie('token')
        res.json({ success: true, redirect: "/login" })
    } catch (error) {
        res.clearCookie('token')
        res.json({ redirect: "/login" })
    }
})

app.get("/api/me", isAuthenticated, async (req, res) => {
    try {
        const [users] = await db.execute(
            "SELECT id, email, role FROM users WHERE id = ?",
            [req.user.id]
        )
        res.json(users[0] || null)
    } catch (error) {
        res.status(500).json({ message: "Gagal get user" })
    }
})

// ============================================
// PROTECTED PAGES
// ============================================

app.get("/dashboard", isAuthenticated, (req, res) => {
    console.log("✅ Dashboard accessed by:", req.user.email)
    res.sendFile(path.resolve("public/index.html"))
})

app.get("/tambah", isAuthenticated, (req, res) => {
    res.sendFile(path.resolve("public/tambah.html"))
})

app.get("/dataPage", isAuthenticated, (req, res) => {
    res.sendFile(path.resolve("public/data.html"))
})

app.get("/edit/:id", isAuthenticated, (req, res) => {
    res.sendFile(path.resolve("public/edit.html"))
})

app.get("/admin", isAuthenticated, isAdmin, (req, res) => {
    res.sendFile(path.resolve("public/admin.html"))
})

// ============================================
// ADMIN API
// ============================================

app.get("/api/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const [users] = await db.execute(
            "SELECT id, email, role, is_active, created_at FROM users ORDER BY id DESC"
        )
        res.json(users)
    } catch (error) {
        res.status(500).json({ message: "Gagal get users" })
    }
})

app.delete("/api/users/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const userId = parseInt(req.params.id)
        
        if (userId === req.user.id) {
            return res.status(400).json({ success: false, message: "Tidak bisa menghapus akun sendiri" })
        }

        await db.execute("DELETE FROM sessions WHERE user_id = ?", [userId])
        await db.execute("DELETE FROM users WHERE id = ?", [userId])
        
        res.json({ success: true, message: "User berhasil dihapus" })
    } catch (error) {
        res.status(500).json({ success: false, message: "Gagal hapus user" })
    }
})

// ============================================
// DATA ROUTES
// ============================================

app.get("/data", isAuthenticated, async (req, res) => {
    try {
        const [data] = await db.execute("SELECT * FROM catatan ORDER BY id DESC")
        res.json(data)
    } catch (error) {
        res.json([])
    }
})

app.get("/data/:id", isAuthenticated, async (req, res) => {
    try {
        const [data] = await db.execute("SELECT * FROM catatan WHERE id = ?", [req.params.id])
        res.json(data[0] || {})
    } catch (error) {
        res.json({})
    }
})

app.post("/data", isAuthenticated, async (req, res) => {
    try {
        const { k, j, t, c } = req.body
        
        if (!k || !j) {
            return res.json({ success: false, message: "Input kosong" })
        }
        if (isNaN(j)) {
            return res.json({ success: false, message: "Jumlah harus angka" })
        }

        await db.execute(
            "INSERT INTO catatan (keterangan, jumlah, tipe, kategori) VALUES (?, ?, ?, ?)",
            [k, Number(j), t, c || null]
        )

        res.json({ success: true, message: "Tambah berhasil" })
    } catch (error) {
        res.json({ success: false, message: "Gagal tambah" })
    }
})

app.put("/data/:id", isAuthenticated, async (req, res) => {
    try {
        const { k, j, t, c } = req.body
        
        if (!k || !j) {
            return res.json({ success: false, message: "Input kosong" })
        }
        if (isNaN(j)) {
            return res.json({ success: false, message: "Jumlah harus angka" })
        }

        const [result] = await db.execute(
            "UPDATE catatan SET keterangan = ?, jumlah = ?, tipe = ?, kategori = ? WHERE id = ?",
            [k, Number(j), t, c || null, req.params.id]
        )

        if (result.affectedRows === 0) {
            return res.json({ success: false, message: "Data tidak ditemukan" })
        }

        res.json({ success: true, message: "Update berhasil" })
    } catch (error) {
        res.json({ success: false, message: "Gagal update" })
    }
})

app.delete("/data/:id", isAuthenticated, async (req, res) => {
    try {
        await db.execute("DELETE FROM catatan WHERE id = ?", [req.params.id])
        res.json({ success: true, message: "Hapus berhasil" })
    } catch (error) {
        res.json({ success: false, message: "Gagal hapus" })
    }
})

app.delete("/reset", isAuthenticated, isAdmin, async (req, res) => {
    try {
        await db.execute("DELETE FROM catatan")
        res.json({ success: true, message: "Semua data dihapus" })
    } catch (error) {
        res.json({ success: false, message: "Gagal reset" })
    }
})

// ============================================
// START SERVER
// ============================================

app.listen(PORT, '0.0.0.0', () => {
    console.log("========================================")
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`🌐 Local: http://localhost:${PORT}`)
    console.log(`🌐 Network: http://0.0.0.0:${PORT}`)
    console.log(`🌍 Railway URL will be assigned automatically`)
    console.log("========================================")
    console.log("📋 Login: http://localhost:3000/login")
    console.log("📝 Signup: http://localhost:3000/signup")
    console.log("========================================")
    console.log("🔑 Default Admin:")
    console.log("   Email: admin@gmail.com")
    console.log("   Password: admin123")
    console.log("========================================")
})