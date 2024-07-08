
# Exam #1: "Ticketing System"

## Student: s322435 GOFFREDO FILIPPO

## React Client Application Routes

- Route `/`: Non authenticated ticketing system page + Authenticated ticketing system page for normal users and administrators
- Route `/login`: Login page for users
- Route `/add`: Adds ticket to ticket list

## API Server

- **GET `/api/tickets`**  Get all the tickets as a JSON
  - **Response body**: 
    ```
    [{"ticket_id":1,"state":"open","category":"maintenance","owner_id":1,"owner_name":"Mario Rossi","title":"System Crash on Login","ticket_timestamp":"2024-06-14 08:43:29"},...]
    ```

- **GET `/api/tickets/textblocks`**  Get all the tickets as a JSON (authenticated)
  - **Response body**: 
    ```
    [{"textblock_id":1,"ticket_id":1,"textblock_timestamp":"2024-06-14 08:46:56","author":1,"text":"Mario: Investigating the login issue, will update soon.","author_name":"Mario Rossi"},...]
    ```

- **POST `/api/tickets/new-ticket`**   Adds a ticket to tickets in database (authenticated)
  - **Request body**: 
    ```
    [{"state":"open","category":"inquiry","ownerId":3,"title":"Dark Mode Update"}]
    ```

- **POST `/api/tickets/new-block`**   Adds a ticket to tickets in database (authenticated)
  - **Request body**: 
    ```
    {"ticketId":42,"authorId":3,"text":"Luca: I noticed an error in the database, I am trying to solve it."}
    ```


- **PUT `/api/status`**  Updates the status of a ticket from open to closed for authenticated users, for admins also allows to update from closed to open. (authenticated)

  - **Request body**: 
    ```
    {"ticketId":42,"status":"closed"}
    ```


- **PUT `/api/category`**  Updates the category of a ticket, allowed only for admins  (authenticated)

  - **Request body**: 
    ```
    {"ticketId":42,"category":"new feature"}
    ```

- **GET `/api/auth-token`**  Returns an auth token with authentication level (authenticated)

- **Response body**: 
  ```
    {"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc0FkbWluIjoxLCJ1c2VySWQiOjEyMzQsImlhdCI6MTcxOTY1NDAzNywiZXhwIjoxNzE5NjU0MzM3fQ.Vx-Q-K3qsdCxPg1gb59D3Mfo38jtAtiZlsLmNSmF2LI","authLevel":1}
  ```

## Authentication API

- **POST `/api/session`**: Authenticate and login the user.

  - **Request**: JSON object with _username_ equal to email:   
  ```
  {"username":"martinamesiano@gmail.com","password":"password"}
  ```
  - **Response body**: JSON object with the user's info and, if the user has a study plan, studyPlan; or a description of the errors:   
  ```
  {"id":3,"name":"Martina Mesiano","email":"martinamesiano@gmail.com","admin":false}
  ```


- **DELETE `/api/session`**: Logout the user.

- **GET `/api/session/current`**: get logged in user's mail and name


## API Server2

- **POST `/api/estimate`**: Returns list of estimations of the ticketlist.

  - **Request**: JSON object with the whole ticketlist: 
```
{"tickets":[{"owner_id":1,"category":"maintenance","owner_name":"Mario Rossi","state":"open","ticket_id":1,"ticket_timestamp":"2024-06-14 08:43:29","title":"System Crash on Login"},...]}
```
  - **Response body**: JSON object with all the estimations:
```
{"estimations":[{"owner_id":1,"category":"maintenance","owner_name":"Mario Rossi","state":"open","ticket_id":1,"ticket_timestamp":"2024-06-14 08:43:29","title":"System Crash on Login","estimation":"414 hours"},...]}
```


- **POST `/api/estimate-ticket`**: Return single estimation of a ticket

  - **Request**: JSON object with a single ticket: 
    ```
    {"title":"new ticket","category":"inquiry"}
    ```
  - **Response body**: JSON object with the estimation of the ticket:
    ```
    {"estimation":"317 hours"}
    ```

## Database Tables

- **Table `users`** - (id), name, email, hash, salt, admin (0 normal user, 1 administrator)
- **Table `tickets`** - (ticket_id, owner_id),  state, category, title, ticket_timestamp
- **Table `textblock`** - (textblock_id, ticket_id), textblock_timestamp, author, text

## Main React Components

- `Main` in App.jsx: Main component with all the routes
- `HomePage` in App.jsx: Wraps header and ticketlist
- `TicketList.jsx` List of tickets created as a table with all the buttons to allow the specific functionalities of the application. it includes the component Ticket that handles the render of a single ticket.
- `AddTicket.jsx` Component that allows user to add a ticket to the ticket list. It includes the `confirm` useState to show a different version of the page 



(only _main_ components, minor ones may be skipped)

## Screenshot

![Screenshot](./img/screenshot.png)
![Screenshot2](./img/screenshot2.png)

## Users Credentials

- user: mariorossi@gmail.com,  password
- user: lucagironi@gmail.com, password
- user: martinamesiano@gmail.com, password
- admin: alessandroquarta@gmail.com, password
- admin: filippocarano@gmail.com, password
# Ticketing-System-WA-2024
