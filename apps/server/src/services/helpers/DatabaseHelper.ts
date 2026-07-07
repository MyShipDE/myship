import mysql from "mysql";

export class DatabaseHelper {
    static checkDatabaseConnection(): Promise<boolean> {
        return new Promise((resolve) => {
            const con = mysql.createConnection({
                host: process.env.MYSQL_HOSTNAME,
                user: process.env.MYSQL_USERNAME,
                password: process.env.MYSQL_PASSWORD,
                database: process.env.MYSQL_DATABASE
            });
            con.connect((err) => {
                if (err) {
                    resolve(false);
                }
                con.end();
                resolve(true);
            });
        })
    }
}
