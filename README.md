# Ahmedabad Literary Society — Website

Static site, no build step required. Pure HTML/CSS/JS — upload as-is to GitHub and turn on GitHub Pages.

## Structure
```
index.html        Home
about.html         About Us
community.html     Our Community
events.html        Events
journal.html       Literary Journal
juniors.html       ALS Juniors
join.html          Join ALS
collaborate.html   Collaborate
gallery.html       Gallery
contact.html       Contact
assets/css/style.css
assets/js/main.js
```

## To publish via GitHub Pages
1. Create the repository, upload all files keeping the folder structure (the `assets` folder must stay next to the HTML files).
2. Repo → Settings → Pages → Source: `main` branch, `/root`.
3. Site goes live at `https://<username>.github.io/<repo-name>/`.

## Still needed before launch (placeholders in the code)
- Author, poet and member photographs on the Community page (grey placeholder blocks — real logo, founder photo and 17 event photos are already in)
- Confirmed membership fee/approval policy line (join.html)
- Facebook link, if ALS sets one up (currently only Instagram is linked, since that's what was provided)

## Forms — no backend, already working
Join, Literary Journal submission, ALS Juniors, Collaborate, and Contact forms all submit straight to **Ahmedabadliterarysociety@gmail.com** using FormSubmit.co — a free service that needs no account, no server and no code on your end.

**One-time step:** the very first time each form is submitted (after the site is live), FormSubmit.co sends a confirmation email to Ahmedabadliterarysociety@gmail.com asking you to click a link to activate it. Do this once per form (five clicks total) and every submission after that lands straight in the inbox.

If you'd rather use a different service later (Formspree, Getform, a Google Form), just say so and I'll swap the `action` URLs.

## Homepage title sequence
The hero holds a 15-second motion graphics piece (`assets/js/hero-reel.js`). Nothing to install, no video file — it is drawn live in the browser, so it stays sharp at any size and adds no download weight beyond one small script.

The sequence: ink falls → an open book draws itself → a tree grows from the spine, leaf by leaf → Hindi and Latin glyphs lift off the page → the artwork moves aside and the headline resolves → a real ALS photograph surfaces behind the lockup.

- Plays once when the hero scrolls into view, then rests on the final frame.
- **Replay** button re-runs it.
- Honours "reduce motion" accessibility settings: those visitors get the finished frame, no animation.
- The leaves are generated in code from the branch curves, so the canopy differs slightly on every replay.

To swap the photograph that appears at the end, change the `reel-photo` image path in `index.html`.

## Fonts
Fraunces (serif, headings) + Inter (sans, body) via Google Fonts — matches the black/charcoal editorial look.
