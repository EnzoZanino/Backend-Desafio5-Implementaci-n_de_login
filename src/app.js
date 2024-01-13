import handlebars from "express-handlebars";
import express from "express";
import mongoose from "mongoose";
import Handlebars from "handlebars";
import { Server } from "socket.io";
import { allowInsecurePrototypeAccess } from "@handlebars/allow-prototype-access";
import { password, db_name, PORT } from "./env.js";
import __dirname from "./dirname.js";
import viewRouter from "./routes/views.router.js";
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import messagesRouter from "./routes/messages.router.js";
import productDao from "./daos/dbManager/product.dao.js";
import messageDao from "./daos/dbManager/message.dao.js";
import cartDao from "./daos/dbManager/cart.dao.js";

import session from "express-session";
import MongoStore from "connect-mongo";

// Imports Routes
import sessionsRouter from "./routes/loginAndRegister/sessions.router.js";
import usersViewRouter from "./routes/LoginAndRegister/users.views.router.js";

// "session-file-store": "^1.5.0" PACKAGE.JSON DELETED (npm uninstall session-file-store)
// import FileStore from 'session-file-store'

const MONGO_URL = `mongodb+srv://enzozanino99:${password}@cluster99.u9fivzm.mongodb.net/${db_name}?retryWrites=true&w=majority`;

// TODO esto se coloca para reducir codigo al usar path.join() (en seccion __dirname) para codigo robusto,compatibilidad...
// import path from "path";
// import { fileURLToPath } from "url";
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// TODO import __dirname from "./dirname.js" ------------------------------------------------------------------;

const app = express();
const httpServer = app.listen(PORT, () =>
	console.log(`Server listening on port: ${PORT}`)
);
const socketServer = new Server(httpServer);
let userEmailApp;

// * mongoose a mongoAtlas--
// mongoose
// 	.connect(`mongodb+srv://enzozanino99:${password}@cluster99.u9fivzm.mongodb.net/${db_name}?retryWrites=true&w=majority`)
//     .then(() => console.log("DB Connected"))
//     .catch((err) => console.log(err))
// * mongoose a mongoAtlas ---> El mongoose de abajo ↓ es a MongoDB compass

// mongoose
// 	.connect(`mongodb://localhost:27017/${db_name}`)
// 	.then(() => console.log("Data base connected"))
// 	.catch((e) => {
// 		console.log("Data base connection error");
// 		console.log(e);
// 	});

// !!!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!!! //
// !!!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!!! //

app.use(
	session({
		//ttl: Time to live in seconds,
		//retries: Reintentos para que el servidor lea el archivo del storage.
		//path: Ruta a donde se buscará el archivo del session store.
		// // Usando --> session-file-store
		// store: new fileStore({ path: "./sessions", ttl: 15, retries: 0 }),

		// Usando --> connect-mongo
		store: MongoStore.create({
			mongoUrl: MONGO_URL,
			//mongoOptions --> opciones de confi para el save de las sessions
			mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
			ttl: 10 * 60,
		}),

		secret: "coderS3cr3t",
		resave: false, // guarda en memoria
		saveUninitialized: true, //lo guarda a penas se crea
	})
);

// !!!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!!! //
// !!!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!-!!! //

app.use(express.json());
//* express.json() analiza y hace accesibles los datos JSON en req.body.
app.use(express.urlencoded({ extended: true }));
//* express.urlencoded() analiza los datos codificados en URL y los hace accesibles en req.body,
//* con extended: true para permitir un análisis más complejo de esos datos. [arrays, o: {objetos: {anidados}}]

app.engine(
	"hbs",
	handlebars.engine({
		extname: "hbs",
		defaultLayout: "main",
		handlebars: allowInsecurePrototypeAccess(Handlebars),
	})
);
app.set("view engine", "hbs");
app.set("views", `${__dirname}/views`);

// app.set("views", path.join(__dirname, "views"));
// ! path.join se utiliza por temas de compatibilidades. es mas robusto asi que mas recomendado de utilizar, pero hacen practicamente lo mismo con o sin
// app.use(express.static(path.join(__dirname, "public")));

