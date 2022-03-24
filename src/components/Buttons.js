import './Buttons.css';

const Buttons = (props) => {
  return (
<div className="buttons">
    <button className="btn" onClick={props.allTime}>
      All Time
    </button>
    <button className="btn" onClick={props.mediumTerm}>
      Past Six Months
    </button>
    <button className="btn" onClick={props.shortTerm}>
      Past Month
    </button>
  </div>
  )
  
};

export default Buttons;
