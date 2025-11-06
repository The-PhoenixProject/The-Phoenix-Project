function MarketPlace() {
    return ( 
        <>
            <section className="marketplace-section">
              <div className="container">
                <h2 className="section-title text-center mb-5">Marketplace</h2>
                <div className="row">
                    <div className="col-md-4">
                        <div className="marketplace-item">
                            <img src="https://via.placeholder.com/300" alt="Product" className="img-fluid" />
                            <h5 className="mt-3">Product Name</h5>
                            <p className="text-muted">$29.99</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="marketplace-item">
                            <img src="https://via.placeholder.com/300" alt="Product" className="img-fluid" />
                            <h5 className="mt-3">Product Name</h5>
                            <p className="text-muted">$29.99</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="marketplace-item">
                            <img src="https://via.placeholder.com/300" alt="Product" className="img-fluid" />
                            <h5 className="mt-3">Product Name</h5>
                            <p className="text-muted">$29.99</p>
                        </div>
                    </div>
                </div>
              </div>
            </section>
        </>
     );
}

export default MarketPlace;