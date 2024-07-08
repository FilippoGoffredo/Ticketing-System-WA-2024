"use strict"

const SERVER_HOST = "http://localhost";
const SERVER_PORT = 3001;
const SERVER_PORT2 = 3002;

const SERVER_BASE = `${SERVER_HOST}:${SERVER_PORT}/api/`;
const SERVER_BASE2 = `${SERVER_HOST}:${SERVER_PORT2}/api/`;
/**
 * A utility function for parsing the HTTP response.
 */
function getJson(httpResponsePromise) {
    // server API always return JSON, in case of error the format is the following { error: <message> } 
    return new Promise((resolve, reject) => {
      httpResponsePromise
        .then((response) => {
          if (response.ok) {
  
           // the server always returns a JSON, even empty {}. Never null or non json, otherwise the method will fail
           response.json()
              .then( json => resolve(json) )
              .catch( err => reject({ error: "Cannot parse server response" }))
  
          } else {
            // analyzing the cause of error
            response.json()
              .then(obj => 
                reject(obj)
                ) // error msg in the response body
              .catch(err => reject({ error: "Cannot parse server response" })) // something else
          }
        })
        .catch(err => 
          reject({ error: "Cannot communicate"  })
        ) // connection error
    });
  }

const APICall = async (endpoint, method = "GET", body = undefined, headers = undefined, expectResponse = true, server_base_url = SERVER_BASE) => {
  let errors = [];

  try {
    const response = await fetch(new URL(endpoint, server_base_url), {
        method,
        body,
        headers,
        credentials: "include"
    });

    if (response.ok) {
      if (expectResponse) return await response.json();
    }
    else errors = (await response.json()).errors;
  } catch {
    const err = ["Failed to contact the server"];
    throw err;
  }

  if (errors.length !== 0)
    throw errors;
};

const fetchTickets = async () => await APICall("tickets");

const fetchTextBlocks = async () => await APICall(`tickets/textblocks`);

const fetchUserTickets = async () => await APICall("user-tickets");

const addTicket = async (state, category, ownerId, title) => {
  const body = JSON.stringify({ state, category, ownerId, title });
  return await APICall("new-ticket", "POST", body, {
    "Content-Type": "application/json"
  }, false);
};

const addTextBlock = async (ticketId, authorId, text) => await APICall(
  "new-block",
  "POST",
  JSON.stringify({ticketId, authorId, text}),
  { "Content-Type": "application/json" },
  false
);

const updateTicketStatus = async (ticketId, status) => await APICall(
  "status",
  "PUT",
  JSON.stringify({ticketId, status}),
  { "Content-Type": "application/json" },
  false
);


const updateTicketCategory = async (ticketId, category) => await APICall(
  "category",
  "PUT",
  JSON.stringify({ticketId, category}),
  { "Content-Type": "application/json" },
  false
);



async function getAuthToken() {
  return getJson(fetch(SERVER_BASE + 'auth-token', {
    // this parameter specifies that authentication cookie must be forwared
    credentials: 'include'
  })
  )
}

const login = async (username, password) => await APICall(
  "session",
  "POST",
  JSON.stringify({username, password}),
  { "Content-Type": "application/json" }
);


/**
 * Fetches the info from the second server, using an authorization token
 */
const getEstimate = async (authToken, tickets) => await APICall(
  "estimate",
  "POST",
  JSON.stringify({tickets: tickets}),
  {
    "Authorization": `Bearer ${authToken}`,
    "Content-Type": "application/json",
   },
  true,
  SERVER_BASE2
);


const getEstimateTicket = async (authToken, title, category) => await APICall(
  "estimate-ticket",
  "POST",
  JSON.stringify({title: title, category: category}),
  {
    "Authorization": `Bearer ${authToken}`,
    "Content-Type": "application/json",
   },
  true,
  SERVER_BASE2
);


const logout = async () => await APICall("session", "DELETE", undefined, undefined, false);

const fetchCurrentUser = async () => await APICall("session/current");

const API = {
  fetchTickets,
  fetchUserTickets,
  addTicket,
  addTextBlock,
  updateTicketStatus,
  updateTicketCategory,
  getAuthToken,
  login,
  logout,
  fetchCurrentUser,
  fetchTextBlocks,
  getEstimate,
  getEstimateTicket,
};

export { API };