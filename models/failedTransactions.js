
module.exports = (sequelize, DataTypes) => {
    return sequelize.define("sms", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    mobile: {
        type: DataTypes.STRING
    },
    text: {
        type: DataTypes.STRING
    },
    account: {
        type: DataTypes.STRING
    },
    bankName: {
        type: DataTypes.STRING
    },
    message: {
        type: DataTypes.STRING
    }
},
{
    tableName: 'sms'
});
}