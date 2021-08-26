const { Model, DataTypes } = require('sequelize');

class Broker extends Model{
    static init(sequelize){
        super.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true
            },
            nickname: DataTypes.STRING
        }, {
            sequelize,
            tableName: 'health_brokerages'
        });
    }
      
    static associate(models){
        this.hasMany(models.companies, { foreignKey: 'id_health_brokerages' });
    }
}

module.exports = Broker;