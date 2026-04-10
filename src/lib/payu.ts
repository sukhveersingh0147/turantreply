import crypto from "crypto";

export const PLANS = {
  STARTER: {
    id:           "STARTER",
    name:         "Starter",
    price:        999,
    priceDisplay: "₹999/month",
    conversations: 1000,
    description:  "Perfect for starting out",
    features: [
      "1,000 monthly conversations",
      "Appointment management",
      "10 automation rules",
      "Industry pre-loaded setup",
      "Basic analytics",
      "Lead recovery",
      "Query dashboard",
    ]
  },
  GROWTH: {
    id:           "GROWTH",
    name:         "Growth",
    price:        2499,
    priceDisplay: "₹2,499/month",
    conversations: 5000,
    description:  "Most Popular",
    features: [
      "5,000 monthly conversations",
      "Everything in Starter",
      "Unlimited automations",
      "Broadcast messaging",
      "Advanced analytics",
      "Follow-up sequences",
      "Priority support",
    ]
  },
  PRO: {
    id:           "PRO",
    name:         "Pro",
    price:        4999,
    priceDisplay: "₹4,999/month",
    conversations: -1, // unlimited
    description:  "For agencies & large businesses",
    features: [
      "Unlimited conversations",
      "Everything in Growth",
      "Multi-business dashboard",
      "White-label option",
      "Custom integrations",
      "Dedicated account manager",
    ]
  }
} as const;

export type PlanId = keyof typeof PLANS;

export function generatePayUHash(params: {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  salt: string;
  si?: string;
  si_details?: string;
}): string {
  const hashString = [
    params.key,
    params.txnid,
    params.amount,
    params.productinfo,
    params.firstname,
    params.email,
    params.udf1 || "",
    params.udf2 || "",
    params.udf3 || "",
    "", // udf4
    "", // udf5
    "", // udf6
    "", // udf7
    "", // udf8
    "", // udf9
    "", // udf10
    params.salt,
  ].join("|");

  return crypto
    .createHash("sha512")
    .update(hashString)
    .digest("hex");
}

export function verifyPayUHash(params: {
  salt: string;
  status: string;
  email: string;
  firstname: string;
  productinfo: string;
  amount: string;
  txnid: string;
  key: string;
  receivedHash: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
}): boolean {
  const hashString = [
    params.salt,
    params.status,
    "", // udf10
    "", // udf9
    "", // udf8
    "", // udf7
    "", // udf6
    "", // udf5
    "", // udf4
    params.udf3 || "",
    params.udf2 || "",
    params.udf1 || "",
    params.email,
    params.firstname,
    params.productinfo,
    params.amount,
    params.txnid,
    params.key,
  ].join("|");

  const computedHash = crypto
    .createHash("sha512")
    .update(hashString)
    .digest("hex");

  return computedHash === params.receivedHash;
}

export const PAYU_CONFIG = {
  key:         process.env.PAYU_MERCHANT_KEY!,
  salt:        process.env.PAYU_MERCHANT_SALT!,
  baseUrl:     process.env.NODE_ENV === "production"
               ? "https://secure.payu.in/_payment"
               : "https://test.payu.in/_payment",
  successUrl:  `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/payu/verify`,
  failureUrl:  `${process.env.NEXT_PUBLIC_APP_URL}/pricing?payment=failed`,
  webhookUrl:  `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/payu/webhook`,
};

export function generateTxnId(userId: string): string {
  const timestamp = Date.now();
  const random = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();
  // Format: TR-userId(6chars)-timestamp-random
  return `TR-${userId.substring(0, 6)}-${timestamp}-${random}`;
}

export function generateSIDetails(amount: number, planName: string) {
  const billingCycle = "monthly";
  const billingInterval = 1;
  
  // Format dates as DD-MM-YYYY as per PayU SI requirement
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() + 1);
  const startDateStr = `${String(startDate.getDate()).padStart(2, '0')}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${startDate.getFullYear()}`;

  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 5); // 5 years validity
  const endDateStr = `${String(endDate.getDate()).padStart(2, '0')}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${endDate.getFullYear()}`;

  const siDetails = {
    billingAmount: amount.toString(),
    billingCurrency: "INR",
    billingCycle,
    billingInterval: billingInterval.toString(),
    paymentStartDate: startDateStr,
    paymentEndDate: endDateStr,
  };

  return JSON.stringify(siDetails);
}
