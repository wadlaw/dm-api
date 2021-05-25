const salesRouter = require('express').Router();
module.exports = salesRouter;

const dbPath = process.env.DATABASE || '../database/db.sqlite';
const sqlite = require('sqlite3');
const db = new sqlite.Database(dbPath);

salesRouter.use(checkAuthed)

salesRouter.param('fromDate', (req, res, next, id) => {
    console.log('from param');
    req.from = id + " 00:00:00";
    next();
})

salesRouter.param('toDate', (req, res, next, id) => {
    console.log('to param');
    req.to = id + " 23:59:59";
    next()
})

salesRouter.param('categoryName', (req, res, next, id) => {
    console.log('categoryName param');
    req.categoryName = id;
    next();
})

salesRouter.get('/from/:fromDate/to/:toDate', salesSQL, (req, res, next) => {
    getResults(req, res, next, "sales");
})
salesRouter.get('/items', itemSQL, (req, res, next) => {
    getResults(req, res, next, "salesItems");
})
salesRouter.get('/items/from/:fromDate/to/:toDate', itemSQL, (req, res, next) => {
    getResults(req, res, next, "salesItems");
})

salesRouter.get('/items/from/:fromDate', itemSQL, (req, res, next) => {
    getResults(req, res, next, "salesItems");
})

salesRouter.get('/items/to/:toDate', itemSQL, (req, res, next) => {
    getResults(req, res, next, "salesItems");
    
})

salesRouter.get('/categorised/from/:fromDate/to/:toDate', categorisedSQL, (req, res, next) => {
    getResults(req, res, next, "categories");
})

salesRouter.get('/categorised/from/:fromDate', categorisedSQL, (req, res, next) => {
    getResults(req, res, next, "categories");
})

salesRouter.get('/categorised/to/:toDate', categorisedSQL, (req, res, next) => {
    getResults(req, res, next, "categories");
})

salesRouter.get('/categorised', categorisedSQL, (req, res, next) => {
    getResults(req, res, next, "categories");
})

salesRouter.get('/categorised/monthly', categorisedMonthlySQL, (req, res, next) => {
    getResults(req, res, next, "categories");
})

salesRouter.get('/categorised/yearly', categorisedYearlySQL, (req, res, next) => {
    getResults(req, res, next, "categories");
})

salesRouter.get('/categorised/today', categorisedTodaySQL, (req, res, next) => {
    getResults(req, res, next, "categories")
})

salesRouter.get('/categorised/yesterday', categorisedYesterdaySQL, (req, res, next) => {
    getResults(req, res, next, "categories")
})

salesRouter.get('/categorised/thisweek', categorisedThisWeekSQL, (req, res, next) => {
    getResults(req, res, next, "categories")
})

salesRouter.get('/categorised/lastweek', categorisedLastWeekSQL, (req, res, next) => {
    getResults(req, res, next, "categories")
})

salesRouter.get('/categorised/thismonth', categorisedThisMonthSQL, (req, res, next) => {
    getResults(req, res, next, "categories")
})

salesRouter.get('/categorised/lastmonth', categorisedLastMonthSQL, (req, res, next) => {
    getResults(req, res, next, "categories")
})


function itemSQL(req, res, next) {
    let sql = 'SELECT s.sale_date_time, si.product_name, si.product_sku, si.category_name, si.quantity, si.product_id, si.sales_id, si.total_inc_vat, si.vat FROM SalesItems si JOIN Sales s ON si.sales_id = s.id';
    let where = "";
    if (req.from && req.to) {
        where = `date(s.sale_date_time) BETWEEN date('${req.from}') AND date('${req.to}')`;
    } else if (req.from) {
        where += `date(s.sale_date_time) >= date('${req.from}')`
    } else if (req.to) {
        where += `date(s.sale_date_time) <= date('${req.to}')`
    }
    if (req.categoryName) {
        where = where.length > 0 ? where += " AND " : ""
        where += si.category_name = `'${req.categoryName}'`
    }
    if (where.length > 0) {
        sql += " WHERE " + where;
    }
    sql += " ORDER BY datetime(s.sale_date_time) ASC"
    req.sql = sql;
    console.log(sql);
    next();
}

function salesSQL(req, res, next) {
    let sql = 'SELECT * FROM Sales s';
    let where = ""
    if (req.from && req.to) {
        where = `date(s.sale_date_time) BETWEEN date('${req.from}') AND date('${req.to}')`;
    } else if (req.from) {
        where = `date(s.sale_date_time) >= date('${req.from}')`
    } else if (req.to) {
        where = `date(s.sale_date_time) <= date('${req.to}')`
    }

    if (where.length > 0) {
        sql += " WHERE " + where;
    }
    sql += " ORDER BY datetime(s.sale_date_time) ASC"
    req.sql = sql;
    console.log(sql);
    next();
}

