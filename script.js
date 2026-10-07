const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const { exec } = require("child_process");

const routing = require("./Public/routing.js");

const {
    sendWelcomeEmail,
    sendLoginNotification
} = require("./public/email");

const app = express();
const PORT = 4000;

app.use("/", routing);


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


// ==========================================
// HOME PAGE
// ==========================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "home.html")
    );

});


// ==========================================
// STATIC FILES
// ==========================================

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// ==========================================
// USER SCHEMA
// ==========================================

const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        unique: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        default: "User"
    }

});

const User = mongoose.model(
    "User",
    userSchema
);


// ==========================================
// PRODUCT SCHEMA
// ==========================================

const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    stock: {
        type: Number,
        required: true
    },

    minimum: {
        type: Number,
        required: true
    }

});

const Product = mongoose.model(
    "Product",
    productSchema
);


// ==========================================
// DEFAULT MINIMUM STOCK
// ==========================================

let minimumStock = 10;


// ==========================================
// DEFAULT ADMIN
// ==========================================

async function createDefaultAdmin() {

    const admin = await User.findOne({
        username: "Dinesh"
    });

    if (!admin) {

        const newAdmin = new User({

            username: "Dinesh",

            email: "admin@gmail.com",

            password: "din90",

            role: "Administrator"

        });

        await newAdmin.save();

        console.log(
            "Default administrator created"
        );

    }

}


// ==========================================
// REGISTER
// ==========================================

app.post("/api/register", async (req, res) => {

    try {

        const {
            username,
            email,
            password,
            confirmPassword
        } = req.body;


        if (
            !username ||
            !email ||
            !password ||
            !confirmPassword
        ) {

            return res.status(400).json({

                success: false,

                message: "Please fill all fields."

            });

        }


        if (password !== confirmPassword) {

            return res.status(400).json({

                success: false,

                message: "Passwords do not match."

            });

        }


        if (password.length < 6) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must contain at least 6 characters."

            });

        }


        const existingUsername =
            await User.findOne({
                username: username.trim()
            });


        if (existingUsername) {

            return res.status(400).json({

                success: false,

                message: "Username already exists."

            });

        }


        const existingEmail =
            await User.findOne({
                email: email.trim()
            });


        if (existingEmail) {

            return res.status(400).json({

                success: false,

                message: "Email already registered."

            });

        }


        const newUser = new User({

            username: username.trim(),

            email: email.trim(),

            password: password,

            role: "User"

        });


        await newUser.save();


        // SEND WELCOME EMAIL

        await sendWelcomeEmail(
            newUser.username,
            newUser.email
        );


        res.json({

            success: true,

            message:
                "Registration successful! Welcome email sent."

        });

    } catch (error) {

        console.log(
            "Registration error:",
            error.message
        );

        res.status(500).json({

            success: false,

            message: "Registration failed."

        });

    }

});


// ==========================================
// LOGIN
// ==========================================

app.post("/api/login", async (req, res) => {

    try {

        const {
            username,
            password
        } = req.body;


        if (!username || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter username and password."

            });

        }


        const user = await User.findOne({

            username: username.trim()

        });


        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid username or password."

            });

        }


        if (user.password !== password) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid username or password."

            });

        }


        // SEND LOGIN NOTIFICATION

        sendLoginNotification(user.username, user.email)
        .catch(error => {
        console.log("Login notification error:", error.message);
    });


        sendLoginNotification(user.username, user.email)
    .catch(error => {
        console.log("Login notification error:", error.message);
    });

res.json({
    success: true,
    message: "Login successful",
    user: {
        name: user.username,
        username: user.username,
        email: user.email,
        role: user.role
    }
});

    } catch (error) {

        console.log(
            "Login error:",
            error.message
        );

        res.status(500).json({

            success: false,

            message: "Login failed."

        });

    }

});


// ==========================================
// GET PRODUCTS
// ==========================================

app.get("/api/products", async (req, res) => {

    try {

        const products =
            await Product.find();

        res.json(products);

    } catch (error) {

        console.log(
            "Get products error:",
            error.message
        );

        res.status(500).json({

            success: false,

            message:
                "Unable to fetch products"

        });

    }

});


// ==========================================
// ADD PRODUCT
// ==========================================

