const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const swagger = require('swagger-node-express');

router.use(express.static('dist'));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
	extended: true
}));

swagger.setApiInfo({
	title: "Ocean Builder APIs",
	Ydescription: "This system is designed to enable users to have controls on Ocean builders seapods...",
	termsOfServiceUrl: "https://oceanbuilders.com/terms/",
	contact: "ola@oceanbuilders.io",
	license: "Apache 2.0",
	licenseUrl: "http://www.apache.org/licenses/LICENSE-2.0.html"
});

router.get('/', function (req, res) {
	res.sendFile(__dirname + '/../dist/index.html');
});

module.exports = router;