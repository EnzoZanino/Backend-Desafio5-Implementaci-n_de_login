import { Router } from "express";
import productDao from "../daos/dbManager/product.dao.js";

const router = Router();

router.get("/", async (req, res) => {
	try {
		const products = await productDao.getAllProducts();
		if (!req.session.user) {
			res.redirect("/users/login");
			return; // Importante: Terminar la ejecución después de redirigir
		}
		res.render("home", {
			user: req.session.user,
			admin: req.session.admin,
			// session: req.session.counter,
			products,
		});
	} catch (error) {
		console.log(error);
		res.json({
			message: "Error",
			error,
		});
	}
});

router.get("/realtimeproducts", (req, res) => {
	if (!req.session.user) {
		res.redirect("/users/login");
		return; // Importante: Terminar la ejecución después de redirigir
	}
	res.render("realTimeProducts", {
		user: req.session.user,
		title: "realTimeProducts",
		email: req.session.email
	});
});

router.get("/chat", (req, res) => {
	if (!req.session.user) {
		res.redirect("/users/login");
		return; // Importante: Terminar la ejecución después de redirigir
	}
	res.render("chat", {
		title: "Chat",
		user: req.session.user
		}
	)
});

router.get("/login", (req, res) => {
	res.render("login");
});

router.get("/logout", (req, res) => {
	req.session.destroy((error) => {
		if (error) {
			res.json({ error: "Error logout", msg: "Error al cerrar la session" });
		}
		// res.send("Session cerrada correctamente!");
		// res.write('<html><head><title>Mi HTML</title></head><body>');
		// res.write('<h1>Session cerrada correctamente!</h1> <a href="/"><button>Volver al inicio</button></a> <a href="/users/login"><button>Iniciar Sesion</button></a>');
		// res.write('</body></html>');
		// res.end();
		res.redirect("/users/login");
	});
});

// router.get('/homeprivate', auth, async(req, res) => {
// 	if (!req.session.user) {
// 		res.redirect("/users/login");
// 		return; // Importante: Terminar la ejecución después de redirigir
// 	}
//     try {
// 		const products = await productDao.getAllProducts();
// 		res.render("home", {
// 			user: req.session.user,
// 			admin: req.session.admin,
// 			products,
// 		});
// 	} catch (error) {
// 		console.log(error);
// 		res.json({
// 			message: "Error",
// 			error,
// 		});
// 	}
// });

// Middleare auth
function auth(req, res, next) {
    if (req.session.email == 'adminCoder@coder.com' && req.session.admin) {
        return next()
    } else {
        return res.status(403).send("Usuario no autorizado para ingresar a este recurso.");
    }
}

router.get("/cart", (req, res) => {
	if (!req.session.user) {
		res.redirect("/users/login");
		return; // Importante: Terminar la ejecución después de redirigir
	}
	res.render("cart", {
		title: "Cart Ecommerce",
		user: req.session.user
		}
	)
});

router.get("/realTimeProducts/:pid", async (req, res) => {
	try {
		const productId = req.params.pid;
		const product = await productDao.getProductById(productId);

		if (!product || product == "")
			return res.json({ message: "Product not found" });

		res.render("productDetails", { product });
	} catch (error) {
		console.log(error);
		res.json({
			message: "Error",
			error,
		});
	}
});
export default router;
