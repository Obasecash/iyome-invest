const express = require("express");
const router = express.Router();
const invoice = require("../Controllers/invoiceController");

router.post("/create", invoice.createInvoice);

module.exports = router;
