const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const twilio = require('twilio');
const app = express();
const port = 3000;
dotenv.config();
app.use(bodyParser.urlencoded({ extended: false }));

const accountSid = process.env.ASID;
const authToken = process.env.AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);

const myPhoneNumber = '+918287271936';
const twilioPhoneNumber = process.env.PHONE_NUMBER;
const audio_url = 'https://flavescent-giraffe-6638.twil.io/assets/Fara%20interview%20audio.mp3';
app.post('/ivr', (req, res) => {
    res.type('text/xml');
    res.send(`
        <Response>
            <Play>${audio_url}</Play>
            <Gather action="/handleKeyPress" method="POST">
            <Say>Press 1 now.</Say>
            </Gather>
            <Pause length="5"/>
        </Response>
    `);
});

app.post('/handleKeyPress', (req, res) => {
    const digitPressed = req.body.Digits;
    let responseMessage;

    if (digitPressed === '1') {
        responseMessage = 'You will receive your interview link shortly.';
        const interviewLink = 'https://v.personaliz.ai/?id=9b697c1a&uid=fe141702f66c760d85ab&mode=test';
        twilioClient.messages.create({
            body: `Your interview link: ${interviewLink}`,
            from: twilioPhoneNumber,
            to: myPhoneNumber
        }).then(() => {
            console.log('Interview link sent via SMS.');
        }).catch(err => {
            console.error('Failed to send SMS:', err);
        });
    } else {
        responseMessage = 'Invalid option selected.';
    }

    res.type('text/xml');
    res.send(`
        <Response>
            <Say>${responseMessage}</Say>
            <Hangup/>
        </Response>
    `);
});


const makeCall = () => {
    twilioClient.calls.create({
        url: 'https://6769-103-212-131-208.ngrok-free.app/ivr',
        to: myPhoneNumber,
        from: twilioPhoneNumber
    }).then(call => {
        console.log('Call initiated:', call.sid);
    }).catch(err => {
        console.error('Failed to initiate call:', err);
    });
};

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    makeCall();
});
