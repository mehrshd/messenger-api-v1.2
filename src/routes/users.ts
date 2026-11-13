import express from 'express'
import dataBase from '../db.ts';
const router = express.Router();


router.get('/users', async() => {
    const sql = "SELECT * FROM users WHERE 1=1";
    const dataUsers = await dataBase.query(sql)

    return dataUsers
});

export default router