const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const fileupload = require('express-fileupload');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

CONFIG = require('./config/config');

const { auth, restaurants } = require('./routes');
const { sequelize } = require('./models');

const app = express();

app.use(express.json());
app.use(cookieParser());

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

app.use(fileupload());

app.use(helmet());
app.use(xss());

app.use(rateLimit({
    windowMs: 10 * 60 * 1000,   // 10 mins
    max: 100,
}));

app.use(cors());

const PORT = process.env.PORT || 8080;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to Food Delivery API 🎉👏'
    });
});

app.use('/api/v1/auth', auth);
app.use('/api/v1/restaurants', restaurants);

app.listen(PORT, async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();

        console.log('DB connect successfully');
    } catch (error) {
        console.error('Unable to connect DB: ', error);
    }

    console.log(`Server running on ${process.env.NODE_ENV} mode on PORT ${PORT}`);
});