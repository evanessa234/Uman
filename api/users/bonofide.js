const express = require('express');

const db = require('../dbConnection');

const router = express.Router();

router.get("/bonofide", async(req, res) =>{
    const rollNo = req.body.rollNo;
    try{
        const conn = await db();
        await conn.query('START TRANSACTION');
        const result = await conn.query(`SELECT * FROM \`student\` WHERE \`rollno\` = ${rollNo}`);
        await conn.query('COMMIT');
        res.status(200).json({
            success: 1,
            data: result
        });
    }catch (err){
        res.status(500).json({
            success: 0,
            error: err,
            message: "Database connection error"
        });
    }finally{
        await conn.release();
        await conn.destroy();
    }

});

module.exports = router;