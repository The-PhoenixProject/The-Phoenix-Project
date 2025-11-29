import CloseButton from 'react-bootstrap/CloseButton';
function LearnMore({ onClose }) {
    return ( 
        <>
        <div className="popup-overlay">
      <div className="popup-box">
        <CloseButton className="close-btn text-danger " onClick={onClose}/>
          
        <div className="p-4">
            <h2 className="pb-3 orangeText">Learn More</h2>
            <p className="fs-5"><span className="text-success">Phoenix</span> is an online marketplace dedicated to <span className="orangeText">breathing new life into old, used, and pre-loved items</span>. Just like the <span className="text-success">legendary bird </span>that rises from its ashes, 
            <span className="text-success">Phoenix</span> helps forgotten treasures find a new purpose through 
            <span className="orangeText"> recycling, upcycling, and resale</span>.
            <span className="text-success"> Phoenix</span> connects <span className="orangeText">sellers and buyers</span> who believe in sustainability, affordability, and creativity.
            <span className="text-success "> Phoenix Where old things become new beginnings</span>.</p>
        </div>
        
      </div>
    </div>
        </>
        );
}

export default LearnMore;