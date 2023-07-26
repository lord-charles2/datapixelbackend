const axios = require("axios");
const WiFiVoucher = require("../models/vouchers");

const sendsms = async (req, res) => {
  const { mobile, speed, validity, bandwidth } = req.body;

  const voucher = await WiFiVoucher.findOneAndDelete({
    speed: speed,
    validity: validity,
    bandwidth: bandwidth,
  });
  console.log(voucher);

  if (!voucher) {
    return res.status(404).json({ error: "No WiFi voucher found" });
  }

  const message = `Voucher: ${voucher.code}
Speed: ${voucher.speed}Mbps
Validity: ${voucher.validity}
Bandwidth: ${voucher.bandwidth}

Enjoy & contact us for assistance.
Regards, Charles`;
  let data = JSON.stringify({
    mobile: mobile,
    sender_name: "23107",
    service_id: 0,
    message: message,
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.mobitechtechnologies.com/sms/sendsms",
    headers: {
      h_api_key:
        "22dd6700b48060c8ae97dc4c4c2363d720dbbb7802050cc7701e350e580ee052",
      "Content-Type": "application/json",
    },
    data: data,
  };

  axios
    .request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
      return res.status(200).json({
        messsage: "success",
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

const sendsms2 = async (req, res) => {
  try {
    const { mobile, speed, validity, bandwidth } = req.body;
    const voucher = await WiFiVoucher.findOneAndDelete({
      speed: speed,
      validity: validity,
      bandwidth: bandwidth,
    });

    if (!voucher) {
      return res.status(404).json({ error: "No WiFi voucher found" });
    }

    const message = `Voucher: ${voucher.code}
Speed: ${voucher.speed}Mbps
Validity: ${voucher.validity}
Bandwidth: ${voucher.bandwidth}

Enjoy & contact us for assistance.
Regards, Charles`;

    const response = axios.post(
      "https://quicksms.advantasms.com/api/services/sendsms/",
      {
        apikey: "a6fc91af39ac8f2dfabc9bb0131ec022",
        partnerID: "7896",
        message: message,
        shortcode: "AdvantaSMS",
        mobile: mobile,
      }
    );
    console.log(response, "success");

    res.status(200).json({ message: "Success" });
  } catch (e) {
    console.log(e.message);
  }
};

const sendsms3 = async (req, res) => {
  try {
    const { mobile, speed, validity, bandwidth } = req.body;
    const voucher = await WiFiVoucher.findOneAndDelete({
      speed: speed,
      validity: validity,
      bandwidth: bandwidth,
    });

    if (!voucher) {
      return (
        res.status(404).json({ error: "No WiFi voucher found" }),
        axios.post("https://sms.textsms.co.ke/api/services/sendsms/", {
          apikey: "9d97e98deaa48d145fec88150ff28203",
          partnerID: "7848",
          message: `Attention! wifi vouchers depleted for ${speed}Mbps, ${validity}, ${bandwidth}, please compensate ${mobile}`,
          shortcode: "TextSMS",
          mobile: "254740315545",
        })
      );
    }

    const message = `Voucher: ${voucher.code}
Speed: ${voucher.speed}Mbps
Validity: ${voucher.validity}
Bandwidth: ${voucher.bandwidth}

Enjoy & contact us for assistance.
Regards, Charles.`;

    axios.post("https://sms.textsms.co.ke/api/services/sendsms/", {
      apikey: "9d97e98deaa48d145fec88150ff28203",
      partnerID: "7848",
      message: message,
      shortcode: "TextSMS",
      mobile: mobile,
    });

    res.status(200).json({ message: "Success" });
  } catch (e) {
    console.log(e.message);
  }
};
module.exports = { sendsms, sendsms2, sendsms3 };
