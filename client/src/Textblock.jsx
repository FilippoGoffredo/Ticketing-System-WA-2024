function Textblock(
    author,
    author_name,
    text,
    textblock_id,
    textblock_timestamp,
    ticket_id
){
    this.author = author;
    this.author_name = author_name;
    this.text = text;
    this.textblock_id = textblock_id;
    this.textblock_timestamp = textblock_timestamp;
    this.ticket_id = ticket_id;
}

export {Textblock};