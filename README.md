# 🛒 आपला किराणा (Aapla Kirana)
> **स्थानिक किराणा दुकानासाठी पूर्ण मराठी वेब ॲप** — ग्राहक व दुकानदार एकत्र, डायनॅमिक रोजचे भाव, डिजिटल उधारी वही (Khata Book), आणि १-क्लिक WhatsApp बिल व रिमाइंडर्स!

---

## 🌟 मुख्य वैशिष्ट्ये (Features)

1. **संपूर्ण मराठी इंटरफेस (100% Marathi UI):**
   - स्थानिक ग्राहकांसाठी समजायला आणि वापरायला एकदम सोपे.
   - 'माझी पिशवी', 'कागदी यादी पाठवा', 'उधारी वही', 'आजचे दर'.

2. **आजचे भाव (Dynamic Daily Rates) प्रणाली:**
   - किराणा सामानाचे (साखर, तेल, डाळी) भाव रोज बदलत असल्याने ग्राहक वस्तू व प्रमाण निवडतो किंवा यादीचा फोटो पाठवतो.
   - दुकानदार माल पॅक करताना त्या दिवशीचा **आजचा भाव (Daily Rate)** टाकून अंतिम बिल बनवतो.

3. **कागदी यादीचा फोटो अपलोड (Handwritten Parchi/Chitthi Upload):**
   - ग्राहक कागदावर किंवा डायरीत लिहिलेल्या किराणा यादीचा फोटो काढून थेट ॲपवरून दुकानात पाठवू शकतात.

4. **डिजिटल उधारी वही (Khata Book + 1-Click WhatsApp Reminder):**
   - गावातील/परिसरातील ग्राहकांची बाकी उधारी ट्रॅक करणे.
   - **"WhatsApp वर आठवण पाठवा"** बटनावर क्लिक करताच ग्राहकाच्या WhatsApp वर मराठी मेसेज आणि थेट **Google Pay / PhonePe UPI पेमेंट लिंक** सह मेसेज उघडतो!

5. **१-क्लिक WhatsApp बिल शेअरिंग:**
   - ऑर्डरचे बिल तयार झाल्यावर एका क्लिकवर संपूर्ण बिल तपशील आणि UPI पेमेंट लिंक ग्राहकाच्या WhatsApp वर जाते.

6. **दुकान चालू / बंद स्विच (Shop Open/Closed Toggle):**
   - दुकानदाराला हवे तेव्हा एका क्लिकवर दुकान उघडे किंवा बंद ठेवता येते.

7. **Multi-User Live Sync:**
   - **Firebase Firestore** सह रिअल-टाइम ऑर्डर आणि उधारी सिंक.
   - Firebase कीज नसतानाही लोकल स्टोरेजमध्ये त्वरित काम करते!

---

## 🚀 स्थानिक पातळीवर कसे चालवायचे (Run Locally)

```bash
cd kirana-app
npm run dev
```
ब्राउझरमध्ये उघडा: `http://localhost:3000`

---

## 🌐 GitHub वर कोड कसा टाकायचा (Push to GitHub)

तुमच्या GitHub खात्यावर **`kirana-app`** नावाचा नवीन रिपॉझिटरी (Repository) तयार करा आणि खालील कमांड्स चालवा:

```bash
git remote add origin https://github.com/<तुमचे-युझरनेम>/kirana-app.git
git branch -M main
git push -u origin main
```

---

## ⚡ Vercel वर लाईव्ह कसे करायचे (Deploy to Vercel - Free)

1. [vercel.com](https://vercel.com) वर जा आणि तुमच्या **GitHub** खात्याने लॉगिन करा.
2. **"Add New Project"** वर क्लिक करा.
3. तुमची **`kirana-app`** रिपॉझिटरी सिलेक्ट करा आणि **"Deploy"** बटनावर क्लिक करा!
4. अवघ्या १ मिनिटात तुमचे ॲप जगभरात कोठूनही वापरण्यासाठी लाईव्ह होईल (उदा. `https://kirana-app.vercel.app`).

---

## 🔥 Firebase Multi-User Live Setup (ऐच्छिक पण शिफारस केलेले)

1. [console.firebase.google.com](https://console.firebase.google.com/) वर जा.
2. **Add Project** वर क्लिक करून नवीन प्रोजेक्ट तयार करा.
3. **Build ➔ Firestore Database** मध्ये जाऊन **"Create Database"** करा (Test mode मध्ये सुरू करू शकता).
4. **Project Settings ➔ General ➔ Your apps** मध्ये **Web (`</>`)** ॲप जोडा आणि मिळालेल्या Credentials खालीलप्रमाणे `.env.local` मध्ये टाका:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

Vercel वर डिप्लॉय करताना **Project Settings ➔ Environment Variables** मध्ये या कीज टाका, म्हणजे सर्व ग्राहकांना व दुकानदाराला रिअल-टाइम लाईव्ह अपडेट्स मिळतील!
