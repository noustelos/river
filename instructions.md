PROJECT CONTEXT

The project is a static landing page for the Vouraikos Gorge UNESCO Global Geopark.

Current site:
https://noustelos.github.io/river/

Goal:
Upgrade the visual design and UX quality to a cinematic, documentary-style presentation similar to National Geographic or UNESCO nature portals.

IMPORTANT RULES

Do NOT rebuild the site.
Do NOT change the file architecture.
Do NOT introduce frameworks.
Only improve layout, CSS, typography, and section composition.

Keep the code simple, readable, and static-host friendly (GitHub Pages compatible).

Focus on:
- visual hierarchy
- cinematic imagery
- typography contrast
- spacing rhythm
- premium feel

--------------------------------------------------

GLOBAL DESIGN SYSTEM

Introduce a clean design system using CSS variables.

:root {

--gorge-green:#2F5D50;
--stone-gray:#5A5F63;
--river-teal:#3C8D8A;
--olive-earth:#6F7F3B;
--rust-iron:#A35C2A;

--limestone:#F5F3EE;
--mist:#E8ECE9;

--accent-gold:#C6A85A;

}

--------------------------------------------------

TYPOGRAPHY SYSTEM

Introduce clear hierarchy.

Headings:
Playfair Display

Body:
Source Sans 3

UI / Navigation:
Inter

Font scale:

H1: 64px
H2: 42px
H3: 30px
Body: 18px
Line height: 1.7

Example CSS:

h1{
font-family:"Playfair Display",serif;
font-size:64px;
letter-spacing:-0.02em;
}

h2{
font-family:"Playfair Display",serif;
font-size:42px;
}

body{
font-family:"Source Sans 3",sans-serif;
font-size:18px;
line-height:1.7;
color:#333;
}

nav,button{
font-family:"Inter",sans-serif;
letter-spacing:0.08em;
}

--------------------------------------------------

LAYOUT SYSTEM

Create consistent spacing.

.container{
max-width:1200px;
margin:auto;
padding-left:24px;
padding-right:24px;
}

.section{
padding:100px 0;
}

.section-narrow{
padding:60px 0;
}

--------------------------------------------------

HERO SECTION UPGRADE

Transform the hero into a cinematic fullscreen section.

Requirements:

Height = 100vh
Centered title
Dark gradient overlay
Large typography

.hero{
height:100vh;
display:flex;
align-items:center;
justify-content:center;
text-align:center;
position:relative;
color:white;
background-size:cover;
background-position:center;
}

.hero::after{
content:"";
position:absolute;
inset:0;
background:linear-gradient(
to bottom,
rgba(0,0,0,0.25),
rgba(0,0,0,0.55)
);
}

.hero-content{
position:relative;
z-index:2;
}

--------------------------------------------------

STORY SECTION IMPROVEMENT

Convert text blocks into editorial layouts.

Use alternating grid.

.story-grid{
display:grid;
grid-template-columns:1fr 1fr;
gap:80px;
align-items:center;
}

Alternate image and text per section.

--------------------------------------------------

FULL WIDTH IMAGE SECTIONS

Add cinematic breathing moments.

.image-break{
height:60vh;
background-size:cover;
background-position:center;
}

Use these between content sections to create rhythm.

--------------------------------------------------

PARALLAX FEATURE SECTION

Add a quote section.

.parallax{
background-attachment:fixed;
background-size:cover;
background-position:center;
padding:160px 0;
color:white;
text-align:center;
font-size:32px;
font-family:"Playfair Display",serif;
}

--------------------------------------------------

GALLERY UPGRADE

Remove sliders.

Implement masonry gallery.

.gallery{
columns:3;
column-gap:20px;
}

.gallery img{
width:100%;
margin-bottom:20px;
border-radius:4px;
}

--------------------------------------------------

CARD GRID FOR EXPERIENCES

.experience-grid{
display:grid;
grid-template-columns:repeat(4,1fr);
gap:30px;
}

.card{
background:var(--mist);
padding:40px;
border-radius:6px;
transition:transform .3s ease;
}

.card:hover{
transform:translateY(-5px);
}

--------------------------------------------------

BUTTON STYLE

Upgrade buttons to premium style.

.btn{
background:var(--accent-gold);
color:white;
padding:14px 32px;
border-radius:4px;
text-transform:uppercase;
letter-spacing:0.08em;
transition:all .25s ease;
}

.btn:hover{
transform:translateY(-2px);
box-shadow:0 10px 30px rgba(0,0,0,0.2);
}

--------------------------------------------------

FOOTER IMPROVEMENT

Add structured layout.

.footer{
background:#1f2b2b;
color:#ddd;
padding:60px 0;
}

.footer-grid{
display:grid;
grid-template-columns:2fr 1fr 1fr 1fr;
gap:40px;
}

--------------------------------------------------

PERFORMANCE RULES

Images must be optimized.

Hero images: 2000px width
Gallery images: 1200px width
Use modern compression.

Avoid heavy JS.

--------------------------------------------------

5 REDESIGN TWEAKS THAT DRAMATICALLY IMPROVE PERCEIVED QUALITY
(WITH MINIMAL CODE CHANGES)

1. Increase vertical spacing

.section{
padding:120px 0;
}

Luxury design uses space.

--------------------------------------------------

2. Add subtle hover motion

.card:hover{
transform:translateY(-6px);
transition:0.3s ease;
}

Motion adds perceived polish.

--------------------------------------------------

3. Introduce soft shadows

.card{
box-shadow:0 10px 30px rgba(0,0,0,0.08);
}

This adds depth instantly.

--------------------------------------------------

4. Slight border radius everywhere

img, .card, .btn{
border-radius:6px;
}

Makes the design modern.

--------------------------------------------------

5. Use large cinematic imagery

Ensure at least one section per screen that is dominated by imagery.

Example:

FULL WIDTH IMAGE
TEXT BLOCK
FULL WIDTH IMAGE
GRID
PARALLAX

--------------------------------------------------

FINAL RESULT EXPECTATION

The landing page should feel:

cinematic
calm
nature-focused
editorial
premium

The experience should resemble a nature documentary introduction rather than a typical tourism website.
