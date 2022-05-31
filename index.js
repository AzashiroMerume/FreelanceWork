const express = require('express')
const session = require('express-session')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')
const path = require('path')
const bodyParser = require('body-parser')
const adminRoutes = require('./routes/admin_routes')
const mainRoutes = require('./routes/main_routes')
const apiRoutes = require('./routes/api_routes')
const config = require('./config/config').development

const port = 5000

const app = express();
const hbs = exphbs.create({
	defaultLayout: 'welcome',
	extname: 'hbs'
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')))

app.use(session({
    secret: 'Your_Secret_Key',
    resave: true,
    saveUninitialized: true
}))

app.use(adminRoutes)
app.use(mainRoutes)
app.use(apiRoutes)

//redirect to 404 if non-existing adress
app.use((req, res, next) => {
	res.redirect('/404')
})

async function start() {
	try {
		await mongoose.connect(config.url, {
			useNewUrlParser: true
		})
		app.listen(port, () => {
			console.log('Server has been started successfully!')
        })
	} catch(error) {
		console.log(error)
	}
}

start()