
module.exports = (sequelize, DataTypes) => {
    return sequelize.define("bank_dictionary", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    actual_name: {
        type: DataTypes.STRING
    },
    possible_name: {
        type: DataTypes.STRING
    },
    code: {
        type: DataTypes.STRING
    },
    sort_code: {
        type: DataTypes.STRING
    }
},
{
    tableName: 'bank_dictionary'
});
}