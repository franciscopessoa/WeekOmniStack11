const connection = require('../database/connection');

module.exports = {
    async index (req, res) {

        const {page = 1} = req.query;
        
        const [count] = await connection('incidents').count();
        res.header('X-Total-Count', count['count(*)']);

        const incidents = await connection('incidents').join('ongs', 'ongs.id', '=', 'incidents.ong_id').select(['incidents.*', 'ongs.name', 'ongs.email', 'ongs.whatsapp', 'ongs.city', 'ongs.uf']).limit(5).offset((page -1) * 5);
        return res.json(incidents);
    },

    async create(req, res) {
        const {title, description, value} = req.body;
        const ong_id = req.headers.authorization;

        const [id] = await connection('incidents').insert({
            title, description, value, ong_id
        });
        
        return res.json({id});
    },

    async delete (req, res) {
        const {id} = req.params;
        const ong_id = req.headers.authorization;

        const incident = await connection('incidents').select('ong_id').where('id',id).first();

        // TODO verificar se existe o incident.org_id (rowcount)
        if (incident.ong_id !== ong_id){
            return res.status(401).json({
                error: "Not permitted."
            });
        }

        await connection('incidents').delete().where('id',id);
        return res.status(204).send();
    }
};