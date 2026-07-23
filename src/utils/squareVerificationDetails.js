/**
 * Square card.tokenize() verification payload (Web Payments SDK).
 * @see https://developer.squareup.com/docs/web-payments/take-card-payment
 */

export function splitCardholderName(fullName) {
  const parts = String(fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return {
    givenName: parts[0] || "Guest",
    familyName: parts.slice(1).join(" ") || "Customer",
  };
}

export function buildBillingContact({
  cardOwnerName,
  zipCode,
  email,
  phone,
  countryCode = "US",
}) {
  const { givenName, familyName } = splitCardholderName(cardOwnerName);
  return {
    givenName,
    familyName,
    email: email || undefined,
    phone: phone || undefined,
    addressLines: [],
    city: "",
    state: "",
    countryCode,
    postalCode: String(zipCode || "").trim(),
  };
}

/**
 * @param {object} options
 * @param {number|string} options.amountDollars
 * @param {object} options.billingContact
 * @param {'CHARGE'|'STORE'|'CHARGE_AND_STORE'} [options.intent='CHARGE']
 * @param {boolean} [options.customerInitiated=true] - buyer entered payment on your site
 * @param {boolean} [options.sellerKeyedIn=false] - MOTO / staff keyed-in (not web self-serve)
 */
export function buildSquareVerificationDetails({
  amountDollars,
  billingContact,
  intent = "CHARGE",
  customerInitiated = true,
  sellerKeyedIn = false,
  currencyCode = "USD",
}) {
  const base = {
    intent,
    customerInitiated: Boolean(customerInitiated),
    sellerKeyedIn: Boolean(sellerKeyedIn),
    billingContact,
  };

  if (intent === "STORE") {
    return base;
  }

  return {
    ...base,
    amount: String(Math.max(Number(amountDollars) || 0, 0.01).toFixed(2)),
    currencyCode,
  };
}

/** Save card on file (My Account wallet) — no amount or currency. */
export function buildStoreCardVerificationDetails({
  cardOwnerName,
  zipCode,
  email,
  phone,
}) {
  return buildSquareVerificationDetails({
    intent: "STORE",
    billingContact: buildBillingContact({
      cardOwnerName,
      zipCode,
      email,
      phone,
    }),
    customerInitiated: true,
    sellerKeyedIn: false,
  });
}

export function buildCheckoutVerificationDetails({
  amountDollars,
  cardOwnerName,
  zipCode,
  email,
  phone,
  intent = "CHARGE",
}) {
  if (intent === "STORE") {
    return buildStoreCardVerificationDetails({
      cardOwnerName,
      zipCode,
      email,
      phone,
    });
  }

  return buildSquareVerificationDetails({
    amountDollars,
    intent,
    billingContact: buildBillingContact({
      cardOwnerName,
      zipCode,
      email,
      phone,
    }),
    customerInitiated: true,
    sellerKeyedIn: false,
  });
}
