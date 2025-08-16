import twilio from "twilio";

//twilio credential
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const serviceSid: string = process.env.TWILIO_SERVICE_SID || "";
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(accountSid, authToken);

//send otp to phone number

export const sendOtpToPhoneNumber = async (phoneNumber: string) => {
  try {
    if (!phoneNumber) {
      throw new Error("Phone number is required");
    }

    console.log("Sending OTP to:", phoneNumber);

    const response = await client.verify.v2
      .services(serviceSid)
      .verifications.create({
        to: phoneNumber,
        channel: "sms",
      });

    console.log("OTP sent successfully, SID:", response.sid);

    return response;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error sending OTP:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
    throw new Error("Failed to send OTP");
  }
};
const verifyOtp = async (phoneNumber: string, otp: string) => {
  try {
    console.log("this is my otp", otp, phoneNumber);
    const response = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({
        to: phoneNumber,
        code: otp,
      });
    console.log("this is my otp response");
    return response;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to send otp");
  }
};
