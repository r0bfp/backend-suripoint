import Sequelize from "sequelize";
import dbConfig  from "../config/database.cjs";

import SuriPoint from "../model/SuriPoint.cjs";
import Company   from "../model/Company.cjs";
import Broker    from "../model/Broker.cjs";
import Operator  from "../model/Operator.cjs";


const connection = new Sequelize(dbConfig);

SuriPoint.init(connection);
Company.init(connection);
Broker.init(connection);
Operator.init(connection);

SuriPoint.associate(connection.models)
Company.associate(connection.models)
Broker.associate(connection.models)
Operator.associate(connection.models)


export default connection;

