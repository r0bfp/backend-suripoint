const { Model, DataTypes } = require('sequelize');

class Operator extends Model{
    static init(sequelize){
        super.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true
            },
            nickname: DataTypes.STRING,
            competence_delay: DataTypes.INTEGER,
        }, {
            sequelize,
            tableName: 'operators'
        });
    }
      
    static associate(models){
        this.hasMany(models.companies, { foreignKey: 'operator_id' });
    }
}

module.exports = Operator;