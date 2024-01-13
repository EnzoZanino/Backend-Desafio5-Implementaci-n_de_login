import { Router } from "express";
import MessageDao from "../daos/dbManager/message.dao.js";

const router = Router();

router.get('/', async (req, res) => {
    try {
        const messages = await MessageDao.getAllMessages();
        res.json(messages);
    } catch (error) {
        console.log(error);
        res.json({
            message: "Error",
            error,
        });
    }
});

router.get('/:mid', async (req, res) => {
    try {
        const messageId = req.params.mid;
        const message = await MessageDao.getMessageById(messageId);

        if (!message || message === '') return res.json({ message: "Message not found" });

        res.json({ message });
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
        const message = req.body;
        const response = await MessageDao.createMessage(message);

        res.json({ message: "Ok", response });
    } catch (error) {
        console.log(error);
        res.json({
            message: "Error",
            error
        });
    }
});

router.put('/:mid', async (req, res) => {
    try {
        const messageId = req.params.mid;
        const newMessage = req.body;
        const response = await MessageDao.updateMessage(messageId, newMessage);
        if (response.modifiedCount === 0) return res.json({ error: "Message not updated" });

        res.json({ response });
    } catch (error) {
        console.log(error);
        res.json({
            message: "Error",
            error
        });
    }
});

router.delete('/:mid', async (req, res) => {
    try {
        const messageId = req.params.mid;
        const response = await MessageDao.deleteMessage(messageId);
        if (!response) return res.json({ error: "Message not found" });
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
