const { Model, DataTypes } = require('sequelize');

class Company extends Model {
    static init(connection){
        super.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true
            },
            id_health_brokerages: DataTypes.INTEGER,
            operator_id: DataTypes.INTEGER,
            audit_date: DataTypes.STRING,
            dashboard_param: DataTypes.STRING,
            operator: DataTypes.STRING,
            status: DataTypes.INTEGER,
            contract_term: DataTypes.STRING,
            start_count: DataTypes.STRING,
            report_period: DataTypes.STRING,
        }, {
            sequelize: connection,
            freezeTableName: true,
            timestamps: false,
            modelName: 'companies'
        })
    }

    static associate(models){
        this.hasOne(models.SuriPoint, { foreignKey: 'companies_id' });
        this.belongsTo(models.Broker, { foreignKey: 'id_health_brokerages' });
        this.belongsTo(models.Operator, { foreignKey: 'operator_id' });
    }
}

module.exports = Company;