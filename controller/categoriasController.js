import categoriasModel  from "../models/categoriasModel.js";   

export default class categoriasController {
    static async getAll(req, res) {
        try {
            const tipo = req.params.tipo;
            const categorias = await categoriasModel.getAll(tipo);
            res.status(200).json(categorias);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}