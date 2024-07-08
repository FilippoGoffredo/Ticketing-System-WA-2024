import React, { useState, useEffect } from 'react';
import { Button, Form, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { BiMessageSquareDetail } from "react-icons/bi";
import { Link } from "react-router-dom";
import { API } from './API.jsx';

function AddTicket(props) {
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [estimate, setEstimate] = useState(null);
  const [authToken, setAuthToken] = useState('');

  const validCategories = ["inquiry", "maintenance", "new feature", "administrative", "payment"];

  useEffect(() => {
    // Fetch the auth token
    API.getAuthToken().then((resp) => {
      setAuthToken(resp.token);
    });
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validCategories.includes(category)) {
      setConfirm(true);
      setError('');
    } else {
      setError('Invalid category. Please choose from "inquiry", "maintenance", "new feature", "administrative", "payment".');
    }
  };

  useEffect(() => {
    if (confirm && authToken) {
      API.getEstimateTicket(authToken, title, category)
        .then(response => {
          setEstimate(response.estimation);
        })
        .catch(err => {
          setEstimate('Error retrieving estimate');
        });
    }
  }, [confirm, authToken, title, category]);

  const handleConfirm = () => {
    props.addTicket(category, title);
    if (text !== undefined) {
      props.addTextBlock(text);
    }
  };

  const handleEdit = () => {
    setConfirm(false);
  };

  if (confirm) {
    return (
      <Container className="mt-5">
        <Card className="shadow-sm" style={{ width: '60%', padding: '20px', margin: 'auto' }}>
          <Row className="justify-content-md-center">
            <Col md="auto">
              <Card.Header className="bg-primary text-white">
                <h2><BiMessageSquareDetail /> Confirm Ticket Information</h2>
              </Card.Header>
            </Col>
          </Row>
          <Card.Body>
            <Card.Title>Title: {title}</Card.Title>
            <hr />
            <Card.Text>Category: {category}</Card.Text>
            <hr />
            <Card.Text>Text: {text}</Card.Text>
            {estimate !== null && (
              <>
                <hr />
                <Card.Text>Estimate: {estimate}</Card.Text>
              </>
            )}
            <Button variant="primary" onClick={handleConfirm} className="me-2">Confirm</Button>
            <Button variant="warning" onClick={handleEdit}>Edit</Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      {error && (
        <Row className="justify-content-center mb-3">
          <Col md="6">
            <Alert variant="danger" onClose={() => setError('')} dismissible>
              {error}
            </Alert>
          </Col>
        </Row>
      )}
      <Card className="shadow-sm" style={{ backgroundColor: '#f0f0f0' }}>
        <Card.Header className="text-center bg-primary text-white">
          <h2><BiMessageSquareDetail /> Add Ticket</h2>
        </Card.Header>
        <Card.Body>
          <Link to="/" className="d-inline-block mb-3"><i className="bi bi-arrow-left"/> back</Link>
          <Form onSubmit={handleSubmit}>
            <Form.Group as={Row} controlId="formTitle" className="mb-3">
              <Form.Label column sm={2}>Title:</Form.Label>
              <Col sm={10}>
                <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId="formCategory" className="mb-3">
              <Form.Label column sm={2}>Category:</Form.Label>
              <Col sm={10}>
                <Form.Control type="text" value={category} onChange={(e) => setCategory(e.target.value)} required />
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId="formText" className="mb-4">
              <Form.Label column sm={2}>Text:</Form.Label>
              <Col sm={10}>
                <Form.Control as="textarea" value={text} onChange={(e) => setText(e.target.value)} style={{ height: '200px' }} />
              </Col>
            </Form.Group>
            <Button variant="primary" type="submit">Submit</Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export { AddTicket };
