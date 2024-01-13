/*=============================================
=     DATOS QUE PUEDEN LLEGAR A SERVIR      =
=============================================*/
router.get('/session', (req, res) => {
    if (req.session.counter) {
        req.session.counter++
        res.send(`Se ha visitado este sitio ${req.session.counter} veces.`)
    } else {
        req.session.counter = 1
        res.send('Bienvenido!!')
    }
});


router.get('/logout', (req, res) => {
    req.session.destroy(error => {
        if (error) {
            res.json({ error: 'Error logout', msg: "Error al cerrar la session" })
        }
        res.send('Session cerrada correctamente!')
    })
});

// if (result.status === 200) {
//     window.location.replace("/users/login");
// }


router.get('/login', (req, res) => {

    const { username, password } = req.query

    if (username != 'pepe' || password !== '123qwe') {
        return res.status(401).send("Login failed, check your credentianls")
    } else {
        req.session.user = username;
        req.session.admin = true;
        res.send('Login Successful!!')
    }
});

// Middleare auth
function auth(req, res, next) {
    if (req.session.user === 'pepe' && req.session.admin) {
        return next()
    } else {
        return res.status(403).send("Usuario no autorizado para ingresar a este recurso.");
    }
}


router.get('/private', auth, (req, res) => {
    res.send('Si estas viendo esto es porque estas autorizado a este recurso!')
});

export default router;
