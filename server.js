require('dotenv').config()

const http = require('http');
const express = require('express')
const app = express()
const morgan = require('morgan')
const terminus = require('@godaddy/terminus');
const prometheus = require('prom-client');

process.env.NODE_ENV === "development" ? app.use(morgan('dev')) : app.use(morgan('combined'))

/**
 * Health check
 */
const server = http.createServer(app);
terminus(server, {
  healthChecks: {
   '/healthcheck': async () => {
     return Promise.resolve()
   },
 },
});

/**
 * Metrics endpoint
 */
app.get('/metrics', (req, res) => {
	res.set('Content-Type', prometheus.register.contentType);
	res.end(prometheus.register.metrics());
});

const histogram = new prometheus.Histogram({
    name: 'http_request_duration_seconds',
    help: 'measures how long a GET request takes',
    labelNames: ['method', 'handler']
  });

const employees = [{"id":1,"name":"Lanny McDonald"},{"id":2,"name":"Allen Pitts"},{"id":3,"name":"Gary Roberts"},{"id":4,"name":"Dave Sapunjis"},{"id":5,"name":"Mike Vernon"}]

app.get('/admin/employees', (req, res) => {
    const end_timer = histogram.startTimer({method: 'GET', handler: '/admin'});
    res.json(employees);
    end_timer();
});

app.get('/admin/employees/:id', (req, res) => {
    const end_timer = histogram.startTimer({method: 'GET', handler: '/admin'});
    res.json(employees[req.params.id - 1]);
    end_timer();
});

app.get('/admin/shift-rules', (req, res) => {
    const end_timer = histogram.startTimer({method: 'GET', handler: '/admin'});
    res.json([{"rule_id":4,"employee_id":1,"value":3},{"rule_id":4,"employee_id":2,"value":5},{"rule_id":2,"employee_id":1,"value":5},{"rule_id":2,"employee_id":2,"value":5},{"rule_id":2,"value":6},{"rule_id":4,"value":2},{"rule_id":7,"value":2}]);
    end_timer();
});

app.get('/admin/time-offs', (req, res) => {
    const end_timer = histogram.startTimer({method: 'GET', handler: '/admin'});
    res.json([{"employee_id":1,"week":23,"days":[1,2,3]},{"employee_id":2,"week":23,"days":[5,6,7]},{"employee_id":3,"week":23,"days":[6,7]},{"employee_id":4,"week":24,"days":[3,4]},{"employee_id":5,"week":24,"days":[5,6,7]},{"employee_id":4,"week":24,"days":[1]},{"employee_id":1,"week":25,"days":[1,2,3]},{"employee_id":1,"week":25,"days":[7]},{"employee_id":4,"week":25,"days":[5,6,7]},{"employee_id":3,"week":25,"days":[6,7]},{"employee_id":5,"week":26,"days":[1,2,3]},{"employee_id":2,"week":26,"days":[3,4]},{"employee_id":4,"week":26,"days":[1,2,3,4]},{"employee_id":2,"week":26,"days":[1]}]);
    end_timer();
});

server.listen(process.env.PORT);