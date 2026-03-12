# Οδηγίες για Cinematic Style Fade In-Out Slideshow

Για να δημιουργήσεις ένα cinematic style slideshow με fade in-out εφέ (μαζί με ελαφρύ zoom για κινηματογραφικό αποτέλεσμα), χρησιμοποίησε τις παρακάτω οδηγίες σε CSS. Αυτό είναι βασισμένο σε pure CSS animations (χωρίς JavaScript για το slideshow, μόνο για τα glass panels αν χρειάζεται). Η διάρκεια είναι προσαρμοσμένη για ομαλό fade in-out, με συνολικό κύκλο 60 δευτερόλεκτα (ms: 60000ms) για 10 εικόνες, όπου κάθε εικόνα εμφανίζεται για περίπου 6 δευτερόλεκτα (ms: 6000ms) με overlap για smooth transition.

## 1. HTML Δομή
- Δημιούργησε ένα `<section class="hero-slideshow">` με ένα `<div class="gallery-track">` που περιέχει τις εικόνες σου (π.χ. 10 εικόνες).
- Κάθε εικόνα πρέπει να είναι `<img src="path/to/your/image.webp" alt="">`.
- Τοποθέτησε το σε full-screen height (100vh) για cinematic εφέ.

## 2. CSS για το Slideshow
- Χρησιμοποίησε αυτά τα styles για το `.hero-slideshow` και `.gallery-track img`:
  ```
  .hero-slideshow {
    position: relative;
    height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: #000; /* Μαύρο background για cinematic look */
  }

  .gallery-track img {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    opacity: 0;
    animation: fadeZoom 60s infinite; /* Συνολική διάρκεια 60000ms για κύκλο */
  }
  ```
- Για τα animation delays (ώστε οι εικόνες να εναλλάσσονται κάθε 6 δευτερόλεκτα):
  ```
  .gallery-track img:nth-child(1) { animation-delay: 0s; }     /* 0ms */
  .gallery-track img:nth-child(2) { animation-delay: 6s; }    /* 6000ms */
  .gallery-track img:nth-child(3) { animation-delay: 12s; }   /* 12000ms */
  .gallery-track img:nth-child(4) { animation-delay: 18s; }   /* 18000ms */
  .gallery-track img:nth-child(5) { animation-delay: 24s; }   /* 24000ms */
  .gallery-track img:nth-child(6) { animation-delay: 30s; }   /* 30000ms */
  .gallery-track img:nth-child(7) { animation-delay: 36s; }   /* 36000ms */
  .gallery-track img:nth-child(8) { animation-delay: 42s; }   /* 42000ms */
  .gallery-track img:nth-child(9) { animation-delay: 48s; }   /* 48000ms */
  .gallery-track img:nth-child(10){ animation-delay: 54s; }   /* 54000ms */
  ```

## 3. Το Keyframe Animation για Cinematic Fade In-Out με Zoom
- Χρησιμοποίησε αυτό το `@keyframes fadeZoom` για smooth fade in (από opacity 0 σε 1), hold, fade out (σε 0), και ελαφρύ zoom στο τέλος για cinematic εφέ:
  ```
  @keyframes fadeZoom {
    0%   { opacity: 0; transform: scale(1); }       /* Fade in start */
    3%   { opacity: 1; }                           /* Fade in complete (3% του 60s = ~1.8s) */
    15%  { opacity: 1; }                           /* Hold visible (15% = ~9s) */
    18%  { opacity: 0; transform: scale(1.05); }   /* Fade out start με zoom (18% = ~10.8s) */
    100% { opacity: 0; }                           /* Fade out complete */
  }
  ```
- **Διάρκεια εξήγησης**:
  - Συνολική animation: 60 δευτερόλεκτα (60000ms) ανά εικόνα.
  - Fade in: Από 0% έως 3% (περίπου 1800ms για fade in).
  - Hold: Από 3% έως 15% (περίπου 7200ms ορατή).
  - Fade out με zoom: Από 15% έως 18% (περίπου 1800ms για fade out, με scale(1.05) για cinematic zoom).
  - Αυτό δημιουργεί smooth transitions χωρίς απότομα cuts, με overlap μεταξύ εικόνων λόγω των delays.

## 4. Πρόσθετες Συμβουλές για Cinematic Style
- **Χρώματα και Background**: Χρησιμοποίησε μαύρο background (#000) για να τονίσεις το fade.
- **Responsive**: Πρόσθεσε media queries για mobiles (π.χ. μικρότερα padding σε glass panels αν έχεις).
- **Εικόνες**: Χρησιμοποίησε υψηλής ποιότητας εικόνες (π.χ. .webp) που ταιριάζουν σε landscape για καλύτερο εφέ. Ανάλογα με το AI που θα χρησιμοποιήσεις, πες του να εφαρμόσει αυτό το CSS σε 10 εικόνες με αυτά τα delays.
- **JavaScript (προαιρετικά)**: Αν θέλεις fade in-out για κείμενο (όπως glass panels), χρησιμοποίησε setTimeout για opacity changes (π.χ. fade in μετά 500ms, fade out μετά 6000ms).

Αυτές οι οδηγίες είναι αρκετές για να αναπαράξεις το εφέ σε οποιοδήποτε site με διαφορετικές φωτογραφίες. Αν το AI χρειάζεται περισσότερες λεπτομέρειες (π.χ. πλήρες CSS snippet), δώσ' του αυτό το κείμενο!</content>
<parameter name="filePath">slideshow_instructions.md