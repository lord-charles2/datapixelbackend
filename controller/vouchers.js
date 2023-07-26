const { default: axios } = require("axios");
const WiFiVoucher = require("../models/vouchers");

// Controller function to create a WiFi voucher
const createWiFiVoucher = async (req, res) => {
  try {
    const { speed, validity, bandwidth, code } = req.body;

    // Create a new WiFiVoucher instance
    const wifiVoucher = new WiFiVoucher({
      speed,
      validity,
      bandwidth,
      code,
    });

    // Save the WiFi voucher to the databas
    const createdVoucher = await wifiVoucher.save();

    res.status(201).json(createdVoucher);
  } catch (error) {
    res.status(500).json({ error: "Failed to create WiFi voucher" });
  }
};

// Controller function to get all WiFi vouchers
const getAllWiFiVouchers = async (req, res) => {
  try {
    const vouchers = await WiFiVoucher.find();

    res.status(200).json(vouchers);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve WiFi vouchers" });
  }
};

// Controller function to get a WiFi voucher by ID
const getWiFiVoucherById = async (req, res) => {
  try {
    const voucherId = req.params.id;

    const voucher = await WiFiVoucher.findById(voucherId);

    if (!voucher) {
      return res.status(404).json({ error: "WiFi voucher not found" });
    }

    res.status(200).json(voucher);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve WiFi voucher" });
  }
};

// Controller function to get WiFi vouchers by matching criteria
const getWiFiVoucherByCriteria = async (req, res) => {
  try {
    const { speed, validity, bandwidth, code } = req.body;

    const vouchers = await WiFiVoucher.find({
      speed: speed,
      validity: validity,
      bandwidth: bandwidth,
      code: code,
    });

    if (vouchers.length === 0) {
      return res.status(404).json({ error: "No WiFi vouchers found" });
    }

    res.status(200).json(vouchers);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve WiFi vouchers", error });
  }
};

const getWiFiVoucherCount = async (req, res) => {
  try {
    const vouchers = [
      {
        bandwidth: "80Gb",
        speed: "10",
        validity: "7days",
      },
      {
        bandwidth: "70Gb",
        speed: "5",
        validity: "30days",
      },
      {
        bandwidth: "280Gb",
        speed: "10",
        validity: "30days",
      },
      {
        bandwidth: "140Gb",
        speed: "8",
        validity: "30days",
      },
      {
        bandwidth: "50Gb",
        speed: "5",
        validity: "12hours",
      },
      {
        bandwidth: "40Gb",
        speed: "5",
        validity: "7days",
      },
      {
        bandwidth: "60Gb",
        speed: "8",
        validity: "7days",
      },
      {
        bandwidth: "50Gb",
        speed: "8",
        validity: "3hours",
      },
      {
        bandwidth: "50Gb",
        speed: "8",
        validity: "hour",
      },
      {
        bandwidth: "5Gb",
        speed: "10",
        validity: "24hours",
      },
    ];

    const counts = [];

    for (const voucher of vouchers) {
      const count = await WiFiVoucher.countDocuments(voucher);
      counts.push({ ...voucher, count });
    }

    res.status(200).json(counts);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to retrieve WiFi voucher counts", error });
  }
};

// Controller function to delete a WiFi voucher
const deleteWiFiVoucher = async (req, res) => {
  try {
    const voucherId = req.params.id;

    // Find the voucher by ID and remove it
    const deletedVoucher = await WiFiVoucher.findByIdAndRemove(voucherId);

    if (!deletedVoucher) {
      return res.status(404).json({ error: "WiFi voucher not found" });
    }

    res.status(200).json({ message: "WiFi voucher deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete WiFi voucher" });
  }
};

const editWiFiVoucher = async (req, res) => {
  try {
    const voucherId = req.params.id;
    const { speed, validity, bandwidth } = req.body;

    // Find the voucher by ID and update its properties
    const updatedVoucher = await WiFiVoucher.findByIdAndUpdate(
      voucherId,
      {
        speed,
        validity,
        bandwidth,
      },
      { new: true }
    );

    if (!updatedVoucher) {
      return res.status(404).json({ error: "WiFi voucher not found" });
    }

    res.status(200).json(updatedVoucher);
  } catch (error) {
    res.status(500).json({ error: "Failed to edit WiFi voucher" });
  }
};

const deleteManyWiFiVoucher = async (req, res) => {
  try {
    const { speed, validity, bandwidth } = req.body;

    // Validate required fields
    if (!speed || !validity || !bandwidth) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Delete matching documents
    await WiFiVoucher.deleteMany({
      speed: speed,
      validity: validity,
      bandwidth: bandwidth,
    });

    res.status(200).json({ message: "WiFi vouchers deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting WiFi vouchers" });
  }
};

const getScript = async (req, res) => {
  try {
    const response = await axios.get(
      "http://code.tidio.co/txkewoad3m6ljztgupk3qynve1zmunpr.js"
    );
    const script = response.data;
    res.send(script);
  } catch (error) {
    res.status(500).send("Error retrieving TidioChat script");
  }
};

module.exports = {
  createWiFiVoucher,
  deleteWiFiVoucher,
  editWiFiVoucher,
  getAllWiFiVouchers,
  getWiFiVoucherById,
  getWiFiVoucherByCriteria,
  deleteManyWiFiVoucher,
  getWiFiVoucherCount,
  getScript,
};
