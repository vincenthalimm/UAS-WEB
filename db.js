import mysql from "mysql2/promise"
import dotenv from "dotenv"

dotenv.config()

let connection = null

async function getConnection() {
    try {
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
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || "sql.freedb.tech",
            user: process.env.DB_USER || "u_SZ3MLP",
            password: process.env.DB_PASSWORD || "",
            database: process.env.DB_NAME || "freedb_wd1OANU2",
            port: process.env.DB_PORT || 3306,
            connectTimeout: 30000,
            multipleStatements: true
        })

        console.log("✅ Database connected!")
        return connection
    } catch (error) {
        console.error("❌ Database connection error:", error.message)
        connection = null
        throw error
    }
}

export default getConnection