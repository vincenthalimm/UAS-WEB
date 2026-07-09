import mysql from "mysql2/promise"
import dotenv from "dotenv"

dotenv.config()

let connection = null

async function getConnection() {
    try {
        // Kalau koneksi masih hidup, pakai yang lama
        if (connection) {
            try {
                await connection.ping()
                return connection
            } catch (pingError) {
                console.log("⚠️ Koneksi database mati, reconnect...")
                connection = null
            }
        }

        console.log("🔄 Membuka koneksi database...")
        
        // 🔥 PAKAI MYSQL_URL DARI RAILWAY
        const mysqlUrl = process.env.MYSQL_URL
        
        if (!mysqlUrl) {
            throw new Error("❌ MYSQL_URL tidak ditemukan di environment variables!")
        }
        
        connection = await mysql.createConnection(mysqlUrl)
        console.log("✅ Database connected!")
        return connection
    } catch (error) {
        console.error("❌ Database connection error:", error.message)
        connection = null
        throw error
    }
}

export default getConnection