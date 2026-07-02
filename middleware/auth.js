import jwt from 'jsonwebtoken'
import db from '../db.js'

const SECRET_KEY = "secret-key-123"

export const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies?.token
        if (!token) return res.redirect('/login')
        
        const decoded = jwt.verify(token, SECRET_KEY)
        const [sessions] = await db.execute(
            "SELECT * FROM sessions WHERE user_id = ? AND token = ? AND is_active = TRUE",
            [decoded.id, token]
        )
        if (sessions.length === 0) return res.redirect('/login')
        
        req.user = decoded
        next()
    } catch (error) {
        res.redirect('/login')
    }
}

export const isAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Akses ditolak" })
        }
        next()
    } catch (error) {
        res.status(403).json({ message: "Akses ditolak" })
    }
}