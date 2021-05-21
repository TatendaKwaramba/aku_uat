const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require('sequelize');
const dotenv = require('dotenv').config();

const ussdRoute = require("./ussd").router;
const akuSMS = require("./routes/sms");
const smsLogs = require("./routes/smslogs");
const notifications = require("./routes/notifications");
const apis = require("./routes/apis");
const { Sequelize } = require("sequelize");

const app = express();
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`running on localhost:${PORT}`));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/", ussdRoute);
app.use("/apis", apis);
app.use("/sms", akuSMS);
app.use("/logs", smsLogs);
app.use("/notifications", notifications);

module.exports = app