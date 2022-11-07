"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError, ExpressError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");
const User = require("./user")

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if job already in database.
   * */

  static async create({title, salary, equity, companyHandle}) {

    const result = await db.query(
          `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING title, salary, equity, company_handle AS "companyHandle"`,
        [
          title,
          salary,
          equity,
          jobHandle,
        ],
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll(query=null) {
    if (query) {
      console.log(query)
      let keyString = ''
      const keys = Object.keys(query)
      const values = Object.values(query)

      for (let i = 0; i < keys.length; i++) {

        if (keys[i] == "title") {
          values[i] = `%${values[i]}%`
          keyString += `${keys[i]} LIKE $${i+1} `
        }
        else if (keys[i] == "minSalary") {
          keyString += `salary >= $${i+1} `
        }
        else if (keys[i] == "hasEquity") {
            if (query[keys[i]]) {
                keyString += `equity > 0 $${i + 1} `
            }
        }

        if (i < keys.length - 1) {
          keyString += 'and '
        }
      }

      console.log(keyString)
      const jobsRes = await db.query(
        `SELECT title,
                salary,
                equity,
                company_handle AS "companyHandle"
         FROM jobs WHERE ${keyString}
         ORDER BY title`, values);

      return jobsRes.rows;
    }

    else {
        const jobsRes = await db.query(
            `SELECT title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"
             FROM jobs
             ORDER BY id`);
      return jobsRes.rows;

    }
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          companyHandle: "company_handle",
        });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${handleVarIdx} 
                      RETURNING title, 
                                salary, 
                                equity, 
                                company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
        [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
}


module.exports = Job;