function categorisedSQL(req, res, next) {
    let sql = 'SELECT * FROM v_SalesByCategory';
    let where = "";
    if (req.from && req.to) {
        where =  `date(SaleDate) BETWEEN date('${req.from}') AND date('${req.to}')`;
    } else if (req.from) {
        swhere = `date(SaleDate) >= date('${req.from}')`
    } else if (req.to) {
        where = `date(SaleDate) <= date('${req.to}')`
    }
    if (where.length > 0) {
        sql += " WHERE " + where;
    }
    req.sql = sql;
    console.log(sql);
    next();
}
function categorisedTodaySQL(req, res, next) {
    let sql = `SELECT * FROM v_SalesByCategory WHERE date(SaleDate) = date('now')`;
    
    req.sql = sql;
    console.log(sql);
    next();
}
function categorisedYesterdaySQL(req, res, next) {
    let sql = `SELECT * FROM v_SalesByCategory WHERE date(SaleDate) = date('now','-1 day')`;
    
    req.sql = sql;
    console.log(sql);
    next();
}

function categorisedThisWeekSQL(req, res, next) {
    let sql = `SELECT * FROM v_SalesByCategory WHERE date(SaleDate) > DATE('now', 'weekday 0', '-7 days')`;
    
    req.sql = sql;
    console.log(sql);
    next();
}
function categorisedLastWeekSQL(req, res, next) {
    let sql = `SELECT * FROM v_SalesByCategory WHERE date(SaleDate) BETWEEN DATE('now', 'weekday 0', '-13 days') AND DATE('now', 'weekday 0', '-7 days')`;
    
    req.sql = sql;
    console.log(sql);
    next();
}

function categorisedThisMonthSQL(req, res, next) {
    let sql = `SELECT * FROM v_SalesByCategory WHERE date(SaleDate) >= date('now','start of month')`;
    
    req.sql = sql;
    console.log(sql);
    next();
}

function categorisedLastMonthSQL(req, res, next) {
    let sql = `SELECT * FROM v_SalesByCategory WHERE date(SaleDate) BETWEEN date('now','start of month', '-1 days', 'start of month') AND date('now','start of month', '-1 days')`;
    
    req.sql = sql;
    console.log(sql);
    next();
}

function categorisedMonthlySQL(req, res, next) {
    let sql = 'SELECT * FROM v_SalesByCategoryMonthly';
    let where = "";
    if (req.from && req.to) {
        where = `date(SaleDate) BETWEEN date('${req.from}') AND date('${req.to}')`;
    } else if (req.from) {
        where = `date(SaleDate) >= date('${req.from}')`
    } else if (req.to) {
        where = `date(SaleDate) <= date('${req.to}')`
    }
    if (where.length > 0) {
        sql += ' WHERE ' + where
    }
    req.sql = sql;
    console.log(sql);
    next();
}

function categorisedYearlySQL(req, res, next) {
    let sql = 'SELECT * FROM v_SalesByCategoryYearly';
    let where = "";
    if (req.from && req.to) {
        where = `date(SaleDate) BETWEEN date('${req.from}') AND date('${req.to}')`;
    } else if (req.from) {
        where = `date(SaleDate) >= date('${req.from}')`
    } else if (req.to) {
        where = `date(SaleDate) <= date('${req.to}')`
    }
    if (where.length > 0) {
        sql += ' WHERE ' + where
    }
    req.sql = sql;
    console.log(sql);
    next();
}

function getResults(req, res, next, entity) {
    db.all(
        req.sql,
        (err, rows) => {
            if (err) {
                next(err);
            } else {
                let results = { };
                results[entity] = rows;
                res.json(results);
            }
        }
    )
}

function checkAuthed(req, res, next) {
    console.log('checkAuthed is running');
    if (req.query.apikey) {
        console.log(`API Key: ${req.query.apikey}`)
        let sql = `SELECT UserId FROM Users WHERE APIkey = '${req.query.apikey}'`
        console.log(sql)
        db.get(sql, (err, row) => {
            if (err) {
                next(err); //err
            } else {
                if (row == null) {
                    //apikey not identified
                    console.log('user query returned null')
                    console.log(row)
                    res.status(403).json({ message: "Access denied - API Key invalid"});
                } else {
                    //apikey is good
                    console.log('user query returned a user')
                    return next();
                }
            }
        });
    } else {
        //no api key
        res.status(403).json({ message: "Access denied - API Key missing"});
    }
}
