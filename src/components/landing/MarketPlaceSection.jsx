import { motion } from "framer-motion";
const woodTable = "/assets/landingImgs/woodTable.png";
const bag = "/assets/landingImgs/bag.png";
const metalArt = "/assets/landingImgs/metalArtSculpture.png";
import { Link } from "react-router-dom";

const sectionCustom={
    width: '80%',
}

function MarketPlace() {
    return ( 
        <>
            <section id='products' className=" d-flex align-items-center justify-content-center pt-5 " >
              <div   className=" py-5" style={sectionCustom}>
                <h2 className=" text-center  title-color">Marketplace</h2>
                <div className="row py-4 d-flex flex-wrap gap-4 justify-content-center">
                    <motion.div
                          whileHover={{ scale: 0.92 }} className="col-md-5 col-9 col-sm-7 col-lg-3 shadow rounded bg-light">
                        <div className="py-3 ">
                            <img src={woodTable} alt="woodTable" className="img-fluid w-100" />
                            <h5 className="mt-3">Reclaimed Wood Table</h5>
                            <p>Handcrafted from salvaged materials</p>
                            <p className="text-muted">$299</p>
                            <Link  to="/home" className="greenBtn p-2 rounded  me-1 mb-1">View Details</Link> {/*redirect him to signup page then the details page*/}
                            <Link  to="/home" className="greenBtnWithoutBg p-2 rounded mb-1">Buy Now</Link> {/*redirect him to signup page then the details page*/}
                        </div>
                    </motion.div>
                    <motion.div
                          whileHover={{ scale: 0.92 }} className="col-md-5 col-9 col-sm-7 col-lg-3 shadow rounded bg-light">
                        <div className="py-3">
                            <img src={bag} alt="woodTable" className="img-fluid w-100" />
                            <h5 className="mt-3">Eco Tote Bag</h5>
                            <p>Made from recycled plastic bottles</p>
                            <p className="text-muted">$25</p>
                            <Link  to="/home" className="greenBtn p-2 rounded  me-1 mb-1">View Details</Link> {/*redirect him to signup page then the details page*/}
                            <Link  to="/home" className="greenBtnWithoutBg p-2 rounded mb-1">Buy Now</Link> {/*redirect him to signup page then the details page*/}
                        </div>
                    </motion.div>
                    <motion.div
                          whileHover={{ scale: 0.92 }}className="col-md-5 col-9 col-sm-7 col-lg-3 shadow rounded bg-light">
                        <div className="py-3">
                            <img src={metalArt} alt="woodTable" className="img-fluid w-100" />
                            <h5 className="mt-3">Metal Art Sculpture</h5>
                            <p>Artistic piece from scrap metal</p>
                            <p className="text-muted">$150</p>
                            <Link  to="/home" className="greenBtn p-2 rounded  me-1 mb-1">View Details</Link> {/*redirect him to signup page then the details page*/}
                            <Link  to="/home" className="greenBtnWithoutBg p-2 rounded  mb-1">Buy Now</Link> {/*redirect him to signup page then the details page*/}
                        </div>
                    </motion.div>
                </div>
                <div className="d-flex justify-content-center">
                    <Link  to="/home" className="greenBtnWithoutBg rounded fs-5  py-1 px-2 m-2" >Explore More</Link>
                </div>
                
              </div>
            </section>
        </>
     );
}

export default MarketPlace;
