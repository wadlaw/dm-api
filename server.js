const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const PORT = process.env.PORT || 5000
const salesRouter = require('./routers/salesrouter')

app.use(morgan('dev'));
app.use(cors());

app.get("/", (req, res, next) => {
    res.send("This is from the api")
})
app.use("/sales", salesRouter);


exports.app = app;

//app.listen(PORT,() => {console.log(`api server listening on port ${PORT}`)} )