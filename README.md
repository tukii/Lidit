# Lidit
__Live__ image board / reddit style website  

Written using typescript/angular2/node.js  

Very early stage. v0.1 
You can run using `npm run go` (it starts the gulp - browsersync and nodemon, and tsc which watches for file changes). You should also run tsc in public/app in another cmd/terminal
or you can transpile .ts files in / and public/app and just do `node app.js`

##Goal
Simple. Have a fully reactive, modern, and easy-to use shitposting place (reddit/4chan -like) where people can see updates and changes in real time (or close to real time).

##Ideas
Not having pages, but rather loading new content as the user scrolls down.
Prevent users from having personal "sublids" and just stick to default ones?
Create sublid if it doesn't exist simply if user goes on that page?
Have multiple sublids open at one time side by side? Or just give an option to show multiple combined by holding shift and selecting?
