// ─── All API Endpoints ────────────────────────────────────────────────────────
// Single source of truth for every API URL in the project.
// Import from here — never hardcode URLs in components.

export const ENDPOINTS = {

    // ── Auth / Register ───────────────────────────────────────────────────────
    SEND_MOBILE_OTP:        "/users/auth/send-mobile-otp/",
    VERIFY_PHONE_OTP:       "/users/auth/verify-mobile-otp/",
    RESEND_MOBILE_OTP:      "/users/auth/resend-whatsapp-mobile-otp/",
    SEND_EMAIL_OTP:         "/users/auth/email-register/",
    VERIFY_EMAIL_OTP:       "/users/auth/verify-email/",
    RESEND_EMAIL_OTP:       "/users/auth/resend-email-otp/",
    REGISTER_FIRST:         "/users/auth/first-register/",
    REGISTER_SECOND:        "/users/auth/second-register/",

    // ── Auth / Login ──────────────────────────────────────────────────────────
    LOGIN:                  "/users/auth/login/",
    VERIFY_2FA:             "/users/auth/verify-2fa/",

    // ── Forgot Password ───────────────────────────────────────────────────────
    FORGOT_ACCOUNT:         "/users/auth/forgot-account/",
    FORGOT_RESEND_OTP:      "/users/auth/forgot-resend-otp/",
    VERIFY_FORGOT_OTP:      "/users/auth/verify-forgot-otp/",
    FORGOT_PASSWORD:        "/users/auth/forgot-password/",

    // ── User ──────────────────────────────────────────────────────────────────
    USER_DETAILS:           "/users/auth/user-details/",
    UPDATE_DEVICE_TOKEN:    "/users/auth/update-device-token/",
    AVATAR_UPLOAD:          "/users/auth/avatar/",
    PIN_RESET:              "/users/pin/reset/",
    PIN_CHANGE_SEND_OTP:    "/finance/change-pin/",
    PIN_CHANGE_VERIFY_OTP:  "/finance/verify/change-pin/",
    LOGOUT:                 "/users/auth/logout/",

    // ── Finance / Wallet ──────────────────────────────────────────────────────
    /** Usage: `WALLET_DETAILS("YTP")` → `/finance/wallet/YTP/details/` */
    WALLET_DETAILS:         (ticker: string) => `/finance/wallet/${ticker}/details/`,
    BALANCE_CONVERSION:     "/finance/retreave_balance_conversion/",

    // ── Buy Assets ─────────────────────────────────────────────────────────
    CRYPTO_ASSET_LIST:      "/finance/currency/crypto/list",
    FIAT_CURRENCY_LIST:     "/finance/currency/fiat/list",
    BUY_ASSETS:             "/finance/sell/fiat_to_ytp/",
    SELL_ASSETS:            "/finance/sell/ytp_to_fiat/",
    WITHDRAW_FIAT:          "/finance/withdraw/fiat/create/",
    WITHDRAW_LIST:          "/finance/withdraw/fiat/list/",
    COIN_VALUE:             (ticker: string) => `/finance/coin/${ticker}/value/`,
    SEND_AMOUNT:            "/finance/send/amount/",
    TRANSACTION_LIST:       "/finance/transactions/list",
    TRANSACTION_FILTER:     "/finance/transaction/list/by_trans_type/",

    // ── Deposit / Add Fund ──────────────────────────────────────────────────
    DEPOSIT_FIAT_REQUEST:   "/finance/deposit/fiat/request/",
    DEPOSIT_FIAT_CREATE:    "/finance/deposit/fiat/create/",

    // ── Bank Details ─────────────────────────────────────────────────────────
    BANK_DETAILS_CREATE:    "/finance/bank-account-details/create/",
    BANK_DETAILS_LIST:      "/finance/bank-account-details/list/",

    // ── KYC ───────────────────────────────────────────────────────────────────
    KYC_SUBMIT:             "/finance/kyc/submit/",
    KYC_LIST:               "/finance/kyc/list",
    KYC_STATUS:             "/finance/kyc/kyc-status/",
    KYC_VERIFY_PAN:         "/finance/kyc/verifyPanNumber/",
    KYC_AADHAAR_GET_OTP:    "/finance/kyc/getOtpAadhar/",
    KYC_AADHAAR_VERIFY_OTP: "/finance/kyc/verifyOtpAadhar/",

    // ── Staking ───────────────────────────────────────────────────────────────
    STAKING_CARD_DETAILS:   "/stakes/staking/types/list/",
    STAKING_CARD_BY_ID:     (id: number) => `/stakes/staking/type/${id}/details/`,
    CREATE_STAKING:         "/stakes/staking/create/",
    STAKING_PORTFOLIO:      "/stakes/staking/list/",
    STAKING_ADD_REMOVE:     "stakes/staking/addOrRemove/",
    STAKING_UNLOCK:         "stakes/staking/release/",
    STAKING_REWARDS:        "/stakes/staking-rois/list/",

    // ── Referral / Promotion ────────────────────────────────────────────────
    USER_REFERRAL:          "/promotion/user-referral/",
    CUSTOM_REFERRAL_LINK:   "/promotion/referral/link/customize/",
    REFERRED_USER_LIST:     "/promotion/referral/relationships/list/",
    ADD_SPONSOR:            "/promotion/referral/link/attachsponsor/",
    TASK_LIST:              "/promotion/user-welcome-task/list/",
    IPHONE_TASK_LIST:       "/promotion/user-task/list/",
    CLAIM_REWARD:           "/promotion/offers/claim-offer/",
    TASK_CREATE:            "/promotion/task/social_media/create/",
    SUB_TASK_CREATE:        "/promotion/sub_task/social_media/create/",
    SOCIAL_MEDIA_FOLLOW:    "/promotion/tasks/social-follow/",
    START_IPHONE_POOL:      "/promotion/iphone-pool/",

};
