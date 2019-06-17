const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'hd.sharma86@gmail.com',
        subject: 'Task App | Welcome Email',
        text: `Welcome to Task App, ${name}, let me know how you get along with the app.`
    });
}

const sendCancelEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'hd.sharma86@gmail.com',
        subject: 'Task App | Account Cancellation',
        text: `Good bye! ${name} We respect your decision to get out of the Task App, please let us know why you decided to leave the app.`
    });
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
};