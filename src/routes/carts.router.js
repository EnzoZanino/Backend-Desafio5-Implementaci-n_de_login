import { Router } from "express";
import CartDao from "../daos/dbManager/cart.dao.js";

const router = Router();

router.get('/', async (req, res) => {
    try {
        const carts = await CartDao.getCartByUser();
        res.json(carts);
    } catch (error) {
        console.log(error);
        res.json({
            message: "Error",
            error,
        });
    }
});

router.get('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cart = await CartDao.getCartByUser(cartId);

        if (!cart || cart === '') return res.json({ message: "Cart not found" });

        res.json({ cart });
    } catch (error) {
        console.log(error);
        res.json({
            message: "Error",
            error
        });
    }
});

router.post('/', async (req, res) => {
    try {
        const userId = req.body.userId;
        const response = await CartDao.getCartByUser(userId);
        res.json({ message: "Ok", response });
    } catch (error) {
        console.log(error);
        res.json({
            message: "Error",
            error
        });
    }
});

router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const quantity = req.body.quantity;
        const response = await CartDao.addToCart(cartId, productId, quantity);
        if (response.modifiedCount === 0) {
            return res.json({ error: "Cart not updated" });
        }

        res.json({ response });
    } catch (error) {
        console.log(error);
        res.json({
            message: "Error",
            error
        });
    }
});
router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const newQuantity = req.body.quantity;
        await CartDao.updateProductQuantity(cid, pid, newQuantity);
        res.json({ status: "success", message: "Product quantity updated in the cart" });
    } catch (error) {
        console.log(error);
        res.json({ status: "error", message: "Error updating product quantity in the cart", error });
    }
});
router.put('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const newProducts = req.body.products;
        await CartDao.updateCart(cid, newProducts);
        res.json({ status: "success", message: "Cart updated successfully" });
    } catch (error) {
        console.log(error);
        res.json({ status: "error", message: "Error updating cart", error });
    }
});

router.delete('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const response = await CartDao.clearCart(cartId);
        if (!response) {
            return res.json({ error: "Cart not found" });
        }
        res.json({ response });
    } catch (error) {
        console.log(error);
        res.json({
            message: "Error",
            error
        });
    }
});
router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        await CartDao.removeFromCart(cid, pid);
        res.json({ status: "success", message: "Product removed from the cart" });
    } catch (error) {
        console.log(error);
        res.json({ status: "error", message: "Error removing product from the cart", error });
    }
});

export default router;
