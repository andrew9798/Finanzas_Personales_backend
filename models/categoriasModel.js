import connection from "../data/Connection.js"

export default class categoriasModel {
    static async getAll(tipo) {
        const [rows] = await connection.query(
            `SELECT
            id AS id,
            nombre AS nombre,
            tipo AS tipo
        FROM categorias
        WHERE tipo = ?`,
            [tipo]
        );
        return rows;
    }
}