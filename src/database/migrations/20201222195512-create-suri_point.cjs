"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("suripoint", { 
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      companies_id: {
        type: Sequelize.BIGINT(20).UNSIGNED,
        allowNull: false,
        references: {
          model: 'companies',
          key: 'id'
        }
      },
      slides_to_remove_principal: {
        type: Sequelize.STRING,
        allowNull: false
      },
      slides_to_remove_anexo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true
      },
      has_footer_logo: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      has_covid_slide: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      has_last_slide: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('suripoint');
  },
};
