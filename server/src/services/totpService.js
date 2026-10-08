import { authenticator } from 'otplib';
import QRCode from 'qrcode';

export const generate2FASecret = async (username) => {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(username, 'VigilEye AI', secret);
  const qrCodeUrl = await QRCode.toDataURL(otpauth);

  return {
    secret,
    otpauth,
    qrCodeUrl
  };
};

export const verify2FAToken = (token, secret) => {
  return authenticator.verify({
    token,
    secret
  });
};
