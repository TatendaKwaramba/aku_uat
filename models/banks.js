
module.exports = (sequelize, DataTypes) => {
    return sequelize.define("bank", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING
    },
    code: {
        type: DataTypes.STRING
    },
},
{
    tableName: 'bank'
});
}