app.post("/api/products", async (req, res) => {

    try {

        const product = new Product({

            name: req.body.name,

            category: req.body.category,

            stock: Number(req.body.stock),

            minimum:
                Number(req.body.minimum) ||
                minimumStock

        });


        const savedProduct =
            await product.save();


        res.json({

            success: true,

            message:
                "Product added successfully",

            product: savedProduct

        });

    } catch (error) {

        console.log(
            "Add product error:",
            error.message
        );

        res.status(400).json({

            success: false,

            message:
                "Unable to add product"

        });

    }

});


// ==========================================
// DELETE PRODUCT
// ==========================================

app.delete(
    "/api/products/:id",
    async (req, res) => {

        try {

            await Product.findByIdAndDelete(
                req.params.id
            );


            res.json({

                success: true,

                message:
                    "Product deleted successfully"

            });

        } catch (error) {

            console.log(
                "Delete product error:",
                error.message
            );

            res.status(400).json({

                success: false,

                message:
                    "Unable to delete product"

            });

        }

    }
);


// ==========================================
// UPDATE PRODUCT
// ==========================================

app.put(
    "/api/products/:id",
    async (req, res) => {

        try {

            const product =
                await Product.findByIdAndUpdate(

                    req.params.id,

                    {

                        name: req.body.name,

                        category: req.body.category,

                        stock:
                            Number(req.body.stock),

                        minimum:
                            Number(req.body.minimum) ||
                            minimumStock

                    },

                    {
                        new: true
                    }

                );


            res.json({

                success: true,

                message:
                    "Product updated successfully",

                product: product

            });

        } catch (error) {

            console.log(
                "Update product error:",
                error.message
            );

            res.status(400).json({

                success: false,

                message:
                    "Unable to update product"

            });

        }

    }
);


// ==========================================
// LOW STOCK PRODUCTS
// ==========================================

app.get(
    "/api/products/low-stock",
    async (req, res) => {

        try {

            const products =
                await Product.find();


            const lowStockProducts =
                products.filter(

                    product =>
                        product.stock <=
                        product.minimum

                );


            res.json(lowStockProducts);

        } catch (error) {

            console.log(
                "Low stock error:",
                error.message
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to fetch low-stock products"

            });

        }

    }
);


// ==========================================
// GET SETTINGS
// ==========================================

app.get(
    "/api/settings",
    (req, res) => {

        res.json({

            minimum: minimumStock

        });

    }
);


// ==========================================
// UPDATE SETTINGS
// ==========================================

app.post(
    "/api/settings",
    async (req, res) => {

        try {

            minimumStock =
                Number(req.body.minimum) || 1;


            await Product.updateMany(

                {},

                {
                    $set: {
                        minimum: minimumStock
                    }
                }

            );


            res.json({

                success: true,

                minimum: minimumStock

            });

        } catch (error) {

            console.log(
                "Settings error:",
                error.message
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to update settings"

            });

        }

    }
);


// ==========================================
// DASHBOARD
// ==========================================

app.get(
    "/api/dashboard",
    async (req, res) => {

        try {

            const products =
                await Product.find();


            const totalProducts =
                products.length;


            const totalStock =
                products.reduce(

                    (total, product) =>
                        total + product.stock,

                    0

                );


            const lowStockCount =
                products.filter(

                    product =>
                        product.stock <=
                        product.minimum

                ).length;


            res.json({

                totalProducts:
                    totalProducts,

                totalStock:
                    totalStock,

                lowStockCount:
                    lowStockCount

            });

        } catch (error) {

            console.log(
                "Dashboard error:",
                error.message
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to load dashboard"

            });

        }

    }
);


// ==========================================
// MONGODB CONNECTION
// ==========================================

mongoose.connect(
    "mongodb://127.0.0.1:27017/smartstock"
)

.then(async () => {

    console.log(
        "MongoDB connected successfully"
    );


    await createDefaultAdmin();


    // ==========================================
    // START SERVER
    // ==========================================

    app.listen(PORT, () => {

        console.log("----------------------------------------");
        console.log("SmartStock & StockAlert Server Started");
        console.log("----------------------------------------");
        console.log("Server: http://localhost:4000/");
        console.log("----------------------------------------");


        // OPEN HOME PAGE AUTOMATICALLY

        exec(
            'start "" "http://localhost:4000/"'
        );

    });

})

.catch((error) => {

    console.log(
        "MongoDB connection failed"
    );

    console.log(
        error.message
    );

});