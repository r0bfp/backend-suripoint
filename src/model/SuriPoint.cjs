const { Model, DataTypes } = require('sequelize');

class SuriPoint extends Model{
    static init(sequelize){
        super.init({
            companies_id: DataTypes.INTEGER,
            slides_to_remove_principal: DataTypes.STRING,
            slides_to_remove_anexo: DataTypes.STRING,
            description: DataTypes.STRING,
            has_footer_logo: DataTypes.BOOLEAN,
            has_covid_slide: DataTypes.BOOLEAN,
            has_last_slide: DataTypes.BOOLEAN,
        }, {
            sequelize,
            timestamps: true,
            tableName: 'suripoint'
        });
    }
      
    static associate(models){
        this.belongsTo(models.companies, { foreignKey: 'companies_id' });
    }
}

module.exports = SuriPoint;