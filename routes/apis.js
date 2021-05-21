const express = require("express");
const { Sequelize, Model, DataTypes } = require("sequelize");
const dotenv = require('dotenv').config();
const axios = require('axios');

const router = express.Router();

router.get('/healthcheck', async (req, res) => {
    
    const healthcheck = {
		uptime: process.uptime(),
		message: 'OK',
        timestamp: Date.now(),
        database: 'Disconnected'
    };

    const sequelize = new Sequelize(process.env.DBNAME, process.env.DBUSER, process.env.DBPASSWORD,{
        host: process.env.DBHOST,
        dialect: "mysql",
    });

    try {
        await sequelize.authenticate().then(function(errors) { 
            console.log(errors);
            if(!errors){
                healthcheck.database = 'Connected';
            } else {
                healthcheck.database = 'Disconnected';
            } 
        });
    } catch (error) {
        console.log(error);
    }

    res.send(healthcheck);
});

router.get('/registermobile/:mobile', async (req, res) => {

    let mobile = req.params.mobile;
    let url = `http://api.akupay.ng:8100/api/v1/client/account/${mobile}`;
    console.log(url);
    let data = {
        code: "11",
        description: "Registration failed, please try again",
        mobile: "null",
        account: "null",
        status: "null"
    }
    try {
      await axios
        .get(url)
        .then(async (res) => {
          console.log("", res.data);
          data.code = "00";
          data.description = "Registration Successful";
          data.mobile = res.data.mobile;
          data.account = res.data.account;
          data.status = res.data.status;
        })
        .catch(function (error) {
            console.log(error);
        });
    } catch (error) {
      console.log(error);
    }

    res.send(data);
})

module.exports = router;