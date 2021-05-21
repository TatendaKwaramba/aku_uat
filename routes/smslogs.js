const express = require("express");

let {
    Transaction: transaction,
    FailedTransaction: failedTransaction,
  } = require("../models/sequelize");

const router = express.Router();

router.get('/', async (req, res) => {

    try {
        var trans = await failedTransaction.findAll();
    } catch (error) {
        console.log(error);
    }


    res.send(trans? trans: {"message": "Failed to Fetch Data Please Try Again"});
});

router.get('/sizes', async (req, res) => {

    let size = req.query.size;
    try {
        var trans = await failedTransaction.findAll({ 
            limit: parseInt(size),
            order: [
                ['id', 'DESC']
            ]
        }); 
    } catch (error) {
        console.log(error);
    }

    res.send(trans);
});

router.get('/sms/size', async (req, res) => {

    let size = parseInt(req.query.size);
    let page = parseInt(req.query.page);
    try {
        var trans = await failedTransaction.findAndCountAll({ 
            limit: size,
            offset: page*size,
            order: [
                ['id', 'DESC']
            ]
        }); 
    } catch (error) {
        console.log(error);
    }

    const { count: totalTransactions, rows: transactions } = trans;
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(totalTransactions / size);
  
    let data = {
        totalTransactions,
        transactions,
        totalPages,
        currentPage
    }

    res.send(data);
});

router.get('/ussd/size', async (req, res) => {

    let size = parseInt(req.query.size);
    let page = parseInt(req.query.page);
    try {
        var trans = await transaction.findAndCountAll({ 
            limit: size,
            offset: page*size,
            order: [
                ['id', 'DESC']
            ]
        }); 
    } catch (error) {
        console.log(error);
    }

    const { count: totalTransactions, rows: transactions } = trans;
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(totalTransactions / size);
  
    let data = {
        totalTransactions,
        transactions,
        totalPages,
        currentPage
    }

    res.send(data);
});


module.exports = router;
