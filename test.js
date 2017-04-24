/**
 * Created by tsengkasing on 4/24/2017.
 */


const forecast = require('./parseCAPTCHA');


forecast('./xuanke_code/code_92.jpg', function (r) {
    console.log(r);
});