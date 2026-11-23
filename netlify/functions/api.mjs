// Netlify funksiyasi: brauzer va MySQL (TiDB) o'rtasidagi ko'prik
import mysql from "mysql2/promise";

// Bazaga ulanish. Parol env'dan olinadi, kodda yozilmaydi.
function connect() {
return mysql.createConnection({
host: process.env.DB_HOST,
port: Number(process.env.DB_PORT),
user: process.env.DB_USER,
password: process.env.DB_PASS,
database: process.env.DB_NAME,
ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true },
});
}

function json(data, status = 200) {
return new Response(JSON.stringify(data), {
status,
headers: { "Content-Type": "application/json" },
});
}

export default async (req) => {
l
