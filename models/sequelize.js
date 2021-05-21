//Import sequelize 
const Sequelize = require('sequelize');
const dotenv = require('dotenv').config();

//Establishing MySQL database connection
const sequelize = new Sequelize(process.env.DBNAME, process.env.DBUSER, process.env.DBPASSWORD,{
    host: process.env.DBHOST,
    dialect: "mysql",
});

const TransactionModel = require('./transaction');
const Transaction = TransactionModel(sequelize, Sequelize);

const FailedTransactionModel = require('./failedTransactions');
const FailedTransaction = FailedTransactionModel(sequelize, Sequelize);

const BanksModel = require('./banks');
const Banks = BanksModel(sequelize, Sequelize);

const BanksDictModel = require('./bankDict');
const BanksDict = BanksDictModel(sequelize, Sequelize);

const BankTransferModel = require('./bankTransfers');
const BankTransfer = BankTransferModel(sequelize, Sequelize);

module.exports = {
  Transaction,
  FailedTransaction,
  Banks,
  BanksDict,
  BankTransfer
}