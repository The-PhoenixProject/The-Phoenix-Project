import { Link } from "react-router-dom";

function CallToAction() {
    return (
        <>
            <section className="d-flex justify-content-center flex-column align-items-center gradient p-5 text-white text-center">
                <h3 className="fw-bold p-2">Join the Phoenix Movement Today!</h3>
                <p className="p-2">Be part of a sustainable future. Rebuild, reuse, and inspire change.</p>
                <div>
                    <Link to="/home" className="orangebtn px-3 py-2 rounded me-1 text-decoration-none">Sign Up Now</Link>
                    <Link to="/home" className="btn btn-outline-light px-3 py-2 m-2 rounded text-decoration-none">Login</Link>
                </div>
                
            </section>
        </>
    );
}
export default CallToAction;