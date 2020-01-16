const express = require('express');
const{ otpMailer, checkToken } = require('../../auth');
const db = require('../../dbConnection');
const { hashSync, genSaltSync, compareSync } = require("bcrypt");
const { sign } = require("jsonwebtoken");
require('dotenv').config();

module.exports = {
    createUser: async(req, res) => {
        const body = req.body;
        const salt = genSaltSync(10);
        body.password = hashSync(body.password, salt);
        const otp = await otpMailer(body.email);
            try{
                const conn = await db();
                await conn.query('START TRANSACTION');
                const result = await  conn.query(`insert into registration(firstName, lastName, gender, email, password, number, otp) 
                              values(?,?,?,?,?,?,?)`,
                    [
                      body.first_name,
                      body.last_name,
                      body.gender,
                      body.email,
                      body.password,
                      body.number,
                      otp,
                    ],
                );
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
            } finally{
                await conn.release();
                await conn.destroy();
            } 
    },
    login: async (req, res) => {
        const conn = await db();
        const body = req.body;
        await conn.query('START TRANSACTION');
        await conn.query(`select * from \`registration\` where \`email\` = ?`,
            [body.email],      
            (error, results) => {
                if (error) {
                  console.log(error);
                }
                if (!results) {
                  return res.json({
                    success: 0,
                    data: "Invalid email or password 1"
                  });        
                }
                r =results[0];
                const result = compareSync(body.password, r.password);
                if (result) {
                    r.password = undefined;
                    const jsontoken = sign({ result: r}, process.env.JWT_KEY, {
                    expiresIn: "1h"
                    });
                    return res.json({
                    success: 1,
                    message: "login successfully",
                    token: jsontoken
                    });
                } else {
                    return res.json({
                    success: 0,
                    data: "Invalid email or password"
                    });
                }           
        });  
        await conn.release();
        await conn.destroy();       
    },
    getUserByUserId: async (req, res) => {
        const conn = await db();
        const id = req.params.id;
        try {
          await conn.query('START TRANSACTION');
          const result = await  conn.query(`select id,firstName,lastName,gender,email,number from registration where id = ?`,
            [id],)
          res.status(200).json({
            success: 1,
            data: result,
          });
        } catch (err) {
          res.status(500).json({
            error: err,
          });
        } finally {
          await conn.release();
          await conn.destroy();
        }
      },
    getUsers: async (req, res) => {
        const conn = await db();
        try {
          await conn.query('START TRANSACTION');
          const result = await conn.query( `select id,firstName,lastName,gender,email,number from registration`,
          []);
          res.status(200).json({
            success: 1,
            data: result
          });
        } catch (err) {
          res.status(500).json({
            error: err,
          });
        } finally {
          await conn.release();
          await conn.destroy();
        }
      },
    updateUsers: async (req, res) => {
        const conn = await db();
        const body = req.body;
        const salt = genSaltSync(10);
        body.password = hashSync(body.password, salt);
        try {
          await conn.query('START TRANSACTION');
          const result = await conn.query(
            `update \`registration\` set \`firstName\`=?, \`lastName\`=?, \`gender\`=?, \`email\`=?, \`password\`=?, \`number\`=? where \`id\` = ?`,
            [
              body.first_name,
              body.last_name,
              body.gender,
              body.email,
              body.password,
              body.number,
              body.id
            ],
            );
            await conn.query('COMMIT');
            res.status(200).json({
            success: 1,
            message: "updated successfully",
            result,
          });
        }catch (err) {
          res.status(500).json({
            error: err,
          });
        } finally {
          await conn.release();
          await conn.destroy();
        }
      },
    deleteUser: async (req, res) => {
        const conn = await db();
        const id = req.body.id;      
          await conn.query('START TRANSACTION');
          const data = await conn.query(`select * from \`registration\` where id= ${id}`);
          if (data.length === 0) {
            return res.json({
                success: 0,
                message: "Record Not Found"
            });
            }
          try {
                await conn.query(`DELETE FROM \`registration\` WHERE \`id\`= ${id}`,async (err, results) => {
                    console.log(data);
                    if (err) {
                    console.log(err);
                    return;
                    }
                    await conn.query('COMMIT');
                    return res.status(200).json({
                    success: 1,
                    message: "user deleted successfully"
                    });
                    
              });      
        }catch (err) {
          res.status(500).json({
            error: err,
          });
        }finally {
          await conn.release();
          await conn.destroy();
        }
      },    
}    
    

       