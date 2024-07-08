"use strict";

import { useEffect, useState } from 'react'
import dayjs from 'dayjs';
import { Container, Navbar, Form , Button} from 'react-bootstrap';
import { BrowserRouter, Routes, Route, Outlet, useNavigate } from 'react-router-dom'
import { LoginForm } from './LoginForm.jsx';
import {API} from './API.jsx';
import { TicketList } from './TicketList.jsx';
import { Ticket } from './Ticket.jsx';
import { Textblock } from './Textblock.jsx';
import {AddTicket} from './AddTicket.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css'


function App() {
  return(
    <BrowserRouter>
      <Main/>
    </BrowserRouter>
  )
}

function Main(){

  const navigate = useNavigate();
  
  const [errors, setErrors] = useState([]);
  const [user, setUser] = useState(undefined);
  const [tickets, setTickets] = useState([]);
  const [textblocks, setTextblocks] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authToken, setAuthToken] = useState(undefined);
  const [estimate, setEstimate] = useState([]);

  

  const renewToken = () => {
    API.getAuthToken().then((resp) => { setAuthToken(resp.token); } )
    .catch(err => {console.log("DEBUG: renewToken err: ",err)});
  }



  useEffect(() => {
    Promise.all([API.fetchTickets()])
    .then(res => {
      const t = res[0];
      setTickets(t.map((ticket) => new Ticket(
        ticket.owner_id,
        ticket.category,
        ticket.owner_name,
        ticket.state,
        ticket.ticket_id,
        ticket.ticket_timestamp,
        ticket.title
      )));
      if(loggedIn && t.length > 0){
        Promise.all([API.fetchTextBlocks()])
        .then(res => {
          const tb = res[0];
          setTextblocks(tb.map((textblock) => new Textblock(
            textblock.author,
            textblock.author_name,
            textblock.text,
            textblock.textblock_id,
            textblock.textblock_timestamp,
            textblock.ticket_id
          )));
        })

  
      }
    })
  }, [loggedIn]);
  

 /*
 //Use this to debug the user object
  useEffect(() => {
    console.log(estimate);
  }, [estimate]); 
  
*/



  useEffect(()=> {
    const checkAuth = async() => {
      try {
        // here you have the user info, if already logged in
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
        API.getAuthToken().then((resp) => { setAuthToken(resp.token); })
      } catch(err) {
        // NO need to do anything: user is simply not yet authenticated
        //handleError(err);
      }
    };
    checkAuth();

  }, []);  // The useEffect callback is called only the first time the component is mounted.

    /**
    * Perform the login
    */

    const login = (email, password, onFinish) => {
      API.login(email, password)
        .then(user => {
          setErrors([]);
          setUser(user);
          setLoggedIn(true);
          
          if(user.admin){
            setIsAdmin(true);
          }
          renewToken();
          navigate("/");
        })
        .catch(err => setErrors(err))
        .finally(() => onFinish?.());
    };

  const addTicket = (category, title) => {
    const state = 'open';
    API.addTicket(state, category, user.id, title)
      .then(() => {
        setErrors([]);
        API.fetchTickets()
        .then(res => {
          const t = res;
          setTickets(t.map((ticket) => new Ticket(
            ticket.owner_id,
            ticket.category,
            ticket.owner_name,
            ticket.state,
            ticket.ticket_id,
            ticket.ticket_timestamp,
            ticket.title
          )));
        })
        Promise.all([API.fetchTextBlocks()])
        .then(res => {
          const tb = res[0];
          setTextblocks(tb.map((textblock) => new Textblock(
            textblock.author,
            textblock.author_name,
            textblock.text,
            textblock.textblock_id,
            textblock.textblock_timestamp,
            textblock.ticket_id
          )));
        })
        navigate("/");
      })
      .catch(err => setErrors(err));
  };

  const addTextblock = (text) => {
    let lastId;
    if(tickets.length > 0) {
      lastId = tickets[tickets.length - 1].ticket_id;
    }
    API.addTextBlock(lastId+1, user.id, text)
      .then(() => {
        setErrors([]);
      })
      .catch(err => setErrors(err));
  };

  const changeState = (ticketId) => {  
    const ticket = tickets.find(t => t.ticket_id === ticketId);
    if (ticket.state === 'open') {
      API.updateTicketStatus(ticketId, 'closed')
        .then(() => {
          setErrors([]);
          API.fetchTickets()
          .then(res => {
            const t = res;
            setTickets(t.map((ticket) => new Ticket(
              ticket.owner_id,
              ticket.category,
              ticket.owner_name,
              ticket.state,
              ticket.ticket_id,
              ticket.ticket_timestamp,
              ticket.title
            )));
          })
          Promise.all([API.fetchTextBlocks()])
          .then(res => {
            const tb = res[0];
            setTextblocks(tb.map((textblock) => new Textblock(
              textblock.author,
              textblock.author_name,
              textblock.text,
              textblock.textblock_id,
              textblock.textblock_timestamp,
              textblock.ticket_id
            )));
          })
  
        })
        .catch(err => setErrors(err));
    } else {
      API.updateTicketStatus(ticketId, 'open')
        .then(() => {
          setErrors([]);
          API.fetchTickets()
          .then(res => {
            const t = res;
            setTickets(t.map((ticket) => new Ticket(
              ticket.owner_id,
              ticket.category,
              ticket.owner_name,
              ticket.state,
              ticket.ticket_id,
              ticket.ticket_timestamp,
              ticket.title
            )));
          })
          Promise.all([API.fetchTextBlocks()])
          .then(res => {
            const tb = res[0];
            setTextblocks(tb.map((textblock) => new Textblock(
              textblock.author,
              textblock.author_name,
              textblock.text,
              textblock.textblock_id,
              textblock.textblock_timestamp,
              textblock.ticket_id
            )));
          })
  
        })
        .catch(err => setErrors(err));
    }
  };

