
module.exports = (sequelize, DataTypes) => {
    return sequelize.define("ussd_session", {
    session_id: {
        type: DataTypes.TEXT
    },
    amount: {
        type: DataTypes.INTEGER
    },
    customer_type: {
        type: DataTypes.TEXT
    },
    mobile1:  {
        type: DataTypes.STRING
    },
    mobile2:  {
        type: DataTypes.STRING
    },
    transaction_type:  {
        type: DataTypes.STRING
    },
    created_by:  {
        type: DataTypes.STRING
    },
    created_date: {
        type: DataTypes.DATE
    },
    last_modified_by:  {
        type: DataTypes.STRING
    },
    last_modified_date: {
        type: DataTypes.DATE
    },
    version:  {
        type: DataTypes.STRING
    },
    new_pin:  {
        type: DataTypes.STRING
    },
    old_pin:  {
        type: DataTypes.STRING
    },
    agent_id: {
        type: DataTypes.STRING
    },
    imei: {
        type: DataTypes.TEXT
    },
    preauth_id: {
        type: DataTypes.STRING
    },
    code: {
        type: DataTypes.TEXT
    },
    description:  {
        type: DataTypes.TEXT
    }, 
    recipient_code:  {
        type: DataTypes.TEXT
    },
    status:  {
        type: DataTypes.TEXT
    },
    message:  {
        type: DataTypes.STRING
    },
},
{
    tableName: 'ussd_session'
});
}