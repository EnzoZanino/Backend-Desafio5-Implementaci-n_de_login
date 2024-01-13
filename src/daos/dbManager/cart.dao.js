import { cartModel } from "../../models/cart.model.js";

class CartDao {
    constructor() {
        this.model = cartModel;
    }

    async getCartByUser(userId) {
        try {
            let cart = await this.model.findOne({ userId }).populate('products.productId');
            if (!cart) {
                cart = await this.model.create({ userId, products: [] });
            }
            return cart;
        } catch (error) {
            console.log("Error al obtener el carrito:", error.message);
            throw error;
        }
    }


    async addToCart(userId, productId, quantity) {
        let cart = await this.model.findOne({ userId });

        if (!cart) {
            cart = await this.model.create({ userId, products: [] });
        }

        const productIndex = cart.products.findIndex((item) => item.productId._id.toString() === productId.toString());

        if (productIndex !== -1) {
            cart.products[productIndex].quantity += quantity;
        } else {
            cart.products.push({ productId, quantity });
        }

        await cart.save();
        return { modifiedCount: 1 };
    }
    async updateCart(cartId, newProducts) {
        try {
            const cart = await this.model.findById(cartId);
            if (cart) {
                cart.products = newProducts;
                await cart.save();
            }
        } catch (error) {
            console.log("Error updating cart:", error.message);
            throw error;
        }
    }

    async updateProductQuantity(cartId, productId, newQuantity) {
        try {
            const cart = await this.model.findById(cartId);
            if (cart) {
                const productIndex = cart.products.findIndex(item => item.productId.toString() === productId);
                if (productIndex !== -1) {
                    cart.products[productIndex].quantity = newQuantity;
                    await cart.save();
                }
            }
        } catch (error) {
            console.log("Error updating product quantity in the cart:", error.message);
            throw error;
        }
    }


    async removeFromCart(userId, productId) {
        const cart = await this.getCartByUser(userId);
        if (cart) {
            const productIdString = productId.toString();
            cart.products = cart.products.filter((item) => item.productId._id.toString() !== productIdString);
            await cart.save();
        }
    }

    async clearCart(userId) {
        const cart = await this.getCartByUser(userId);
        if (cart) {
            cart.products = [];
            await cart.save();
        }
    }
}

export default new CartDao();
