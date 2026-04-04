import crypto from "crypto";

export const PLANS = {
  starter: {
    id:           "starter",
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
    ],
    notIncluded: [
      "Broadcast messaging",
      "Advanced analytics",
      "Follow-up sequences",
    ]
  },
  growth: {
    id:           "growth",
    name:         "Growth",
    price:        2999,
    priceDisplay: "₹2,999/month",
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
      "All 6 vertical templates",
    ],
    notIncluded: [
      "Multi-business dashboard",
      "White-label",
    ]
  },
  agency: {
    id:           "agency",
    name:         "Agency",
    price:        9999,
    priceDisplay: "₹9,999/month",
    conversations: -1,  // unlimited
    description:  "For agencies & large businesses",
    features: [
      "Unlimited conversations",
      "Everything in Growth",
      "Multi-business dashboard",
      "White-label option",
      "Custom integrations",
      "Dedicated account manager",
      "API access",
      "Priority WhatsApp support",
    ],
    notIncluded: []
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
}): string {
  const hashString = [
    params.key,
    params.txnid,
    params.amount,
    params.productinfo,
    params.firstname,
    params.email,
    params.udf1 || "",  // udf1
    params.udf2 || "",  // udf2
    params.udf3 || "",  // udf3
    "",  // udf4
    "",  // udf5
    "",  // udf6
    "",  // udf7
    "",  // udf8
    "",  // udf9
    "",  // udf10
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
    "",  // udf10
    "",  // udf9
    "",  // udf8
    "",  // udf7
    "",  // udf6
    "",  // udf5
    "",  // udf4
    params.udf3 || "",  // udf3
    params.udf2 || "",  // udf2
    params.udf1 || "",  // udf1
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

export function generateTxnId(userId: string): string {
  const timestamp = Date.now();
  const random = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();
  // Format: TR-userId(6chars)-timestamp-random
  return `TR-${userId.substring(0, 6)}-${timestamp}-${random}`;
}

export const PAYU_CONFIG = {
  key:         process.env.PAYU_MERCHANT_KEY!,
  salt:        process.env.PAYU_MERCHANT_SALT!,
  baseUrl:     process.env.NODE_ENV === "production"
               ? "https://secure.payu.in"
               : "https://test.payu.in",
  successUrl:  `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/payu/verify`,
  failureUrl:  `${process.env.NEXT_PUBLIC_APP_URL}/pricing?payment=failed`,
  webhookUrl:  `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/payu/webhook`,
};

export function getSIParams(planId: PlanId) {
  const plan = PLANS[planId];
  return {
    si:                  "1",
    si_merchant_id:      process.env.PAYU_MERCHANT_KEY!,
    si_amount:           plan.price.toString(),
    si_currency:         "INR",
    si_desc:             `TurantReply ${plan.name} Plan`,
    si_start_date:       getNextMonthDate(),
    si_end_date:         getFutureDate(24), // 2 years
    si_interval_units:   "month",
    si_interval:         "1",
    si_resume_date:      getNextMonthDate(),
    si_resume_amount:    plan.price.toString(),
  };
}

function getNextMonthDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().split("T")[0]
    .split("-").reverse().join("-");
}

function getFutureDate(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0]
    .split("-").reverse().join("-");
}
