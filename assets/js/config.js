/* ============================================================
   STORE SETTINGS: edit this file to change store details.
   Lines marked EDIT still need your real business information.
   ============================================================ */
export const CONFIG = {
  storeName: "Abi's Slime Lab",
  siteUrl: "https://www.abislimelab.com",
  currency: "PKR",
  country: "Pakistan",

  // WhatsApp business number: digits only, with country code, no + or spaces.
  whatsappNumber: "923331831004",
  whatsappDisplay: "+92 333 1831004",
  whatsappReplyNote: "Typically replies within minutes",

  storeEmail: "", // EDIT: public contact email, e.g. "hello@abislimelab.com". Hidden when empty.
  adminEmail: "", // EDIT: where new-order emails go. Used only by EmailJS.

  // Social links. Leave empty to hide.
  instagram: "", // EDIT
  tiktok: "",    // EDIT
  facebook: "",  // EDIT

  // Delivery charges in PKR. EDIT these to your real rates.
  shipping: {
    flatFee: 250,  // fee added to every order
    freeOver: 0,   // free delivery when subtotal reaches this amount; 0 = never free
  },
  maxQtyPerItem: 10,

  // Shows a small "Sample" tag on sample products. Set to false once real products are in.
  showSampleBadges: true,

  // Transactional emails via EmailJS (https://www.emailjs.com). See README.
  // Leave empty to switch emails off. The public key is safe to keep in the browser.
  emailjs: {
    publicKey: "",          // EDIT
    serviceId: "",          // EDIT
    customerTemplateId: "", // EDIT
    adminTemplateId: "",    // EDIT
  },

  cities: [
    "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan",
    "Peshawar", "Quetta", "Hyderabad", "Sialkot", "Gujranwala", "Abbottabad",
    "Bahawalpur", "Sargodha", "Sukkur",
  ],
  provinces: [
    "Sindh", "Punjab", "Islamabad Capital Territory", "Khyber Pakhtunkhwa",
    "Balochistan", "Gilgit-Baltistan", "Azad Jammu & Kashmir",
  ],
};
