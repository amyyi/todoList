import express from 'express';
import data from 'mockApi/data/models';

const router = express.Router();

router.get('/', (req, res) => {
    return res.status(200).json(data).end();
});

router.post('/', (req, res) => {
    return res.status(200).end();
});

export default router;
