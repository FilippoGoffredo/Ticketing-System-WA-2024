function Ticket(
    owner_id,
    category,
    owner_name,
    state,
    ticket_id,
    ticket_timestamp,
    title
){
    this.owner_id = owner_id;
    this.category = category;
    this.owner_name = owner_name;
    this.state = state;
    this.ticket_id = ticket_id;
    this.ticket_timestamp = ticket_timestamp;
    this.title = title;
}

export {Ticket};