app.use(express.static(`${__dirname}/public`));
app.use("/", viewRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/messages", messagesRouter);
//************** New Routers ***************
app.use("/users", usersViewRouter);
app.use("/api/sessions", sessionsRouter);
//************** New Routers ***************

app.get("/getUserEmail", (req, res) => {
	// Simulación: obtén el correo electrónico desde la sesión
	const userEmail = req.session.email || "";

	// Responde con el correo electrónico en formato JSON
	res.json({ email: userEmail });
});

socketServer.on("connection", async (socketClient) => {
	socketClient.on("messageRTP", async (email) => {
		console.log("Cliente Conectado: ", email);
		userEmailApp = email;
		socketClient.emit("realTimeProducts", {
			products: await productDao.getAllProducts(),
			cart: await cartDao.getCartByUser(userEmailApp),
		});
	});

	socketClient.on("addProduct", async (newProduct) => {
		await productDao.createProduct(newProduct);
		socketServer.emit("realTimeProducts", {
			products: await productDao.getAllProducts(),
			cart: await cartDao.getCartByUser(userEmailApp),
		});
	});
	socketClient.on("filtrando", async (email) => {
		socketServer.emit("carroParaFiltro", {
			cart: await cartDao.getCartByUser(email),
		});
	});

	socketClient.on("editProduct", async ({ productId, editedProduct }) => {
		await productDao.updateProduct(productId, editedProduct);
		socketClient.emit("productDetails", {
			product: await productDao.getProductById(productId),
		});
		socketServer.emit("realTimeProducts", {
			products: await productDao.getAllProducts(),
			cart: await cartDao.getCartByUser(userEmailApp),
		});
	});

	socketClient.on("deleteProduct", async (productId) => {
		await productDao.deleteProduct(productId);
		socketServer.emit("realTimeProducts", {
			products: await productDao.getAllProducts(),
			cart: await cartDao.getCartByUser(userEmailApp),
		});
	});

	socketClient.on("userConnected", async (currentUserEmail) => {
		console.log("User connected:", currentUserEmail);
		socketClient.broadcast.emit("newUserConnected", currentUserEmail);

		try {
			const chatHistory = await obtenerHistorialDeChats();
			socketClient.emit("chatHistory", chatHistory);
		} catch (error) {
			console.log("Error al obtener el historial de chats:", error.message);
			socketClient.emit("chatHistory", []);
		}
	});
	async function obtenerHistorialDeChats() {
		try {
			const chatHistory = await messageDao.getAllMessages();
			return chatHistory;
		} catch (error) {
			console.log("Error al obtener el historial de chats:", error.message);
			return [];
		}
	}

	socketClient.on("sendChatMessage", async ({ email, message }) => {
		const newMessage = {
			email,
			message,
			date: new Date(),
		};
		await messageDao.createMessage(newMessage);
		socketServer.emit("newChatMessage", newMessage);
	});

	let userEmail = "";
	socketClient.on("userCartAuth", async (currentUserEmail) => {
		userEmail = currentUserEmail;
		const userCart = await cartDao.getCartByUser(userEmail);
		if (!userCart) {
			userCart = await cartDao.addToCart(userEmail, "", "");
		}
		const productsInfo = await Promise.all(
			userCart.products.map(async (product) => {
				const productInfo = await productDao.getProductById(product.productId);
				return {
					productId: product.productId,
					info: productInfo,
					quantity: product.quantity,
				};
			})
		);
		socketClient.emit("productsCartInfo", productsInfo);
	});
	socketClient.on("addToCart", async ({ productId, currentUserEmail }) => {
		await cartDao.addToCart(currentUserEmail, productId, 1);
		socketClient.emit("realTimeProducts", {
			products: await productDao.getAllProducts(),
			cart: await cartDao.getCartByUser(currentUserEmail),
		});
	});

	socketClient.on("updateCart", async ({ productId, action }) => {
		userEmail = userEmail ? userEmail : userEmailApp;
		const userCart = await cartDao.getCartByUser(userEmail);
		if (userCart) {
			const productIndex = userCart.products.findIndex(
				(item) => item.productId._id.toString() === productId
			);
			if (productIndex !== -1) {
				const product = userCart.products[productIndex];
				switch (action) {
					case "add":
						product.quantity++;
						break;
					case "subtract":
						if (product.quantity > 1) {
							product.quantity--;
						}
						break;
					default:
						break;
				}
				await userCart.save();
				const productsInfo = await Promise.all(
					userCart.products.map(async (product) => {
						const productInfo = await productDao.getProductById(product.productId);
						return {
							productId: product.productId,
							info: productInfo,
							quantity: product.quantity,
						};
					})
				);
				socketClient.emit("productsCartInfo", productsInfo);
				socketClient.emit("realTimeProducts", {
					products: await productDao.getAllProducts(),
					cart: await cartDao.getCartByUser(userEmail),
				});
			}
		}
	});

	socketClient.on("deleteFromCart", async ({ productId }) => {
		try {
			if (productId == null) {
				console.error("productId is null or undefined");
				return;
			}

			await cartDao.removeFromCart(userEmailApp, productId);

			const updatedCart = await cartDao.getCartByUser(userEmailApp);
			const productsInfo = await Promise.all(
				updatedCart.products.map(async (product) => {
					const productInfo = await productDao.getProductById(
						product.productId._id.toString()
					);
					return {
						productId: product.productId._id.toString(),
						info: productInfo,
						quantity: product.quantity,
					};
				})
			);

			socketClient.emit("productsCartInfo", productsInfo);
			socketClient.emit("realTimeProducts", {
				products: await productDao.getAllProducts(),
				cart: updatedCart,
			});
		} catch (error) {
			console.error("Error handling deleteFromCart:", error.message);
		}
	});

	socketClient.on("clearCart", async () => {
		await cartDao.clearCart(userEmailApp);
		socketClient.emit("productsCartInfo", []);
	});
});

/*=============================================
=            connectMongoDB                   =
=============================================*/
const connectMongoDB = async () => {
	try {
		await mongoose.connect(MONGO_URL);
		console.log("Conectado con exito a la DB usando Mongoose!!");
	} catch (error) {
		console.error("No se pudo conectar a la BD usando Moongose: " + error);
		process.exit();
	}
};
connectMongoDB();
