import mysql from "mysql2/promise";

export let connection;

export async function db() {
  connection = await mysql.createConnection({
    host: "tokaido.proxy.rlwy.net",
    port: 10320,
    user: "root",
    password: "cyrkNdQbMDvGsBeZthxYENstycRmLeRp",
    database: "railway",
  });

  console.log("Connected to MySQL");
}