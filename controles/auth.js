const { response, request } = require("express");

const bcryptjs = require('bcryptjs')

const Usuario = require('../models/usuario');
const { generarJWT } = require("../helpers/generar-jwt");
const { googleVerify } = require("../helpers/google-verify");



const login = async(req = request, res = response) => {
    console.log(req.body)


    const { correo, password } = req.body;


    try {

        // Verificar si el email existe
        const usuario = await Usuario.findOne({correo});
        if(!usuario){
            return res.status(400).json({
                msg: 'Usuario / Password no son correctos - correo'
            });
        }

        // Si el usuario esta activo
        if(!usuario.estado){
            return res.status(400).json({
                msg: 'Usuario / Password no son correctos - estado:false'
            });
        }
        


        // Verificar contraseña
        const validPassword = bcryptjs.compareSync(password, usuario.password);
        if(!validPassword){
            return res.status(400).json({
                msg: 'Usuario / Password no son correctos - password'
            });
        }

        

        // Generar el JWT

        const token = await generarJWT(usuario.id);




        res.json({
            usuario,
            token
        })


    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg: 'Hable con el administrador'
        })

    }




}

const googleSignIn = async(req = request, res = response)=>{
    console.log(req.body)
    const {id_token } = req.body;

    try {
        const {nombre, img, correo} = await googleVerify(id_token);
        let usuario = await Usuario.findOne({correo});

        if(!usuario){
            // Tengo que crearlo

            const data = {
                nombre,
                correo,
                password: ':P',
                img,
                google: true,
                rol: 'USER_ROLE'


            };
            usuario= new Usuario(data);
            await usuario.save();
        }

        // Si el usuario en DB
        if(!usuario.estado){
            return res.status(401).json({
                msg: 'Hable con el administrados, usuario bloqueado'
            });
        }

        // Generar el JWT
        const token = await generarJWT(usuario.id);

        res.json({
            usuario, 
            token
        
        })
        
    } catch (error) {
        console.log(error)
        res.status(400).json({
            ok: false,
            msg: 'El Token no se pudo veriifcar'
        })
        
    }
   

}


module.exports = {
    login,
    googleSignIn
}