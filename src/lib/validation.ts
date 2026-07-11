export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  // Block obviously fake domains
  const domain = email.split("@")[1]?.toLowerCase();
  const blockedDomains = ["test.com", "fake.com", "example.com", "temp.com"];
  if (blockedDomains.includes(domain)) return "Please use a real email address";
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (password.length < 6) return "Password must be at least 6 characters";
  if (!/[a-zA-Z]/.test(password)) return "Password must contain at least one letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  const specialChars = password.replace(/[a-zA-Z0-9]/g, "");
  if (specialChars.length === 0) return "Password must contain exactly one special character";
  if (specialChars.length > 1) return "Password must contain exactly one special character";
  return null;
};

export const citiesByState: Record<string, string[]> = {
  Abia: ["Aba", "Umuahia", "Ohafia", "Arochukwu"],
  Adamawa: ["Yola", "Mubi", "Jimeta", "Numan"],
  "Akwa Ibom": ["Uyo", "Eket", "Ikot Ekpene", "Oron"],
  Anambra: ["Awka", "Onitsha", "Nnewi", "Ekwulobia"],
  Bauchi: ["Bauchi", "Azare", "Misau", "Jama'are"],
  Bayelsa: ["Yenagoa", "Brass", "Ogbia", "Sagbama"],
  Benue: ["Makurdi", "Gboko", "Otukpo", "Katsina-Ala"],
  Borno: ["Maiduguri", "Biu", "Damboa", "Dikwa"],
  "Cross River": ["Calabar", "Ogoja", "Ikom", "Obudu"],
  Delta: ["Asaba", "Warri", "Sapele", "Ughelli"],
  Ebonyi: ["Abakaliki", "Afikpo", "Onueke", "Ishielu"],
  Edo: ["Benin City", "Auchi", "Ekpoma", "Uromi"],
  Ekiti: ["Ado-Ekiti", "Ikere", "Oye", "Ijero"],
  Enugu: ["Enugu", "Nsukka", "Agbani", "Udi"],
  Gombe: ["Gombe", "Kaltungo", "Dukku", "Billiri"],
  Imo: ["Owerri", "Orlu", "Okigwe", "Oguta"],
  Jigawa: ["Dutse", "Hadejia", "Gumel", "Kazaure"],
  Kaduna: ["Kaduna", "Zaria", "Kafanchan", "Kagoro"],
  Kano: ["Kano", "Wudil", "Gwarzo", "Rano"],
  Katsina: ["Katsina", "Daura", "Funtua", "Malumfashi"],
  Kebbi: ["Birnin Kebbi", "Argungu", "Yauri", "Zuru"],
  Kogi: ["Lokoja", "Okene", "Idah", "Kabba"],
  Kwara: ["Ilorin", "Offa", "Jebba", "Lafiagi"],
  Lagos: ["Ikeja", "Lagos Island", "Lekki", "Surulere", "Yaba", "Victoria Island", "Ikoyi", "Ajah", "Epe", "Badagry"],
  Nasarawa: ["Lafia", "Keffi", "Akwanga", "Nasarawa"],
  Niger: ["Minna", "Bida", "Suleja", "Kontagora"],
  Ogun: ["Abeokuta", "Sagamu", "Ijebu-Ode", "Ota"],
  Ondo: ["Akure", "Ondo", "Owo", "Ikare"],
  Osun: ["Osogbo", "Ile-Ife", "Ilesa", "Ede"],
  Oyo: ["Ibadan", "Ogbomoso", "Oyo", "Iseyin"],
  Plateau: ["Jos", "Bukuru", "Pankshin", "Shendam"],
  Rivers: ["Port Harcourt", "Obio-Akpor", "Eleme", "Bonny"],
  Sokoto: ["Sokoto", "Tambuwal", "Bodinga", "Gwadabawa"],
  Taraba: ["Jalingo", "Wukari", "Takum", "Bali"],
  Yobe: ["Damaturu", "Potiskum", "Gashua", "Nguru"],
  Zamfara: ["Gusau", "Kaura Namoda", "Talata Mafara", "Anka"],
  FCT: ["Abuja", "Gwagwalada", "Kuje", "Bwari", "Kwali"],
};