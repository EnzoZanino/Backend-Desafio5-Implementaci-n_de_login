import { Schema, model } from "mongoose";

const cartSchema = new Schema({
  userId: { type: String, unique: true },
  products: [
    {
      productId: { type: Schema.Types.ObjectId, ref: 'products', required: true },
      quantity: { type: Number, required: true, default: 1 },
    },
  ],
});

const cartModel = model("carts", cartSchema);

export { cartModel };
