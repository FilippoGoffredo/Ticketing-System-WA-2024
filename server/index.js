"use strict"

const Database = require("./database");
const express = require("express");
const cors = require("cors");
const { body, validationResult } = require("express-validator");
const { initAuthentication, isLoggedIn } = require("./auth");
const passport = require("passport");

const jsonwebtoken = require('jsonwebtoken');
const jwtSecret = '47e5edcecab2e23c8545f66fca6f3aec8796aee5d830567cc362bb7fb31adafc';
const expireTime = 300; //seconds

const PORT = 3001;
const app = new express();
app.use(express.json());

const db =  new Database('ticketing_system.db');

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

initAuthentication(app, db);

/**
 * Get all the tickets
 */
app.get("/api/tickets", async (req, res) => {
  try {
    const tickets = await db.getAllTickets();
    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: ["Database error", err.message] });
  }
});

/**
 * Get all the textblocks for a specific ticket
 */
app.get("/api/tickets/textblocks", isLoggedIn, async (req, res) => {
  try {
    const textblocks = await db.getTextBlocks();
    res.json(textblocks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: ["Database error", err.message] });
  }
});


/**
 * Get all tickets for authenticated user
 */

app.get("/api/user-tickets", isLoggedIn, async (req, res) => {
  try {
    const tickets = await db.getUserTickets(req.user.id);
    res.json(tickets);
  } catch {
    res.status(500).json({ errors: ["Database error"] });
  }
});


/**
 * Add a new ticket
 */
app.post("/api/new-ticket", isLoggedIn, async (req, res) => {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(400).json({ errors: err.array().map(e => e.msg) });
  }

  try {
    await db.addTicket(req.body.state, req.body.category, req.body.ownerId, req.body.title);
    res.status(201).end();
  } catch (e) {
    res.status(500).json({ errors: ["Database error"] });
  }
});



/**
 * Add a block of text to a specific ticket
 */
app.post(
  "/api/new-block",
  isLoggedIn,
  body("ticketId", "Ticket ID is required").isInt(),
  body("text", "Text block is required").isString().notEmpty(),
  async (req, res) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array().map(e => e.msg) });
    }

    try {
      await db.addTextBlock(req.body.ticketId, req.user.id, req.body.text);
      res.status(201).end();
    } catch {
      res.status(500).json({ errors: ["Database error"] });
    }
});

/**
 * Update the status of a ticket
 */
app.put(
  "/api/status",
  isLoggedIn,
  body("ticketId", "Ticket ID is required").isInt(),
  body("status", "Status is required and must be either 'open' or 'closed'").isIn(['open', 'closed']),
  async (req, res) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array().map(e => e.msg) });
    }

    try {
      const { ticketId, status } = req.body;
      const authLevel = req.user.admin;
      const result = await db.getTicketStatus(ticketId);
      const currentStatus = result.state;

      // Controllo per gli utenti non admin: possono solo cambiare lo stato da 'open' a 'closed'
      if (!authLevel && currentStatus !== 'open') {
        console.log("DEBUG: currentStatus", currentStatus);
        return res.status(400).json({ errors: ["Ticket can only be updated from 'open' to 'closed' by regular users."] });
      }

      // Controllo per tutti gli utenti: non possono riaprire un ticket se non sono admin
      if (!authLevel && status === 'open') {
        console.log("DEBUG: attempt to reopen ticket by non-admin user");
        return res.status(400).json({ errors: ["Only admin can reopen a ticket."] });
      }

      // Se l'utente è admin, può cambiare lo stato indipendentemente dallo stato attuale
      await db.updateTicketState(ticketId, status);
      res.status(200).end();
    } catch (error) {
      console.error(error);
      res.status(500).json({ errors: ["Database error"] });
    }
  }
);




/**
 * Update the category of a ticket
 */

app.put(
  "/api/category",
  isLoggedIn,
  body("ticketId", "Ticket ID is required").isInt(),
  body("category", "Category is required").isString().notEmpty(),
  async (req, res) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({ errors: err.array().map(e => e.msg) });
    }

    try {
      const { admin: authLevel } = req.user;

      // Controllo se l'utente è un amministratore
      if (!authLevel) {
        return res.status(403).json({ errors: ["Only admin can update the category."] });
      }

      await db.updateTicketCategory(req.body.ticketId, req.body.category);
      res.status(200).end();
    } catch (error) {
      console.error(error);
      res.status(500).json({ errors: ["Database error"] });
    }
  }
);



/** 
 * Get authentication token
**/ 
app.get('/api/auth-token', isLoggedIn, (req, res) => {
  let authLevel = req.user.admin;

  const payloadToSign = { isAdmin: authLevel, userId: 1234};
  const jwtToken = jsonwebtoken.sign(payloadToSign, jwtSecret, {expiresIn: expireTime});

  res.json({token: jwtToken, authLevel: authLevel});  // authLevel is just for debug. Anyway it is in the JWT payload
});

/**
 * Authenticate and login
 */
app.post(
  "/api/session",
  body("username", "username is not a valid email").isEmail(),
  body("password", "password must be a non-empty string").isString().notEmpty(),
  (req, res, next) => {
    // Check if validation is ok
    const err = validationResult(req);
    const errList = [];
    if (!err.isEmpty()) {
      errList.push(...err.errors.map(e => e.msg));
      return res.status(400).json({errors: errList});
    }
    // Perform the actual authentication
    passport.authenticate("local", (err, user) => {
      if (err) {
        res.status(err.status).json({errors: [err.msg]});
      } else {
        req.login(user, err => {
          if (err) return next(err);
          else {
            // Get user info
            if (user.admin == 1) {
              db.getUserById(user.id)
                .then(user => res.json({id: user.id,name: user.name, email: user.email, admin: user.admin}))
                .catch(() => {
                  res.status(500).json({errors: ["Database error"]});
                });
            } else {
              res.json({id:user.id, name: user.name, email: user.email, admin: user.admin});
            }
          }
        });
      }
    })(req, res, next);
  }
);
/**
 * Logout
 */
app.delete("/api/session", isLoggedIn, (req, res) => {
  req.logout(() => res.end());
});

/**
 * Check if the user is logged in and return their info
 */
app.get("/api/session/current", isLoggedIn, async (req, res) => {
  res.json({email: req.user.email, name: req.user.name});
});


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));
