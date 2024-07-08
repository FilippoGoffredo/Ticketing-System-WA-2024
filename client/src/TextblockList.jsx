import dayjs from 'dayjs';

function TextblockList(props) {
    return (
        <div>
            {props.textblocks && props.textblocks.map((textblock) => (
                <Textblock key={textblock.textblock_id} textblock={textblock} />
            ))}
        </div>
    );
}

function Textblock(props) {
    const { textblock } = props;
    return (
        <div>
            <b>{textblock.author_name}</b>
            <p style={{fontSize:'10pt'}}>{dayjs(textblock.textblock_timestamp).format('DD/MM/YYYY HH:mm')}</p>
            <i>{textblock.text}</i>
            <hr/>
        </div>
    );
}

export { TextblockList };