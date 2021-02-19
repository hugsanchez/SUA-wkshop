//ADDED DATA MODELS
const Sequelize = require('sequelize');
//Capitalized cause we are using it as a constructor
const {STRING, UUID, UUIDV4} = require('sequelize');
//destructuring to pull this type from sequelize
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_db_sua');
//connected to local db

const Department = conn.define('department',{
    name: {
        type:STRING(20)
    }
});

const Employee = conn.define('employee',{
    id: {
        type: UUID,
        primaryKey: true,
        defaultValue: UUIDV4
        //gotta use them together i guess
    },
    name: {
        type:STRING(20)
    }
});
//unique identifiers (problem with integer PK is that because foreign keys also use integerPK its easy to confuse certain data but still work
//cause the numbers match up) 
//pluraized the columns in psql they add and s or correct plural version
// when we type it in psql we use lowercase and add the plural version when using SQL to pull data within PSQL
 
//Using express to look at our data
Department.belongsTo(Employee, {as: 'manager'});
//gets employee id from the second table 1st val
//departments get an employee_id wanna call it its manager_id
// Do this using alias AS
//Be aware that the AS association ignores employeeId or other variable names all it knows is that whateverId is gonna be 
//managerId
Employee.hasMany(Department, {foreignKey: 'managerId'});
//defaultly takes every employee and gives it an Id correlating to Department, but why is manager there?
//once use of alias with belongTo // you have to take into account the alias in the hasMany defining that alias as something 
//like foreign key

Employee.belongsTo(Employee, {as: 'supervisor'});
//Puts foreign key in Employee(named employeeId) used alias to change that name to supervisor
Employee.hasMany(Employee, {foreignKey: 'supervisorId', as: 'myBishes'});
//sequelize knows what the foreign key is 

const syncAndSeed = async() => {
    await conn.sync({force:true}); 
    //this does the work of delete if exists and creates table need the force true

    const [moe,lucy,larry, hr, math] = await Promise.all([
        Employee.create({name:'moe'}),
        Employee.create({name:'lucy'}),
        Employee.create({name:'larry'}),
        Department.create({name:'hr'}),
        Department.create({name:'math'})

    ])
    //This does the insert into // with a promise all to run them in parallel 
    //Postgres has the ability to run in parallel

    hr.managerId = lucy.id;
    //assigned managerId within hr to the id of lucy making lucy the manager of hr
    await hr.save();
    //save changes we've made to specific table
    moe.supervisorId = lucy.id;
    larry.supervisorId = lucy.id;
    await Promise.all([moe.save(),larry.save()]);


    //console.log(JSON.stringify(hr, null, 2));
    //gives us the data info
    // makes it more readable
}

module.exports = {
    conn,
    syncAndSeed,
    models: {
        Department,
        Employee
    }
}
//models should be capitalized up there in creation