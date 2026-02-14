import connection from "../data/Connection.js"

export default class userModel {
    static async getAll(tipo) {
        const [rows] = await connection.query(
            `SELECT
            id AS id,
            nickname AS nickname,
            gmail AS gmail,
            pass AS pass
        FROM usuarios
        WHERE tipo = ?`,
            [tipo]
        );
        return rows;
    }
}