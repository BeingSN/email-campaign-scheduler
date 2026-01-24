require('dotenv').config();
require('common-env')();
const express = require('express');
const app = express();

const Sentry = require('@sentry/node');
Sentry.init({ dsn: 'https://5834b1a260fc470b9783724987dddea4@sentry.codecactus.com/12' });

/**
 * This is the express server file which is imported in bin/www to be called.
 * This ensures seperation of express app server from other things.
 */

/** whatever data is coming from request, consider it as json */
app.use(express.json());

app.set('view_engine', 'html');
/**
 * catch 404 and forward to error handler
 */

app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/** error handler */
/** no stacktraces leaked to user unless in development environment */
app.use((err, req, res) => {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: app.get('env') === 'development' ? err : {}
    });
});

module.exports = app;