const setSelectedCategory = (ticketId, newCategory) => {
  // Chiamata API per aggiornare la categoria del ticket
  API.updateTicketCategory(ticketId, newCategory)
    .then(() => {
      // Aggiorna localmente solo il ticket specifico con la nuova categoria
      setTickets(prevTickets =>
        prevTickets.map(ticket =>
          ticket.ticket_id === ticketId ? { ...ticket, category: newCategory } : ticket
        )
      );
    })
    .catch(err => {
      setErrors([err]); // Gestisci gli errori se ci sono problemi nell'aggiornamento della categoria
    });
};




  const addTextBlockToSelectedTicket = async (selectedTicketId, text) => {
    try {
        await API.addTextBlock(selectedTicketId, user.id, text);
        setErrors([]);
        Promise.all([API.fetchTextBlocks()])
        .then(res => {
          const tb = res[0];
          setTextblocks(tb.map((textblock) => new Textblock(
            textblock.author,
            textblock.author_name,
            textblock.text,
            textblock.textblock_id,
            textblock.textblock_timestamp,
            textblock.ticket_id
          )));
        })
    } catch (err) {
        setErrors([err]);
    }
}

  /**
   * Perform the logout
   */
  const logout = () => {
    API.logout()
      .then(() => {
        setUser(undefined);
        setAuthToken(undefined);
        setLoggedIn(false);
        setIsAdmin(false);
      })
      .catch(err => {
        // Remove eventual 401 Unauthorized errors from the list
        setErrors(err.filter(e => e !== "Not authenticated"));
      });
  };


  return(
    <Container fluid>
      <Routes>
        <Route path="/" element={<HomePage username={user && user.name} userId={user && user.id} logout={logout} tickets={tickets} isAdmin={isAdmin}
        loggedIn={loggedIn} textblocks={textblocks} addTextBlockToTicket={addTextBlockToSelectedTicket} changeState={changeState} 
        setSelectedCategory={setSelectedCategory} estimate={estimate} authToken={authToken}/>}/>
        <Route path="/login" element={<LoginForm loginCbk={login} errorAlertActive={errors.length > 0}/>}/>
        <Route path="/addticket" element={<AddTicket addTicket={addTicket} addTextBlock={addTextblock} />}/>
      </Routes>
    </Container>
  )
}

function Header(props){
  const navigate = useNavigate();
  return(
    <Navbar bg="primary" variant="dark" style={{width:'100%'}} >
      <Navbar.Brand className="d-flex align-items-center">
        <span className='mx-2'><i className="bi bi-card-text"/></span>
        <span className="mx-2">{props.appName || "Ticketing System"}</span>
        {props.username && <span className="mx-2">{props.username}</span>}
      </Navbar.Brand>
      <Navbar.Collapse className="justify-content-end">
        {!props.username && <Button variant="primary" 
        onClick={() => navigate("/login")}> <i className="bi bi-person-circle me-2" />Login</Button>}
        {props.username && <Button variant="primary"
         onClick={props.logout}> <i className="bi bi-box-arrow-right me-2" />Logout</Button>}
        {props.username && <Button variant="primary"
         onClick={() => navigate("/addticket")}> <i className="bi bi-plus-circle-fill me-2" />Add Ticket</Button>}
      </Navbar.Collapse>
    </Navbar>
  );
}

function HomePage(props){

  return(
    <Container fluid>
          <Header username={props.username} logout={props.logout}/>
          <TicketList tickets={props.tickets} isAuthenticated={props.loggedIn} userId={props.userId} isAdmin={props.isAdmin} 
          textblocks={props.textblocks} addTextBlockToTicket={props.addTextBlockToTicket} changeState={props.changeState}  
          setSelectedCategory={props.setSelectedCategory} estimate={props.estimate} />
    </Container>

  )
}



export default App
