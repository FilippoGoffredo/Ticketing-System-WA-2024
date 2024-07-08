import dayjs from 'dayjs';
import { Table, Form, Button, Container, Row, Col } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { TextblockList } from './TextblockList.jsx';
import { API } from './API.jsx';

function TicketList(props) {
  const { tickets, isAuthenticated, isAdmin, textblocks, addTextBlockToTicket, userId, changeState, setSelectedCategory } = props;
  const [estimates, setEstimates] = useState([]);

  useEffect(() => {
    if (isAdmin) {
      API.getAuthToken().then((resp) => {
        API.getEstimate(resp.token, tickets).then(response => {
          setEstimates(response.estimations);
        }).catch(err => console.error(err));
      });
    }
  }, [tickets, isAuthenticated]);

  const sortedTickets = [...tickets].sort((a, b) => new Date(b.ticket_timestamp) - new Date(a.ticket_timestamp));

  return (
    <Container className="mt-5">
      <Table responsive bordered hover>
        <thead>
          <tr>
            <th>Title</th>
            <th>State</th>
            <th>Category</th>
            <th>Owner</th>
            <th>Timestamp</th>
            {isAdmin && <th>Estimate</th>}
            {isAuthenticated && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {sortedTickets.map((ticket) => (
            <Ticket
              key={ticket.ticket_id}
              ticket={ticket}
              isAuthenticated={isAuthenticated}
              isAdmin={isAdmin}
              textblocks={textblocks}
              setSelectedCategory={setSelectedCategory}
              addTextBlockToTicket={addTextBlockToTicket}
              userId={userId}
              changeState={changeState}
              estimate={estimates.find(est => est.title === ticket.title && est.category === ticket.category)?.estimation || 'N/A'}
            />
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

function Ticket(props) {
  const { ticket, isAuthenticated, isAdmin, textblocks, userId, changeState, setSelectedCategory, estimate } = props;
  const [showTextBlock, setShowTextBlock] = useState(false);
  const [showAddTextBlockForm, setShowAddTextBlockForm] = useState(false);
  const [newTextBlock, setNewTextBlock] = useState('');

  const handleShowTextBlock = () => {
    setShowTextBlock(true);
  };

  const handleHideTextBlock = () => {
    setShowTextBlock(false);
  };

  const handleShowAddTextBlockForm = () => {
    setShowAddTextBlockForm(true);
  };

  const handleHideAddTextBlockForm = () => {
    setShowAddTextBlockForm(false);
  };

  const handleNewTextBlockChange = (event) => {
    setNewTextBlock(event.target.value);
  };

  const handleNewTextBlockSubmit = (event) => {
    event.preventDefault();
    if (ticket.state !== 'closed') {
      props.addTextBlockToTicket(ticket.ticket_id, newTextBlock);
      handleHideAddTextBlockForm();
    } else {
      alert('Cannot add new text block to a closed ticket');
    }
  };

  const handleToggleTicketState = () => {
    const newState = ticket.state === 'open' ? 'closed' : 'open';
    changeState(ticket.ticket_id, newState);
  };

  const handleCategoryChange = (event) => {
    const newCategory = event.target.value;
    setSelectedCategory(ticket.ticket_id, newCategory);
  };

  return (
    <>
      <tr>
        <td>{ticket.title}</td>
        <td>{ticket.state}</td>
        <td>
          {isAdmin ? (
            <Form.Control as="select" value={ticket.category} onChange={handleCategoryChange}>
              <option value="inquiry">Inquiry</option>
              <option value="maintenance">Maintenance</option>
              <option value="new feature">New Feature</option>
              <option value="administrative">Administrative</option>
              <option value="payment">Payment</option>
            </Form.Control>
          ) : (
            ticket.category
          )}
        </td>
        <td>{ticket.owner_name}</td>
        <td>{dayjs(ticket.ticket_timestamp).format('DD/MM/YYYY ')}</td>
        {isAdmin && <td>{estimate}</td>}
        {isAuthenticated && (
          <td>
            <Button variant="secondary" onClick={showTextBlock ? handleHideTextBlock : handleShowTextBlock}>
              {showTextBlock ? <i className="bi bi-three-dots"></i> : <i className="bi bi-three-dots"></i>}
            </Button>
            <Button variant="secondary" onClick={showAddTextBlockForm ? handleHideAddTextBlockForm : handleShowAddTextBlockForm} className="ms-2">
              {showAddTextBlockForm ? <i className="bi bi-file-earmark-plus"></i> : <i className="bi bi-file-earmark-plus"></i>}
            </Button>
            {(isAdmin || (ticket.owner_id === userId && ticket.state === 'open')) && (
              <Button
                variant={ticket.state === 'open' ? 'danger' : 'warning'}
                onClick={handleToggleTicketState}
                className="ms-2"
              >
                {isAdmin ? (ticket.state === 'open' ? 'Close' : 'Open') : 'Close'}
              </Button>
            )}
          </td>
        )}
      </tr>
      {showTextBlock && (
        <tr>
          <td colSpan="7">
            <TextblockList textblocks={textblocks.filter(tb => tb.ticket_id === ticket.ticket_id).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))} />
          </td>
        </tr>
      )}
      {showAddTextBlockForm && (
        <tr>
          <td colSpan="7">
            <Form onSubmit={handleNewTextBlockSubmit} className="mb-3">
              <Form.Group controlId="newTextBlock">
                <Form.Control type="text" placeholder="Add a new text block" value={newTextBlock} onChange={handleNewTextBlockChange} />
              </Form.Group>
              <Button variant="warning" type="submit">
                Submit
              </Button>
            </Form>
          </td>
        </tr>
      )}
    </>
  );
}

export { TicketList };
