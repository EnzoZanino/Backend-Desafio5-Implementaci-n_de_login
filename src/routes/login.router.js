import { Router } from "express";
const router = Router();
router.post('/login', (req, res) => {
    const userEmail = req.body.email;
    req.session.currentUserEmail = userEmail;
    res.redirect('/realTimeProducts');
});
export default router;