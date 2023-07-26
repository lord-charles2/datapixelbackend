const app = require("express")();
const bodyParser = require("body-parser");
const morgan = require("morgan"); // import morgan for request logging
const cors = require("cors"); // import cors for handling Cross-Origin Resource Sharing (CORS)
const { notFound, errorHandler } = require("./middlewares/error-handler");
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || 8000;
const productRouter = require("./routes/products");
const usersRouter = require("./routes/userAuth");
const enqRouter = require("./routes/enqRoute");
const categoriesRouter = require("./routes/categories");
const uploadRouter = require("./routes/uploadRoute");
const blogRouter = require("./routes/blogRoute");
const blogcategoryRouter = require("./routes/blogCatRoute");
const couponRouter = require("./routes/couponRoute");
const colorRouter = require("./routes/colorRoute");
const brandRouter = require("./routes/brandRoute");
const flashSaleRouter = require("./routes/flashSale");
const cartRouter = require("./routes/userCart");
const payment = require("./routes/payment");
const dbConnect = require("./config/dbConnect");
const sendsms = require("./routes/sendsms");
const vouchers = require("./routes/vouchers");

dbConnect();
// apply middlewares
app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/upload", uploadRouter);
app.use("/products", productRouter);
app.use("/user", usersRouter);
app.use("/categories", categoriesRouter);
app.use("/blog", blogRouter);
app.use("/blogcategory", blogcategoryRouter);
app.use("/coupon", couponRouter);
app.use("/enquiry", enqRouter);
app.use("/color", colorRouter);
app.use("/brand", brandRouter);
app.use("/cart", cartRouter);
app.use("/flashSale", flashSaleRouter);
app.use("/payment", payment);
app.use("/sms", sendsms);
app.use("/vouchers", vouchers);

//error handlers
app.use(notFound);
app.use(errorHandler);

// start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}.`);
});
