
module.exports = (sequelize, DataTypes) => {
    return sequelize.define("bank_transfer", {
    session_id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    mobile: {
        type: DataTypes.STRING
    },
    recipient_code: {
        type: DataTypes.STRING
    },
    transfer_code: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.STRING
    },
    message: {
        type: DataTypes.STRING
    },
    createdAt: {
        type: DataTypes.DATE
    },
    updatedAt: {
        type: DataTypes.DATE
    }
},
{
    tableName: 'bank_transfer'
});
}