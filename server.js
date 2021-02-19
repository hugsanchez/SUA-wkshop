const { conn, syncAndSeed, models: {Department, Employee} } = require('./db');
const express = require('express');
const app = express();

app.get('/api/departments', async(req,res,next) => {
    try{
        res.send( await Department.findAll({
            include: [ {
                                //or asssociations
                model:Employee,
                as: 'manager'
                //gets the manager id and the name of the manager as well
                //alias sets the foreign key and how the data ends up loading
                //does left outer join
            }]
        }));
    }
    catch(ex){
        next(ex);
    }
})
app.get('/api/employees', async(req,res,next) => {
    try{
        res.send( await Employee.findAll({
            include: [
            {
                model: Employee,
                as: "supervisor"
            },
            {
                model:Employee,
                as:'myBishes',
                //way of altering  the name of group under one person
            },
            Department
            //By itself no curly braces when no need for changes
        ]
        }));
    }
    catch(ex){
        next(ex);
    }
})


const init = async() => {
    try{
        await conn.authenticate();
        //tell you if db is existing
        await syncAndSeed();
        const port = process.env.PORT || 3000;

        app.listen(port, ()=> `listening on port ${port}`);
    }
    catch(ex){
        console.log(ex);
    }
}
init();