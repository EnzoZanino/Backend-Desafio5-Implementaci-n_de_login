import { Router } from "express";
import productDao from "../daos/dbManager/product.dao.js";
const router = Router();
productDao.model.paginate();
router.get('/', async (req, res) => {
    try {
        const {  limit, page, sort, query } = req.query;

        const options = {
            limit: parseInt(limit, 10) || 10,
            page: parseInt(page, 10) || 1,
            sort: sort === 'asc' ? 'price' : sort === 'desc' ? '-price' : '-createdAt',
        };

        const filter = query ? { $text: { $search: query } } : {};
        const result = await productDao.model.paginate(filter, options);
        const response = {
            status: "success",
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? `/api/products/?limit=${options.limit}&page=${result.prevPage}&sort=${options.sort}` : null,
            nextLink: result.hasNextPage ? `/api/products/?limit=${options.limit}&page=${result.nextPage}&sort=${options.sort}` : null,
        };

        res.json(response);
    } catch (error) {
        console.log(error);
        res.json({
            message: "Error",
            error,
        })
    }
});

router.get('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        const product = await productDao.getProductById( productId )

        if (!product || product == '') return res.json({ message: "Product not found" })

        res.json({ product })
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
        const product = req.body;
        const response = await productDao.createProduct(product)

        res.json({ message: "Ok", response });
    } catch (error) {
        console.log(error);
        res.json({
            message: "Error",
            error
        });
    }
});

router.put('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        const newProduct = req.body
        const response = await productDao.updateProduct(productId, newProduct)
        if (response.modifiedCount == 0) return res.json({ error: "Product not updated", })

        res.json({ response })
    } catch (error) {
        console.log(error);
        res.json({
            message: "Error",
            error
        });
    }
});

router.delete('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        const response = await productDao.deleteProduct(productId)
        if (!response) return res.json({ error: "Product not found" })
        res.json({ response });
    } catch (error) {
        console.log(error);
        res.json({
            message: "Error",
            error
        });
    }
});

export default router;