
module.exports = (sequelize, DataTypes) => {
    return sequelize.define("transactions", {
    transid: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    mobile: {
        type: DataTypes.STRING,
    },
    amount: {
        type: DataTypes.STRING,
    },
    batch: {
        type: DataTypes.STRING,
    },
    state: {
        type: DataTypes.STRING,
    },
    status: {
        type: DataTypes.STRING,
    },
    maker: {
        type: DataTypes.STRING,
    },
    created_at: {
        type: DataTypes.STRING,
    },
},
{
    tableName: 'transactions'
});
}
