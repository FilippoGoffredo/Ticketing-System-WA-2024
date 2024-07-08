import React, { useState } from "react";
import { Button, Card, Col, Container, Form, Row, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import validator from "validator";

/**
 * The login page displayed on "/login"
 * 
 * @param props.loginCbk callback to perform the actual login
 * @param props.errorAlertActive true when the error alert on the top is active and showing, false otherwise
 */
function LoginForm(props) {
  const [email, setEmail] = useState("martinamesiano@gmail.com");
  const [password, setPassword] = useState("password");

  const [emailError, setEmailError] = useState("");
  const [passwordValid, setPasswordValid] = useState(true);

  const [waiting, setWaiting] = useState(false);

  // Stato per gestire l'avviso di errore
  const [errorAlert, setErrorAlert] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    // Validate form
    const trimmedEmail = email.trim();
    const emailError = validator.isEmpty(trimmedEmail) ? "Email must not be empty" : (
      !validator.isEmail(trimmedEmail) ? "Not a valid email" : ""
    );
    const passwordValid = !validator.isEmpty(password);

    if (!emailError && passwordValid) {
      setWaiting(true);
      props.loginCbk(email, password, (success) => {
        setWaiting(false);
        if (!success) {
          setErrorAlert(true);
        }
      });
    } else {
      setEmailError(emailError);
      setPasswordValid(passwordValid);
    }
  };

  return (
    <Container fluid style={{ marginTop: props.errorAlertActive ? "2rem" : "6rem" }}>
      {errorAlert && (
        <Row className="justify-content-center">
          <Col md="6">
            <Alert variant="danger" onClose={() => setErrorAlert(false)} dismissible>
              Invalid email or password
            </Alert>
          </Col>
        </Row>
      )}
      <Row className="justify-content-center">
        <Col md="6">
          <Card>
            <Card.Header as="h2" className="text-center">Login</Card.Header>
            <Card.Body>
              <Form noValidate onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    autoFocus
                    isInvalid={!!emailError}
                    onChange={(event) => { setEmail(event.target.value); setEmailError(""); }}
                  />
                  <Form.Control.Feedback type="invalid">
                    {emailError}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    isInvalid={!passwordValid}
                    onChange={(event) => { setPassword(event.target.value); setPasswordValid(true); }}
                  />
                  <Form.Control.Feedback type="invalid">
                    Password must not be empty
                  </Form.Control.Feedback>
                </Form.Group>

                <Button variant="primary" type="submit" disabled={waiting} className="w-100">
                  {waiting ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      {" "}
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </Form>
            </Card.Body>
            <Card.Footer className="text-center">
              <Link to="/" className="btn btn-link"><i className="bi bi-arrow-left" /> Back</Link>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export { LoginForm };
