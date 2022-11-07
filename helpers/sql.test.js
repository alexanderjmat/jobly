const request = require("supertest");

const sql = require("./sql");
const db = require("../db");


describe("sqlForPartialUpdate tests", function() {
    test("returns the correct data", function() {
        let data = sql.sqlForPartialUpdate({firstName: 'Aliya', age: 32}, ['"first_name"=$1', '"age"=$2'])
        expect(data).toEqual({"setCols": "\"firstName\"=$1, \"age\"=$2", "values": ["Aliya", 32]})
    })
    
})