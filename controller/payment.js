const Payment = require("../models/payment");
const axios = require("axios");
const WiFiVoucher = require("../models/vouchers");
const uniqid = require("uniqid");

const api = axios.create({
  baseURL: "https://payment.intasend.com/api/v1/payment/",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.ISSecretKey}`,
  },
});

const stkpush = async (req, res) => {
  const userId = req.user.details._id;
  const { amount, phone_number } = req.body;
  const endpoint = "mpesa-stk-push/";

  try {
    const response = await api.post(endpoint, {
      amount,
      phone_number,
    });

    const {
      id,
      invoice,
      customer,
      payment_link,
      customer_comment,
      refundable,
      created_at,
      updated_at,
    } = response.data;

    const paymentData = {
      userId,
      id,
      invoice,
      customer,
      payment_link,
      customer_comment,
      refundable,
      created_at,
      updated_at,
    };

    const payment = await Payment.create(paymentData);
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json(error);
    console.log(error);
  }
};

const webhookTrigger = async (req, res) => {
  try {
    const { invoice_id, state, failed_reason, failed_code, account, value } =
      req.body;

    console.log(req.body.state);

    const sendCode = async (name, speed, bandwidth, devices, validity) => {
      console.log("sms starting transaction");

      const message = `Voucher: ${name}
Validity: ${validity}
Devices: ${devices}

Enjoy & contact us for assistance.
Regards, Peter.`;

      try {
        const data = JSON.stringify({
          mobile: account,
          sender_name: "23107",
          service_id: 0,
          message: message,
        });

        const config = {
          method: "post",
          maxBodyLength: Infinity,
          url: "https://api.mobitechtechnologies.com/sms/sendsms",
          headers: {
            h_api_key:
              "2cdddc70ba7baedb78fab648efb9da69937c987d88e860a5a92d3d02b6fe3150",
            "Content-Type": "application/json",
          },
          data: data,
        };

        const response = await axios.request(config);
        console.log(JSON.stringify(response.data));
      } catch (error) {
        console.log("Error sending SMS:", error);
      }

      try {
        await axios.post("https://sms.textsms.co.ke/api/services/sendsms/", {
          apikey: "62f1a8ee9cdc8cbfb7b653427b974387",
          partnerID: "8112",
          message: message,
          shortcode: "TextSMS",
          mobile: account,
        });
      } catch (error) {
        console.log("Error sending SMS:", error);
      }
    };

    const addUserToMikrotik = async (name, profile, uptime, bytes) => {
      const data = {
        "limit-bytes-total": bytes,
        "limit-uptime": uptime,
        name,
        password: name,
        profile,
        server: "hotspot1",
      };

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "http://id-9.hostddns.us:12605/rest/ip/hotspot/user/add",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic YWRtaW46MDAwMA==",
        },
        data: data,
      };

      try {
        const response = await axios.request(config);
        console.log(response.data);
      } catch (error) {
        try {
          await axios.post("https://sms.textsms.co.ke/api/services/sendsms/", {
            apikey: "9d97e98deaa48d145fec88150ff28203",
            partnerID: "7848",
            message: `Something went wrong for account ${account}, package ${value}, please review ASAP.`,
            shortcode: "TextSMS",
            mobile: 254740315545,
          });

          await axios.post("https://sms.textsms.co.ke/api/services/sendsms/", {
            apikey: "9d97e98deaa48d145fec88150ff28203",
            partnerID: "7848",
            message: `We are processing your voucher, please wait.`,
            shortcode: "TextSMS",
            mobile: account,
          });
        } catch (nestedError) {
          console.log("Error sending SMS:", nestedError);
        }
        console.log("Error adding user to Mikrotik:", error);
      }
    };

    const generateUniqueCode = () => {
      const currentDate = new Date();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");
      let hours = String(currentDate.getHours() + 3).padStart(2, "0");
      const minutes = String(currentDate.getMinutes()).padStart(2, "0");
      const seconds = String(currentDate.getSeconds()).padStart(2, "0");

      // Convert hours to 12-hour format
      if (hours > 12) {
        hours -= 12;
      }

      return `${month}${day}${hours}${minutes}${seconds}`;
    };

    if (
      failed_reason === "Request cancelled by user" ||
      failed_reason ===
        "Failed to initiate transaction. Ensure your phone is on and sim card updated. Dial *234*1*6# from your Safaricom sim card to update it and try again."
    ) {
      try {
        await axios.post("https://sms.textsms.co.ke/api/services/sendsms/", {
          apikey: "9d97e98deaa48d145fec88150ff28203",
          partnerID: "7848",
          message: `Apologies for the inconvenience faced during your attempt to purchase the ClassicsNetPro package. Kindly contact us @ 0740315545 for immediate assistance.`,
          shortcode: "TextSMS",
          mobile: account,
        });
      } catch (error) {
        console.log("Error sending SMS:", error);
      }
    }

    if (state === "COMPLETE") {
      if (value === "19.00") {
        const profile = "8mbps-20bob-50gb-3hrs";
        const name = generateUniqueCode();
        const uptime = "3h";
        const bytes = "50000000000";
        const speed = "8Mbps";
        const bandwidth = "50GB";
        const devices = "2";
        const validity = "3hours";
        try {
          await addUserToMikrotik(
            name,
            profile,
            uptime,
            bytes,
            speed,
            bandwidth,
            devices,
            validity
          );
          await sendCode(name, speed, bandwidth, devices, validity);
        } catch (error) {
          console.log("Error adding user and sending code:", error);
        }
      } else if (value === "7.00") {
        const profile = "8mbps-7bob-50gb-1hour";
        const name = generateUniqueCode();
        const uptime = "1h";
        const bytes = "50000000000";
        const speed = "8Mbps";
        const bandwidth = "50GB";
        const devices = "2";
        const validity = "1hour";
        try {
          await addUserToMikrotik(
            name,
            profile,
            uptime,
            bytes,
            speed,
            bandwidth,
            devices,
            validity
          );
          await sendCode(name, speed, bandwidth, devices, validity);
        } catch (error) {
          console.log("Error adding user and sending code:", error);
        }
      } else if (value === "10.00") {
        const profile = "3mbps-10bob";
        const name = generateUniqueCode();
        const uptime = "2h";
        const bytes = "4000000000";
        const speed = "10Mbps";
        const bandwidth = "5GB";
        const devices = "2";
        const validity = "1hour 45minutes";
        try {
          await addUserToMikrotik(
            name,
            profile,
            uptime,
            bytes,
            speed,
            bandwidth,
            devices,
            validity
          );
          await sendCode(name, speed, bandwidth, devices, validity);
        } catch (error) {
          console.log("Error adding user and sending code:", error);
        }
      } else if (value === "20.00") {
        const profile = "10mbps-20bob-5gb-24hrs";
        const name = generateUniqueCode();
        const uptime = "24h";
        const bytes = "40000000000";
        const speed = "10Mbps";
        const bandwidth = "5GB";
        const devices = "2";
        const validity = "24hours";
        try {
          await addUserToMikrotik(
            name,
            profile,
            uptime,
            bytes,
            speed,
            bandwidth,
            devices,
            validity
          );
          await sendCode(name, speed, bandwidth, devices, validity);
        } catch (error) {
          console.log("Error adding user and sending code:", error);
        }
      } else if (value === "30.00") {
        const profile = "5mbps-24hrs-ksh30-50gb";
        const name = generateUniqueCode();
        const uptime = "12h";
        const bytes = "400000000000";
        const speed = "5Mbps";
        const bandwidth = "50GB";
        const devices = "2";
        const validity = "12hours";
        try {
          await addUserToMikrotik(
            name,
            profile,
            uptime,
            bytes,
            speed,
            bandwidth,
            devices,
            validity
          );
          await sendCode(name, speed, bandwidth, devices, validity);
        } catch (error) {
          console.log("Error adding user and sending code:", error);
        }
      } else if (value === "35.00") {
        const profile = "4mbps-35bob-10gb-24hrs";
        const name = generateUniqueCode();
        const uptime = "24h";
        const bytes = "80000000000";
        const speed = "5Mbps";
        const bandwidth = "10GB";
        const devices = "2";
        const validity = "24hours";
        try {
          await addUserToMikrotik(
            name,
            profile,
            uptime,
            bytes,
            speed,
            bandwidth,
            devices,
            validity
          );
          await sendCode(name, speed, bandwidth, devices, validity);
        } catch (error) {
          console.log("Error adding user and sending code:", error);
        }
      } else if (value === "25.00") {
        const profile = "4mbps-25bob-6gb-24hrs";
        const name = generateUniqueCode();
        const uptime = "21h";
        const bytes = "8000000000";
        const speed = "10Mbps";
        const bandwidth = "6GB";
        const devices = "2";
        const validity = "24hours";
        try {
          await addUserToMikrotik(
            name,
            profile,
            uptime,
            bytes,
            speed,
            bandwidth,
            devices,
            validity
          );
          await sendCode(name, speed, bandwidth, devices, validity);
        } catch (error) {
          console.log("Error adding user and sending code:", error);
        }
      }
    }

    const filter = { "invoice.invoice_id": invoice_id };
    const update = {
      $set: {
        "invoice.state": state,
        "invoice.failed_reason": failed_reason,
        "invoice.failed_code": failed_code,
      },
    };

    const updatedPayment = await Payment.findOneAndUpdate(filter, update, {
      new: true,
    });

    console.log("code completed");

    res.status(200).json({
      message: "Payload received successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating payment" });
  }
};

const paymentStatus = async (req, res) => {
  const options = {
    method: "POST",
    url: "https://payment.intasend.com/api/v1/payment/status/",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "X-IntaSend-Public-API-Key": process.env.ISPubKey,
    },
    data: { invoice_id: req.body.invoice_id },
  };

  try {
    const response = await axios.request(options);
    return res.json(response.data);
  } catch (error) {
    return res.status(500).json({ error: "An error occurred", error });
  }
};

module.exports = { webhookTrigger, stkpush, paymentStatus };
