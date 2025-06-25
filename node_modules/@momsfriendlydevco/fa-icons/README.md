@MomsFriendlyDevCo/Icons
========================
Module which returns the closest FontAwesome class to a file name.


```javascript
var faIcons = require('@momsfriendlydevco/fa-icons');

faIcons('something.mp4') //= "fas fa-file-video"
faIcons('something.csv') //= "fas fa-file-csv"
faIcons('something.weird') //= "fas fa-file"
```


API
===
This module exposes a single function which resolves with the best matching class based on an input file path.


faIcons(path)
-------------
Returns the cloest matching icon based on the internal index.


faIcons.index
-------------
Collection of rules to use when matching the path against the icon.
