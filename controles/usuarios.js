const { response, request } = require('express');
const bcryptjs = require('bcryptjs');


const Usuario = require('../models/usuario');

const usuariosGet = async (req = request, res = response) => {

    // const { q, nombre = 'No name', apikey, page = 1, limit } = req.query;
    const { limite = 5, desde = 0 } = req.query;
    const query = { estado: true }

    // const usuarios = await Usuario.find(query)
    //     .skip(Number(desde))
    //     .limit(Number(limite));

    // const total = await Usuario.countDocuments(query);
    const [total, usuarios] = await Promise.all([
        Usuario.countDocuments(query),
        Usuario.find(query)
            .skip(Number(desde))
            .limit(Number(limite))


    ])

    res.json({
        // resp
        total,

        usuarios
    });
}

const usuariosPost = async (req, res) => {


    const { nombre, correo, password, rol } = req.body;
    const usuario = new Usuario({ nombre, correo, password, rol });

    // Verificar si el correo existe


    // Incriptar la contraseña

    const salt = bcryptjs.genSaltSync();
    usuario.password = bcryptjs.hashSync(password, salt);

    // Guradar en BD

    await usuario.save();


    res.status(201).json({


        usuario

    });
}

const usuariosPut = async (req, res) => {
    const { id } = req.params;

    const { _id, password, google, correo, ...resto } = req.body;

    //TODO validar contra base de datos
    if (password) {
        // Incriptar la contraseña

        const salt = bcryptjs.genSaltSync();
        resto.password = bcryptjs.hashSync(password, salt);


    }
    const usuario = await Usuario.findByIdAndUpdate(id, resto);



    res.json(usuario);
}

const usuariosDelete = async(req, res) => {
    const {id} = req.params;

    // Fisicamente lo borramos
    // const usuario = await Usuario.findByIdAndDelete(id);
    const usuario = await Usuario.findByIdAndUpdate(id, {estado: false});
    res.json(usuario);
}

const usuariosPatch = (req, res) => {
    res.json({

        msg: 'patch API - Controlador'
    });
}

module.exports = {
    usuariosGet,
    usuariosPost,
    usuariosPut,
    usuariosDelete,
    usuariosPatch
}

