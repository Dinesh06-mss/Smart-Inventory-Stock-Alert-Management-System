const nodemailer = require("nodemailer");
require("dotenv").config({
    path: __dirname + "/.env"
});

// ==========================================
// CREATE EMAIL TRANSPORTER
// ==========================================

function createTransporter() {

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {

        console.log("EMAIL_USER or EMAIL_PASS is missing.");
        return null;

    }

    return nodemailer.createTransport({

        service: "gmail",

        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }

    });

}


// ==========================================
// WELCOME EMAIL
// ==========================================

async function sendWelcomeEmail(username, email) {

    const transporter = createTransporter();

    if (!transporter) {
        return false;
    }

    try {

        await transporter.sendMail({

            from: `"SmartStock" <${process.env.EMAIL_USER}>`,

            to: email,

            subject: "Welcome to SmartStock",

            html: `
                <div style="
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: auto;
                    border: 1px solid #ddd;
                    border-radius: 10px;
                    overflow: hidden;
                ">

                    <div style="
                        background: #2563eb;
                        color: white;
                        padding: 25px;
                        text-align: center;
                    ">

                        <h1>SmartStock</h1>

                        <p>
                            Smart Inventory & Stock Alert Management System
                        </p>

                    </div>

                    <div style="padding: 25px;">

                        <h2>Welcome, ${username}!</h2>

                        <p>
                            Your registration has been completed successfully.
                        </p>

                        <p>
                            You can now use SmartStock to manage your
                            inventory easily and efficiently.
                        </p>

                        <ul>
                            <li>Inventory Management</li>
                            <li>Smart Dashboard</li>
                            <li>Stock Alerts</li>
                            <li>Easy Stock Management</li>
                        </ul>

                        <h3>You're all set!</h3>

                        <p>
                            <b>Manage Smarter. Stock Better.</b>
                        </p>

                    </div>

                    <div style="
                        background: #f3f4f6;
                        padding: 15px;
                        text-align: center;
                        font-size: 12px;
                        color: #666;
                    ">

                        This is an automated email from SmartStock.

                    </div>

                </div>
            `

        });

        console.log("Welcome email sent successfully to:", email);

        return true;

    } catch (error) {

        console.log("Welcome email failed.");
        console.log("Error:", error.message);

        return false;
    }
}


// ==========================================
// LOGIN NOTIFICATION
// ==========================================

async function sendLoginNotification(username, email) {

    const transporter = createTransporter();

    if (!transporter) {
        return false;
    }

    try {

        await transporter.sendMail({

            from: `"SmartStock" <${process.env.EMAIL_USER}>`,

            to: email,

            subject: "SmartStock Login Notification",

            html: `
                <div style="
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: auto;
                    border: 1px solid #ddd;
                    border-radius: 10px;
                    overflow: hidden;
                ">

                    <div style="
                        background: #2563eb;
                        color: white;
                        padding: 25px;
                        text-align: center;
                    ">

                        <h1>SmartStock</h1>

                        <p>Login Notification</p>

                    </div>

                    <div style="padding: 25px;">

                        <h2>Hello ${username},</h2>

                        <p>
                            You have successfully logged in
                            to your SmartStock account.
                        </p>

                        <p>
                            <b>Login Time:</b>
                            ${new Date().toLocaleString()}
                        </p>

                        <p>
                            If you did not perform this login,
                            please secure your account.
                        </p>

                    </div>

                    <div style="
                        background: #f3f4f6;
                        padding: 15px;
                        text-align: center;
                        font-size: 12px;
                        color: #666;
                    ">

                        This is an automated email from SmartStock.

                    </div>

                </div>
            `

        });

        console.log("Login notification sent successfully to:", email);

        return true;

    } catch (error) {

        console.log("Login notification failed.");
        console.log("Error:", error.message);

        return false;
    }
}


module.exports = {
    sendWelcomeEmail,
    sendLoginNotification
};