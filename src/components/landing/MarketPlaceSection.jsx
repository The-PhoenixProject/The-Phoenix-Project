import { motion } from "framer-motion";
import woodTable from "../../assets/landingImgs/woodTable.png";
import bag from "../../assets/landingImgs/bag.png";
import metalArt from "../../assets/landingImgs/metalArtSculpture.png";


const sectionCustom={
    width: '80%',
}

function MarketPlace() {
    return ( 
        <>
            <section className=" d-flex align-items-center justify-content-center pt-5 " id='marketplace'>
              <div   className="bg-light py-5" style={sectionCustom}>
                <h2 className=" text-center ">Marketplace</h2>
                <div className="row py-4 d-flex flex-wrap gap-4 justify-content-center">
                    <motion.div
                          whileHover={{ scale: 0.9 }} className="col-md-5 col-9 col-sm-7 col-lg-3 shadow rounded">
                        <div className="py-3">
                            <img src={woodTable} alt="woodTable" className="img-fluid w-100" />
                            <h5 className="mt-3">Reclaimed Wood Table</h5>
                            <p>Handcrafted from salvaged materials</p>
                            <p className="text-muted">$299</p>
                            <button className="btn btn-success px-2 me-1 mb-1">View Details</button> {/*redirect him to signup page then the details page*/}
                            <button className="btn btn-outline-success mb-1">Buy Now</button> {/*redirect him to signup page then the details page*/}
                        </div>
                    </motion.div>
                    <motion.div
                          whileHover={{ scale: 0.9 }} className="col-md-5 col-9 col-sm-7 col-lg-3 shadow rounded">
                        <div className="py-3">
                            <img src={bag} alt="woodTable" className="img-fluid w-100" />
                            <h5 className="mt-3">Eco Tote Bag</h5>
                            <p>Made from recycled plastic bottles</p>
                            <p className="text-muted">$25</p>
                            <button className="btn btn-success px-2 me-1 mb-1">View Details</button> {/*redirect him to signup page then the details page*/}
                            <button className="btn btn-outline-success mb-1">Buy Now</button> {/*redirect him to signup page then the details page*/}
                        </div>
                    </motion.div>
                    <motion.div
                          whileHover={{ scale: 0.9 }}className="col-md-5 col-9 col-sm-7 col-lg-3 shadow rounded">
                        <div className="py-3">
                            <img src={metalArt} alt="woodTable" className="img-fluid w-100" />
                            <h5 className="mt-3">Metal Art Sculpture</h5>
                            <p>Artistic piece from scrap metal</p>
                            <p className="text-muted">$150</p>
                            <button className="btn btn-success px-2 me-1 mb-1">View Details</button> {/*redirect him to signup page then the details page*/}
                            <button className="btn btn-outline-success mb-1">Buy Now</button> {/*redirect him to signup page then the details page*/}
                        </div>
                    </motion.div>
                </div>
                <button className="btn-gradient rounded fs-5  py-1 d-block mx-auto m-4 px-5">Explore More</button>
              </div>
            </section>
        </>
     );
}

export default MarketPlace;