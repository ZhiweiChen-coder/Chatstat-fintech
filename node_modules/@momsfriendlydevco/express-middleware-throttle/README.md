@MomsFriendlyDevCo/express-middleware-throttle
=======================
Async express middleware throttling mechanism based on MongoDB locking.

```javascript
var emt = require('@momsfriendlydevco/express-middleware-throttle');

app.middleware.express.throttle = emt();
```


API
===

emt(settings)
--------------
Main middleware factory.


Settings
-------------

| Setting              | Type     | Default                            | Description                                     |
|----------------------|----------|------------------------------------|-------------------------------------------------|
| `wait`             | `number` | 10000                             | Milisecond to wait before releasing lock |
