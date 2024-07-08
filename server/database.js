"use strict"

const sqlite = require("sqlite3");
const crypto = require("crypto");


/**
 * Wrapper around db.all
 */
const dbAllAsync = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) reject(err);
    else     resolve(rows);
  });
});
/**
 * Wrapper around db.run
 */
const dbRunAsync = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, err => {
    if (err) reject(err);
    else resolve();
  });
});

/**
 * Wrapper around db.get
 */
const dbGetAsync = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) reject(err);
    else resolve(row);
  });
});

/**
 * Interface to the sqlite database for the application
 *
 * @param dbname name of the sqlite3 database file to open
 */
function Database(dbname) {
  this.db = new sqlite.Database(dbname, err => {
    if (err) throw err;
    console.log(`Connected to ${dbname} database`);
  });

  /**
 * Get a user by id
 * 
 * @param userId the id of the user
 * 
 * @returns a Promise that resolves to the user
 */
this.getUserById = (userId) => {
  const sql = "SELECT * FROM users WHERE id = ?";
  return dbGetAsync(this.db, sql, [userId]);
};

/**
 * Get all tickets
 * 
 * @returns a Promise that resolves to the list of tickets
 */
this.getAllTickets = () => {
  const sql = `
    SELECT tickets.ticket_id, tickets.state, tickets.category, tickets.owner_id, users.name AS owner_name, tickets.title, tickets.ticket_timestamp
    FROM tickets
    JOIN users ON tickets.owner_id = users.id
  `;
  return dbAllAsync(this.db, sql);
};

/**
 * Get all tickets for a specific user
 * 
 * @param userId the id of the user
 * 
 * @returns a Promise that resolves to the list of tickets for the user
 */
this.getUserTickets = (userId) => {
  const sql = "SELECT * FROM tickets INNER JOIN ticketlist ON tickets.ticket_id = ticketlist.ticket_id WHERE ticketlist.id = ?";
  return dbAllAsync(this.db, sql, [userId]);
};

/**
 * Add a new ticket
 * 
 * 
 * @param state the state of the ticket always open on submission
 * @param category the category of the ticket
 * @param ownerId the id of the user who owns the ticket
 * @param title the title of the ticket
 * 
 * @returns a Promise that resolves to the id of the new ticket
 */
this.addTicket = ( state, category, ownerId, title) => {
  console.log("DEBUG: addTicket params", state, category, ownerId, title);
  const sql = "INSERT INTO tickets ( state, category, owner_id, title) VALUES (?, ?, ?, ?)";
  return dbRunAsync(this.db, sql, [state, category, ownerId, title]);
};

/**
 * Update the state of a ticket
 * 
 * @param ticketId the id of the ticket
 * @param state the new state of the ticket
 * 
 * @returns a Promise that resolves to nothing when the ticket has been updated
 */
this.updateTicketState = (ticketId, status) => {
  const sql = "UPDATE tickets SET state = ? WHERE ticket_id = ?";
  return dbRunAsync(this.db, sql, [status, ticketId]);
};

/**
 * Update the category of a ticket
 * 
 * @param ticketId the id of the ticket
 * @param category the new category of the ticket
 * 
 * @returns a Promise that resolves to nothing when the ticket has been updated
 */

this.updateTicketCategory = (ticketId, category) => {
  const sql = "UPDATE tickets SET category = ? WHERE ticket_id = ?";
  return dbRunAsync(this.db, sql, [category, ticketId]);
};


/**
 * Add a new text block to a ticket
 * 
 * @param ticketId the id of the ticket
 * @param authorId the id of the user who is adding the text block
 * @param text the text of the text block
 * 
 * @returns a Promise that resolves to the id of the new text block
 */
this.addTextBlock = (ticketId, authorId, text) => {
  const sql = "INSERT INTO textblock (ticket_id, author, text) VALUES (?, ?, ?)";
  return dbRunAsync(this.db, sql, [ticketId, authorId, text]);
};

/**
 * Get all text blocks 
 */
this.getTextBlocks = () => {
  const sql = `
    SELECT textblock.*, users.name AS author_name 
    FROM textblock 
    INNER JOIN users ON textblock.author = users.id
  `;
  return dbAllAsync(this.db, sql);
};


/**
 * Get the status of a ticket by id
 * 
 * @param ticketId the id of the ticket
 * 
 * @returns a Promise that resolves to the status of the ticket
 */
this.getTicketStatus = (ticketId) => {
  const sql = "SELECT state FROM tickets WHERE ticket_id = ?";
  return dbGetAsync(this.db, sql, [ticketId]);
};


this.authUser = (email, password) => new Promise((resolve, reject) => {
  dbGetAsync(
    this.db,
    "select * from users where email = ?",
    [email]
  )
    .then(user => {
      if (!user) resolve(false);

      // Verify the password
      crypto.scrypt(password, user.salt, 32, (err, hash) => {
        if (err) reject(err);
        if (crypto.timingSafeEqual(hash, Buffer.from(user.hash, "hex")))
          resolve({id: user.id, email: user.email, name: user.name, admin: user.admin === null ? null : Boolean(user.admin)}); // Avoid full_time = null being cast to false
        else resolve(false);
      });
    })
    .catch(e => reject(e));
});

}

module.exports = Database;
