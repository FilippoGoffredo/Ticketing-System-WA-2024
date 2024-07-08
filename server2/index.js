'use strict';

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { body, validationResult } = require("express-validator");
const { expressjwt: jwt } = require('express-jwt');

const jwtSecret = '47e5edcecab2e23c8545f66fca6f3aec8796aee5d830567cc362bb7fb31adafc';
const jsonwebtoken = require('jsonwebtoken');
const expireTime = 60;

const app = new express();
const port = 3002;

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

app.use(morgan('dev'));
app.use(express.json());

app.use(jwt({
  secret: jwtSecret,
  algorithms: ["HS256"],
}));

app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ errors: [{ 'param': 'Server', 'msg': 'Authorization error', 'path': err.code }] });
  } else {
    next();
  }
});

function calculateEstimation(title, category) {
  const charCount = (title + category).replace(/\s/g, '').length;
  const baseEstimation = charCount * 10;
  const randomAddition = Math.floor(Math.random() * 240) + 1;
  let estimation = baseEstimation + randomAddition;
  return estimation + ' hours';

}

function calculateEstimationTicket(authLevel,title, category) {
  const charCount = (title + category).replace(/\s/g, '').length;
  const baseEstimation = charCount * 10;
  const randomAddition = Math.floor(Math.random() * 240) + 1;
  let estimation = baseEstimation + randomAddition;
  const hoursInDay = 24;
  if(!authLevel){
    estimation = Math.round(estimation / hoursInDay);
    return estimation + ' days';
  }else{
    return estimation + ' hours';
  }

}


//  /api/estimate chiama l'API solo una volta durante il caricamento dell'elenco dei ticket.
// usata in TicketList.jsx per ottenere l'estimate per tutti i ticket quando l'utente è admin

app.post('/api/estimate',
  body('tickets').isArray().withMessage('tickets must be an array'),
  body('tickets.*.title').isString().withMessage('title must be a string'),
  body('tickets.*.category').isString().withMessage('category must be a string'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map(e => e.msg) });
    }

    const authLevel = req.auth.isAdmin;

    const estimations = req.body.tickets.map(ticket => ({
      ...ticket,
    estimation: calculateEstimation(ticket.title, ticket.category, authLevel)
    }));

    res.json({ estimations });
  }
);

// This api was implemented to estimate the time to complete a single ticket and not a list
// Used in ticket sumbition form

app.post('/api/estimate-ticket',

  body('title').isString(), 
  body('category').isString(), 

  (req, res) =>{
    const err = validationResult(req);
    const errList = [];
    if (!err.isEmpty()) {
      errList.push(...err.errors.map(e => e.msg));
      return res.status(400).json({errors: errList});
    }

  const authLevel = req.auth.isAdmin;
  let estimation = calculateEstimationTicket(authLevel, req.body.title, req.body.category);
  res.json({ estimation: estimation });

});



app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
